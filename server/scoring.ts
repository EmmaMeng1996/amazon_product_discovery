import { Product, Score, ScoringRule } from "../drizzle/schema";

/**
 * Dangerous product categories to exclude
 */
const DANGEROUS_CATEGORIES = [
  "liquid",
  "powder",
  "food",
  "medicine",
  "drug",
  "magnetic",
  "hazard",
  "explosive",
  "flammable",
  "battery",
  "perfume",
  "cosmetic",
  "supplement",
];

/**
 * Preferred categories for scoring boost
 */
const PREFERRED_CATEGORIES = [
  "home & kitchen",
  "wellness",
  "lifestyle",
  "pet supplies",
  "office products",
];

/**
 * Hard filter check - returns true if product passes, false if it fails
 * Also returns a reason if it fails
 */
export function checkHardFilter(
  product: Product,
  rules: ScoringRule
): { passed: boolean; reason?: string } {
  // Price check
  const price = Number(product.price || 0);
  if (price < Number(rules.minPrice) || price > Number(rules.maxPrice)) {
    return {
      passed: false,
      reason: `Price $${price} outside range $${rules.minPrice}-$${rules.maxPrice}`,
    };
  }

  // Weight check
  const weight = Number(product.weight || 0);
  if (weight > Number(rules.maxWeight)) {
    return {
      passed: false,
      reason: `Weight ${weight}kg exceeds limit ${rules.maxWeight}kg`,
    };
  }

  // Review count check
  const reviewCount = product.reviewCount || 0;
  if (
    reviewCount < Number(rules.minReviewCount) ||
    reviewCount > Number(rules.maxReviewCount)
  ) {
    return {
      passed: false,
      reason: `Review count ${reviewCount} outside range ${rules.minReviewCount}-${rules.maxReviewCount}`,
    };
  }

  // Dangerous category check
  const category = (product.category || "").toLowerCase();
  for (const dangerous of DANGEROUS_CATEGORIES) {
    if (category.includes(dangerous)) {
      return {
        passed: false,
        reason: `Dangerous category: ${product.category}`,
      };
    }
  }

  // Size check (exclude Oversize)
  const dimensions = (product.dimensions || "").toLowerCase();
  if (dimensions.includes("oversize") || dimensions.includes("large")) {
    return {
      passed: false,
      reason: `Oversize product: ${product.dimensions}`,
    };
  }

  return { passed: true };
}

/**
 * Competition score (0-25)
 * Lower review count = less competition = higher score
 * Fewer sellers = higher score
 * Lower brand concentration = higher score
 */
export function calculateCompetitionScore(
  product: Product,
  maxScore: number
): number {
  const reviewCount = product.reviewCount || 0;
  const sellerCount = product.sellerCount || 1;

  // Normalize review count (lower is better)
  // Assume 800 reviews is max competition
  const reviewScore = Math.max(0, 1 - reviewCount / 800);

  // Normalize seller count (lower is better)
  // Assume 20 sellers is high competition
  const sellerScore = Math.max(0, 1 - sellerCount / 20);

  // Average the two factors
  const competitionLevel = (reviewScore + sellerScore) / 2;

  // Convert to score (higher competition level = higher score)
  return Math.round(competitionLevel * maxScore * 100) / 100;
}

/**
 * Profit score (0-25)
 * Based on product price and estimated costs
 * Higher price = potentially higher profit
 */
export function calculateProfitScore(
  product: Product,
  maxScore: number
): number {
  const price = Number(product.price || 0);

  // Estimate costs (rough approximation)
  // For $20-80 products, assume:
  // - COGS: 30-40% of price
  // - Shipping: $2-5
  // - Amazon fees: 15-20% of price
  // - Profit margin: 20-35%

  if (price < 20) return 0;
  if (price > 80) return 0;

  // Normalize price to 0-1 (higher price = higher profit potential)
  const priceScore = (price - 20) / (80 - 20);

  // Adjust based on price range
  // Sweet spot is $40-60 (best margin)
  let adjustment = 1;
  if (price < 30) adjustment = 0.7;
  else if (price > 70) adjustment = 0.8;
  else if (price >= 40 && price <= 60) adjustment = 1.2;

  return Math.round(priceScore * adjustment * maxScore * 100) / 100;
}

/**
 * Differentiation score (0-30)
 * Based on review count and assumed user pain points
 * More reviews = more feedback = more improvement opportunities
 * Moderate review count (100-500) is sweet spot
 */
export function calculateDifferentiationScore(
  product: Product,
  maxScore: number
): number {
  const reviewCount = product.reviewCount || 0;

  // Sweet spot: 100-500 reviews (lots of feedback but not saturated)
  let score = 0;

  if (reviewCount < 50) {
    score = 0; // Not enough feedback
  } else if (reviewCount < 100) {
    score = 0.4; // Some feedback
  } else if (reviewCount < 300) {
    score = 0.9; // Good feedback volume
  } else if (reviewCount < 500) {
    score = 1.0; // Excellent feedback volume
  } else if (reviewCount < 800) {
    score = 0.7; // Still good but more competition
  } else {
    score = 0.3; // Too many reviews, saturated market
  }

  return Math.round(score * maxScore * 100) / 100;
}

/**
 * Development score (0-20)
 * Based on product category and complexity assumptions
 * ODM products and simple products score higher
 * Complex electronics and software score lower
 */
