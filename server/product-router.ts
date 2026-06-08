import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import { scoreProduct } from "./scoring";
import { CsvImportError, normalizeCsvRow } from "./csv-import";
import {
  getOrCreateScoringRules,
  updateScoringRules,
  upsertProduct,
  upsertScore,
  getProductWithScore,
  listProductsWithScores,
  getDashboardStats,
  getCategoryStats,
} from "./db-helpers";
import { products as productsTable } from "../drizzle/schema";
import { getDb } from "./db";
import { eq } from "drizzle-orm";

export const productRouter = router({
  /**
   * Import products from CSV
   */
  importCsv: publicProcedure
    .input(
      z.object({
        data: z.array(z.record(z.string(), z.any())),
      })
    )
    .mutation(async ({ input }) => {
      const rules = await getOrCreateScoringRules();
      const results = [];
      const errors = [];

      for (let index = 0; index < input.data.length; index++) {
        const row = input.data[index];
        const rowNumber = index + 2;
        try {
          const parsed = normalizeCsvRow(row, rowNumber);

          // Upsert product
          const productData = {
            asin: parsed.asin,
            title: parsed.title,
            category: parsed.category,
            price: parsed.price.toString(),
            rating:
              parsed.rating !== undefined
                ? parsed.rating.toString()
                : undefined,
            reviewCount: parsed.reviewCount,
            sellerCount: parsed.sellerCount,
            weight:
              parsed.weight !== undefined
                ? parsed.weight.toString()
                : undefined,
            dimensions: parsed.dimensions,
            productUrl: parsed.productUrl,
            keyword: parsed.keyword,
          } as any;
          const product = await upsertProduct(productData);

          // Score product
          const scoreData = await scoreProduct(product, rules);

          // Update product hard filter status
          const db = await getDb();
          if (db) {
            await db
              .update(productsTable)
              .set({
                passedHardFilter: scoreData.totalScore === "0" ? 0 : 1,
              })
              .where(eq(productsTable.asin, product.asin));
          }

          // Upsert score
          await upsertScore(scoreData);

          results.push({
            asin: parsed.asin,
            status: "success",
            grade: scoreData.grade,
            totalScore: scoreData.totalScore,
          });
        } catch (error) {
          const csvError = error as Partial<CsvImportError>;
          errors.push({
            row: csvError.row ?? rowNumber,
            field: csvError.field ?? "row",
            error:
              csvError.error ??
              (error instanceof Error ? error.message : "Unknown error"),
          });
        }
      }

      return {
        imported: results.length,
        failed: errors.length,
        results,
        errors,
      };
    }),

  /**
   * Get product with score by ASIN
   */
  getProduct: publicProcedure
    .input(z.object({ asin: z.string() }))
    .query(async ({ input }) => {
      return await getProductWithScore(input.asin);
    }),

  /**
   * List products with filters and sorting
   */
  listProducts: publicProcedure
    .input(
      z.object({
        grade: z.string().optional(),
        category: z.string().optional(),
        minScore: z.number().optional(),
        maxScore: z.number().optional(),
        minPrice: z.number().optional(),
        maxPrice: z.number().optional(),
        minReviewCount: z.number().optional(),
        maxReviewCount: z.number().optional(),
        sortBy: z
          .enum(["totalScore", "price", "reviewCount", "createdAt"])
          .optional(),
        sortOrder: z.enum(["asc", "desc"]).optional(),
        limit: z.number().optional(),
        offset: z.number().optional(),
      })
    )
    .query(async ({ input }) => {
      return await listProductsWithScores(input);
    }),

  /**
   * Get dashboard statistics
   */
  getDashboardStats: publicProcedure.query(async () => {
    return await getDashboardStats();
  }),

  /**
   * Get category statistics
   */
  getCategoryStats: publicProcedure.query(async () => {
    return await getCategoryStats();
  }),

  /**
   * Get current scoring rules
   */
  getScoringRules: publicProcedure.query(async () => {
    return await getOrCreateScoringRules();
  }),

  /**
   * Update scoring rules
   */
  updateScoringRules: publicProcedure
    .input(
      z.object({
        minPrice: z.number().optional(),
        maxPrice: z.number().optional(),
        minReviewCount: z.number().optional(),
        maxReviewCount: z.number().optional(),
        maxWeight: z.number().optional(),
        competitionWeight: z.number().optional(),
        profitWeight: z.number().optional(),
        differentiationWeight: z.number().optional(),
        developmentWeight: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const updates: any = {};

      if (input.minPrice !== undefined) {
        updates.minPrice = input.minPrice.toString();
      }
      if (input.maxPrice !== undefined) {
        updates.maxPrice = input.maxPrice.toString();
      }
      if (input.minReviewCount !== undefined) {
        updates.minReviewCount = input.minReviewCount;
      }
      if (input.maxReviewCount !== undefined) {
        updates.maxReviewCount = input.maxReviewCount;
      }
      if (input.maxWeight !== undefined) {
        updates.maxWeight = input.maxWeight.toString();
      }
      if (input.competitionWeight !== undefined) {
        updates.competitionWeight = input.competitionWeight.toString();
      }
      if (input.profitWeight !== undefined) {
        updates.profitWeight = input.profitWeight.toString();
      }
      if (input.differentiationWeight !== undefined) {
        updates.differentiationWeight = input.differentiationWeight.toString();
      }
      if (input.developmentWeight !== undefined) {
        updates.developmentWeight = input.developmentWeight.toString();
      }

      await updateScoringRules(updates);
      return await getOrCreateScoringRules();
    }),

  /**
   * Recalculate scores for all products
   */
  recalculateAllScores: publicProcedure.mutation(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const rules = await getOrCreateScoringRules();
    const allProducts = await db.select().from(productsTable);

    let updated = 0;
    for (const product of allProducts) {
      const scoreData = await scoreProduct(product, rules);
      await upsertScore(scoreData);
      updated++;
    }

    return { updated };
  }),
});
