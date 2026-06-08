import { useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Download } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";
import { toast } from "sonner";

export default function ProductDetail() {
  const [, params] = useRoute("/product/:asin");
  const [, navigate] = useLocation();
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<string>("");
  const [report, setReport] = useState<string>("");
  const [generatingReport, setGeneratingReport] = useState(false);

  const asin = params?.asin;
  const { data: productData, isLoading } = trpc.product.getProduct.useQuery(
    { asin: asin || "" },
    { enabled: !!asin }
  );

  const analyzeReviewsMutation = trpc.llm.analyzeReviews.useMutation();
  const generateReportMutation = trpc.llm.generateReport.useMutation();

  const handleAnalyzeReviews = async () => {
    if (!productData?.product) return;

    setAnalyzing(true);
    try {
      const result = await analyzeReviewsMutation.mutateAsync({
        asin: productData.product.asin,
      });
      const analysisText = typeof result.analysis === 'string' ? result.analysis : JSON.stringify(result.analysis);
      setAnalysis(analysisText);
      toast.success("分析完成");
    } catch (error) {
      toast.error("分析失败: " + (error instanceof Error ? error.message : "未知错误"));
    } finally {
      setAnalyzing(false);
    }
  };

  const handleGenerateReport = async () => {
    if (!productData?.product) return;

    setGeneratingReport(true);
    try {
      const result = await generateReportMutation.mutateAsync({
        asin: productData.product.asin,
      });
      const reportText = typeof result.report === 'string' ? result.report : JSON.stringify(result.report);
      setReport(reportText);
      toast.success("报告生成成功");
    } catch (error) {
      toast.error("报告生成失败: " + (error instanceof Error ? error.message : "未知错误"));
    } finally {
      setGeneratingReport(false);
    }
  };

  const handleExportReport = () => {
    if (!report) return;
    const element = document.createElement("a");
    const file = new Blob([report], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `report-${productData?.product.asin}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success("报告已导出");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  if (!productData) {
    return (
      <div className="p-8">
        <Button variant="outline" onClick={() => navigate("/products")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回列表
        </Button>
        <div className="mt-8 text-center text-gray-500">产品未找到</div>
      </div>
    );
  }

  const { product, score } = productData;

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <Button variant="outline" onClick={() => navigate("/products")} className="mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        返回列表
      </Button>

      {/* Basic Info */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>产品基础信息</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600">ASIN</p>
              <p className="font-mono text-lg">{product.asin}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">产品标题</p>
              <p className="text-lg">{product.title}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">类目</p>
              <p className="text-lg">{product.category}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">价格</p>
              <p className="text-lg font-bold">${product.price}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">评分</p>
              <p className="text-lg">{product.rating}/5.0</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">评论数</p>
              <p className="text-lg">{product.reviewCount}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">卖家数</p>
              <p className="text-lg">{product.sellerCount}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">重量</p>
              <p className="text-lg">{product.weight}kg</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">尺寸</p>
              <p className="text-lg">{product.dimensions}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">关键词</p>
              <p className="text-lg">{product.keyword}</p>
            </div>
            {product.productUrl && (
              <div>
                <p className="text-sm text-gray-600">产品链接</p>
                <a href={product.productUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  查看亚马逊
                </a>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Scoring Results */}
      {score && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>评分结果</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded">
                <p className="text-sm text-gray-600">竞争度评分</p>
                <p className="text-3xl font-bold text-blue-600">{score.competitionScore}</p>
                <p className="text-xs text-gray-500 mt-1">满分 25</p>
              </div>
              <div className="bg-green-50 p-4 rounded">
                <p className="text-sm text-gray-600">利润空间评分</p>
                <p className="text-3xl font-bold text-green-600">{score.profitScore}</p>
                <p className="text-xs text-gray-500 mt-1">满分 25</p>
              </div>
              <div className="bg-purple-50 p-4 rounded">
                <p className="text-sm text-gray-600">差异化评分</p>
                <p className="text-3xl font-bold text-purple-600">{score.differentiationScore}</p>
                <p className="text-xs text-gray-500 mt-1">满分 30</p>
              </div>
              <div className="bg-orange-50 p-4 rounded">
                <p className="text-sm text-gray-600">开发难度评分</p>
                <p className="text-3xl font-bold text-orange-600">{score.developmentScore}</p>
                <p className="text-xs text-gray-500 mt-1">满分 20</p>
              </div>
              <div className="bg-gray-100 p-4 rounded">
                <p className="text-sm text-gray-600">总分</p>
                <p className="text-3xl font-bold">{score.totalScore}</p>
                <p className="text-xs text-gray-500 mt-1">满分 100</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">推荐等级</p>
                <span
                  className={`inline-block px-4 py-2 rounded text-white font-bold text-lg ${
                    score.grade === "A"
                      ? "bg-green-600"
                      : score.grade === "B"
                      ? "bg-blue-600"
                      : score.grade === "C"
                      ? "bg-amber-600"
                      : "bg-red-600"
                  }`}
                >
                  {score.grade === "A" && "A级 - 强烈推荐"}
                  {score.grade === "B" && "B级 - 值得关注"}
                  {score.grade === "C" && "C级 - 可观察"}
                  {score.grade === "D" && "D级 - 不推荐"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {score && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>推荐原因</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{score.recommendReason}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>风险提示</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700">{score.riskReason}</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* LLM Analysis */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>AI 差评分析</CardTitle>
            <Button onClick={handleAnalyzeReviews} disabled={analyzing}>
              {analyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  分析中...
                </>
              ) : (
                "开始分析"
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {analysis ? (
            <div className="bg-gray-50 p-4 rounded whitespace-pre-wrap text-sm text-gray-700">{analysis}</div>
          ) : (
            <p className="text-gray-500">点击"开始分析"按钮，AI 将自动分析用户痛点和改良机会</p>
          )}
        </CardContent>
      </Card>

      {/* Report Generation */}
      {score && (score.grade === "A" || score.grade === "B") && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>选品分析报告</CardTitle>
              <div className="flex gap-2">
                <Button onClick={handleGenerateReport} disabled={generatingReport}>
                  {generatingReport ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      生成中...
                    </>
                  ) : (
                    "生成报告"
                  )}
                </Button>
                {report && (
                  <Button onClick={handleExportReport} variant="outline">
                    <Download className="w-4 h-4 mr-2" />
                    导出
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {report ? (
              <div className="bg-gray-50 p-4 rounded whitespace-pre-wrap text-sm text-gray-700 max-h-96 overflow-y-auto">
                {report}
              </div>
            ) : (
              <p className="text-gray-500">点击"生成报告"按钮，AI 将为您生成详细的选品分析报告，包含竞争格局、利润测算、开发建议等内容。</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