export function calculateDevelopmentScore(
  product: Product,
  maxScore: number
): number {
  const category = (product.category || "").toLowerCase();
  const title = (product.title || "").toLowerCase();

  let score = 0.5; // Default base score

  // Preferred categories get boost
  for (const preferred of PREFERRED_CATEGORIES) {
    if (category.includes(preferred)) {
      score = 0.8;
      break;
    }
  }

  // Complexity indicators (reduce score)
  const complexityKeywords = [
    "app",
    "software",
    "smart",
    "wifi",
    "bluetooth",
    "electronic",
    "circuit",
    "chip",
    "ai",
    "robot",
  ];

  for (const keyword of complexityKeywords) {
    if (title.includes(keyword) || category.includes(keyword)) {
      score = Math.max(0.2, score - 0.15);
    }
  }

  // Simplicity indicators (boost score)
  const simplicityKeywords = [
    "holder",
    "stand",
    "organizer",
    "storage",
    "case",
    "cover",
    "mat",
    "pad",
    "tool",
    "accessory",
  ];

  for (const keyword of simplicityKeywords) {
    if (title.includes(keyword)) {
      score = Math.min(1.0, score + 0.1);
    }
  }

  return Math.round(score * maxScore * 100) / 100;
}

/**
 * Calculate total score and determine grade
 */
export function calculateTotalScore(
  competitionScore: number,
  profitScore: number,
  differentiationScore: number,
  developmentScore: number,
  weights: {
    competition: number;
    profit: number;
    differentiation: number;
    development: number;
  }
): { totalScore: number; grade: "A" | "B" | "C" | "D" } {
  // Normalize weights to sum to 100
  const totalWeight =
    weights.competition +
    weights.profit +
    weights.differentiation +
    weights.development;
  const normalizedWeights = {
    competition: weights.competition / totalWeight,
    profit: weights.profit / totalWeight,
    differentiation: weights.differentiation / totalWeight,
    development: weights.development / totalWeight,
  };

  // Calculate weighted total
  const totalScore =
    competitionScore * normalizedWeights.competition +
    profitScore * normalizedWeights.profit +
    differentiationScore * normalizedWeights.differentiation +
    developmentScore * normalizedWeights.development;

  // Determine grade
  let grade: "A" | "B" | "C" | "D" = "D";
  if (totalScore >= 85) grade = "A";
  else if (totalScore >= 70) grade = "B";
  else if (totalScore >= 60) grade = "C";

  return {
    totalScore: Math.round(totalScore * 100) / 100,
    grade,
  };
}

/**
 * Generate recommendation reason based on scores
 */
export function generateRecommendReason(
  product: Product,
  scores: {
    competition: number;
    profit: number;
    differentiation: number;
    development: number;
    total: number;
  }
): string {
  const reasons: string[] = [];

  if (scores.competition > 18) {
    reasons.push("低竞争度，市场机会大");
  }

  if (scores.profit > 18) {
    reasons.push("利润空间充足");
  }

  if (scores.differentiation > 22) {
    reasons.push("用户痛点明显，改良空间大");
  }

  if (scores.development > 15) {
    reasons.push("开发难度低，快速上市");
  }

  if (scores.total >= 85) {
    reasons.push("综合评分优秀，强烈推荐研究");
  } else if (scores.total >= 70) {
    reasons.push("综合评分良好，值得关注");
  }

  return reasons.join(" | ");
}

/**
 * Generate risk reason based on product characteristics
 */
export function generateRiskReason(product: Product): string {
  const risks: string[] = [];

  const reviewCount = product.reviewCount || 0;
  if (reviewCount < 100) {
    risks.push("评论数较少，用户需求不够明确");
  }

  const rating = Number(product.rating || 0);
  if (rating < 3.5) {
    risks.push("产品评分较低，存在质量问题");
  }

  const sellerCount = product.sellerCount || 0;
  if (sellerCount > 15) {
    risks.push("卖家数量众多，竞争激烈");
  }

  if (reviewCount > 600) {
    risks.push("市场已相对饱和，差异化难度高");
  }

  return risks.length > 0 ? risks.join(" | ") : "风险较低";
}

/**
 * Full scoring pipeline
 */
export async function scoreProduct(
  product: Product,
  rules: ScoringRule
): Promise<Omit<Score, "id" | "createdAt" | "updatedAt">> {
  // Check hard filter
  const hardFilterResult = checkHardFilter(product, rules);

  if (!hardFilterResult.passed) {
    // Product fails hard filter
    return {
      asin: product.asin,
      competitionScore: "0",
      profitScore: "0",
      differentiationScore: "0",
      developmentScore: "0",
      totalScore: "0",
      grade: "D",
      recommendReason: "未通过硬过滤",
      riskReason: hardFilterResult.reason || "不符合基本要求",
    };
  }

  // Calculate individual scores
  const competitionScore = calculateCompetitionScore(product, 25);
  const profitScore = calculateProfitScore(product, 25);
  const differentiationScore = calculateDifferentiationScore(product, 30);
  const developmentScore = calculateDevelopmentScore(product, 20);

  // Calculate total score and grade
  const { totalScore, grade } = calculateTotalScore(
    competitionScore,
    profitScore,
    differentiationScore,
    developmentScore,
    {
      competition: Number(rules.competitionWeight),
      profit: Number(rules.profitWeight),
      differentiation: Number(rules.differentiationWeight),
      development: Number(rules.developmentWeight),
    }
  );

  // Generate reasons
  const recommendReason = generateRecommendReason(product, {
    competition: competitionScore,
    profit: profitScore,
    differentiation: differentiationScore,
    development: developmentScore,
    total: totalScore,
  });

  const riskReason = generateRiskReason(product);

  return {
    asin: product.asin,
    competitionScore: competitionScore.toString(),
    profitScore: profitScore.toString(),
    differentiationScore: differentiationScore.toString(),
    developmentScore: developmentScore.toString(),
    totalScore: totalScore.toString(),
    grade,
    recommendReason,
    riskReason,
  };
}
