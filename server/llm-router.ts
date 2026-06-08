import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import { getProductWithScore } from "./db-helpers";

export const llmRouter = router({
  /**
   * Analyze product reviews for pain points and improvement opportunities
   */
  analyzeReviews: publicProcedure
    .input(z.object({ asin: z.string() }))
    .mutation(async ({ input }) => {
      const productData = await getProductWithScore(input.asin);
      if (!productData) {
        throw new Error("Product not found");
      }

      const { product, score } = productData;

      const prompt = `你是一位亚马逊产品分析专家。请根据以下产品信息分析用户可能的痛点、高频抱怨和功能缺失，并提出具体的产品改良建议。

产品信息：
- 标题：${product.title}
- 类目：${product.category}
- 价格：$${product.price}
- 评分：${product.rating}/5
- 评论数：${product.reviewCount}
- 卖家数：${product.sellerCount}
- 重量：${product.weight}kg
- 尺寸：${product.dimensions}

评分分析：
- 竞争度评分：${score?.competitionScore || "N/A"}/25
- 利润空间评分：${score?.profitScore || "N/A"}/25
- 差异化评分：${score?.differentiationScore || "N/A"}/30
- 开发难度评分：${score?.developmentScore || "N/A"}/20
- 总分：${score?.totalScore || "N/A"}/100

请提供：
1. 用户可能的主要痛点（3-5个）
2. 常见的功能缺失
3. 具体的产品改良建议
4. 差异化开发方向
5. 预期的改良后市场反应`;

      try {
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: "你是一位资深的亚马逊产品分析师，擅长从数据中发现产品改良机会。",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
        });

        const analysis = response.choices[0].message.content || "";

        return {
          asin: input.asin,
          analysis,
          analyzedAt: new Date(),
        };
      } catch (error) {
        throw new Error(`LLM 分析失败: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }),

  /**
   * Generate structured product selection report
   */
  generateReport: publicProcedure
    .input(z.object({ asin: z.string() }))
    .mutation(async ({ input }) => {
      const productData = await getProductWithScore(input.asin);
      if (!productData) {
        throw new Error("Product not found");
      }

      const { product, score } = productData;

      if (!score || (score.grade !== "A" && score.grade !== "B")) {
        throw new Error("Only A/B grade products can generate reports");
      }

      const prompt = `你是一位专业的亚马逊选品顾问。请为以下产品生成一份结构化的选品分析报告。

产品信息：
- ASIN：${product.asin}
- 标题：${product.title}
- 类目：${product.category}
- 价格：$${product.price}
- 评分：${product.rating}/5
- 评论数：${product.reviewCount}
- 卖家数：${product.sellerCount}

评分结果：
- 总分：${score.totalScore}/100
- 推荐等级：${score.grade}级
- 竞争度：${score.competitionScore}/25
- 利润空间：${score.profitScore}/25
- 差异化：${score.differentiationScore}/30
- 开发难度：${score.developmentScore}/20

请生成包含以下部分的报告：

## 产品概览
简要介绍产品的市场地位和机会

## 竞争格局分析
- 当前市场竞争情况
- 主要竞争对手分析
- 差异化机会

## 利润测算
- 预估采购成本
- 物流成本分析
- 亚马逊费用估计
- 预期利润空间

## 开发建议
- 产品改良方向
- 开发周期评估
- 供应链考虑

## 风险提示
- 主要风险因素
- 市场风险
- 运营风险

## 建议行动
- 下一步研究方向
- 优先级排序
- 时间规划`;

      try {
        const response = await invokeLLM({
          messages: [
            {
              role: "system",
              content: "你是一位专业的亚马逊选品顾问和市场分析师。",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
        });

        const report = response.choices[0].message.content || "";

        return {
          asin: input.asin,
          productTitle: product.title,
          grade: score.grade,
          totalScore: score.totalScore,
          report,
          generatedAt: new Date(),
        };
      } catch (error) {
        throw new Error(`报告生成失败: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }),
});
