import { eq, and, gte, lte, desc, asc } from "drizzle-orm";
import {
  products,
  scores,
  scoringRules,
  InsertProduct,
  InsertScore,
} from "../drizzle/schema";
import { getDb } from "./db";

/**
 * Get or create default scoring rules
 */
export async function getOrCreateScoringRules() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db.select().from(scoringRules).limit(1);
  if (existing.length > 0) {
    return existing[0];
  }

  // Create default rules
  await db.insert(scoringRules).values({});
  const rules = await db.select().from(scoringRules).limit(1);
  return rules[0];
}

/**
 * Update scoring rules
 */
export async function updateScoringRules(
  updates: Partial<typeof scoringRules.$inferInsert>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const rules = await getOrCreateScoringRules();
  const result = await db
    .update(scoringRules)
    .set(updates)
    .where(eq(scoringRules.id, rules.id));

  return result;
}

/**
 * Insert or update product
 */
export async function upsertProduct(product: InsertProduct) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db
    .select()
    .from(products)
    .where(eq(products.asin, product.asin))
    .limit(1);

  if (existing.length > 0) {
    // Update existing
    await db
      .update(products)
      .set(product)
      .where(eq(products.asin, product.asin));
    const result = await db
      .select()
      .from(products)
      .where(eq(products.asin, product.asin))
      .limit(1);
    return result[0];
  } else {
    // Insert new
    await db.insert(products).values(product);
    const result = await db
      .select()
      .from(products)
      .where(eq(products.asin, product.asin))
      .limit(1);
    return result[0];
  }
}

/**
 * Insert or update score
 */
export async function upsertScore(score: InsertScore) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db
    .select()
    .from(scores)
    .where(eq(scores.asin, score.asin))
    .limit(1);

  if (existing.length > 0) {
    // Update existing
    await db.update(scores).set(score).where(eq(scores.asin, score.asin));
    return existing[0];
  } else {
    // Insert new
    await db.insert(scores).values(score);
    const result = await db
      .select()
      .from(scores)
      .where(eq(scores.asin, score.asin))
      .limit(1);
    return result[0];
  }
}

/**
 * Get product with score by ASIN
 */
export async function getProductWithScore(asin: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const product = await db
    .select()
    .from(products)
    .where(eq(products.asin, asin))
    .limit(1);

  if (product.length === 0) return null;

  const score = await db
    .select()
    .from(scores)
    .where(eq(scores.asin, asin))
    .limit(1);

  return {
    product: product[0],
    score: score[0] || null,
  };
}

/**
 * List products with scores
 */
export async function listProductsWithScores(options?: {
  grade?: string;
  category?: string;
  minScore?: number;
  maxScore?: number;
  minPrice?: number;
  maxPrice?: number;
  minReviewCount?: number;
  maxReviewCount?: number;
  sortBy?: "totalScore" | "price" | "reviewCount" | "createdAt";
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Apply filters
  const conditions = [];

  if (options?.grade) {
    conditions.push(eq(scores.grade, options.grade as any));
  }

  if (options?.category) {
    conditions.push(eq(products.category, options.category));
  }

  if (options?.minScore !== undefined) {
    conditions.push(gte(scores.totalScore, options.minScore.toString()));
  }

  if (options?.maxScore !== undefined) {
    conditions.push(lte(scores.totalScore, options.maxScore.toString()));
  }

  if (options?.minPrice !== undefined) {
    conditions.push(gte(products.price, options.minPrice.toString()));
  }

  if (options?.maxPrice !== undefined) {
    conditions.push(lte(products.price, options.maxPrice.toString()));
  }

  if (options?.minReviewCount !== undefined) {
    conditions.push(gte(products.reviewCount, options.minReviewCount));
  }

  if (options?.maxReviewCount !== undefined) {
    conditions.push(lte(products.reviewCount, options.maxReviewCount));
  }

  // Build base query
  let query: any = db
    .select()
    .from(products)
    .innerJoin(scores, eq(products.asin, scores.asin));

  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  // Apply sorting
  const sortBy = options?.sortBy || "totalScore";
  const sortOrder = options?.sortOrder || "desc";

  if (sortBy === "totalScore") {
    query = query.orderBy(
      sortOrder === "desc" ? desc(scores.totalScore) : asc(scores.totalScore)
    );
  } else if (sortBy === "price") {
    query = query.orderBy(
      sortOrder === "desc" ? desc(products.price) : asc(products.price)
    );
  } else if (sortBy === "reviewCount") {
    query = query.orderBy(
      sortOrder === "desc"
        ? desc(products.reviewCount)
        : asc(products.reviewCount)
    );
  } else if (sortBy === "createdAt") {
    query = query.orderBy(
      sortOrder === "desc" ? desc(products.createdAt) : asc(products.createdAt)
    );
  }

  // Apply pagination
  if (options?.limit) {
    query = query.limit(options.limit);
  }

  if (options?.offset) {
    query = query.offset(options.offset);
  }

  const results = await query;

  return results.map((row: any) => ({
    product: row.products,
    score: row.scores,
  }));
}

/**
 * Get dashboard statistics
 */
export async function getDashboardStats() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Total products
  const totalProducts = await db.select().from(products);

  // Count by grade
  const gradeStats = await db
    .select()
    .from(scores)
    .then(allScores => {
      const stats = { A: 0, B: 0, C: 0, D: 0 };
      allScores.forEach(score => {
        stats[score.grade as keyof typeof stats]++;
      });
      return stats;
    });

  // Latest recommended products (A and B grade)
  const latestRecommended = await listProductsWithScores({
    grade: "A",
    limit: 5,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const latestB = await listProductsWithScores({
    grade: "B",
    limit: 5,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  // Score distribution
  const allScores = await db.select().from(scores);
  const scoreDistribution = {
    "85-100": 0,
    "70-84": 0,
    "60-69": 0,
    "0-59": 0,
  };

  allScores.forEach(score => {
    const totalScore = Number(score.totalScore);
    if (totalScore >= 85) scoreDistribution["85-100"]++;
    else if (totalScore >= 70) scoreDistribution["70-84"]++;
    else if (totalScore >= 60) scoreDistribution["60-69"]++;
    else scoreDistribution["0-59"]++;
  });

  return {
    totalProducts: totalProducts.length,
    passedHardFilter: totalProducts.filter(p => p.passedHardFilter).length,
    gradeStats,
    latestRecommended: [...latestRecommended, ...latestB].slice(0, 10),
    scoreDistribution,
  };
}

/**
 * Get category statistics
 */
export async function getCategoryStats() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const allProducts = await db.select().from(products);
  const categoryStats: Record<string, number> = {};

  allProducts.forEach(product => {
    const category = product.category || "Unknown";
    categoryStats[category] = (categoryStats[category] || 0) + 1;
  });

  return categoryStats;
}
