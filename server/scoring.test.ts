import { describe, it, expect } from "vitest";
import { checkHardFilter, scoreProduct } from "./scoring";

describe("Scoring Engine", () => {
  describe("Hard Filter Rules", () => {
    it("should reject products with price below $20", () => {
      const product = {
        asin: "B001",
        title: "Test",
        category: "Electronics",
        price: "15.99",
        rating: "4.5",
        reviewCount: 100,
        sellerCount: 5,
        weight: "0.5",
        dimensions: "10x10x10",
        productUrl: "https://amazon.com",
        keyword: "test",
      };

      const result = checkHardFilter(product, {
        minPrice: 20,
        maxPrice: 80,
        minWeight: 0,
        maxWeight: 1,
        minReviewCount: 50,
        maxReviewCount: 800,
        excludeCategories: [],
        competitionWeight: 25,
        profitWeight: 25,
        differentiationWeight: 30,
        developmentWeight: 20,
      } as any);

      expect(result.passed).toBe(false);
      expect(result.reason).toBeTruthy();
    });

    it("should reject products with price above $80", () => {
      const product = {
        asin: "B001",
        title: "Test",
        category: "Electronics",
        price: "99.99",
        rating: "4.5",
        reviewCount: 100,
        sellerCount: 5,
        weight: "0.5",
        dimensions: "10x10x10",
        productUrl: "https://amazon.com",
        keyword: "test",
      };

      const result = checkHardFilter(product, {
        minPrice: 20,
        maxPrice: 80,
        minWeight: 0,
        maxWeight: 1,
        minReviewCount: 50,
        maxReviewCount: 800,
        excludeCategories: [],
        competitionWeight: 25,
        profitWeight: 25,
        differentiationWeight: 30,
        developmentWeight: 20,
      } as any);

      expect(result.passed).toBe(false);
    });

    it("should reject products with weight above 1kg", () => {
      const product = {
        asin: "B001",
        title: "Test",
        category: "Electronics",
        price: "49.99",
        rating: "4.5",
        reviewCount: 100,
        sellerCount: 5,
        weight: "1.5",
        dimensions: "10x10x10",
        productUrl: "https://amazon.com",
        keyword: "test",
      };

      const result = checkHardFilter(product, {
        minPrice: 20,
        maxPrice: 80,
        minWeight: 0,
        maxWeight: 1,
        minReviewCount: 50,
        maxReviewCount: 800,
        excludeCategories: [],
        competitionWeight: 25,
        profitWeight: 25,
        differentiationWeight: 30,
        developmentWeight: 20,
      } as any);

      expect(result.passed).toBe(false);
    });

    it("should reject products with review count below minimum", () => {
      const product = {
        asin: "B001",
        title: "Test",
        category: "Electronics",
        price: "49.99",
        rating: "4.5",
        reviewCount: 30,
        sellerCount: 5,
        weight: "0.5",
        dimensions: "10x10x10",
        productUrl: "https://amazon.com",
        keyword: "test",
      };

      const result = checkHardFilter(product, {
        minPrice: 20,
        maxPrice: 80,
        minWeight: 0,
        maxWeight: 1,
        minReviewCount: 50,
        maxReviewCount: 800,
        excludeCategories: [],
        competitionWeight: 25,
        profitWeight: 25,
        differentiationWeight: 30,
        developmentWeight: 20,
      } as any);

      expect(result.passed).toBe(false);
    });

    it("should pass products meeting all hard filter rules", () => {
      const product = {
        asin: "B001",
        title: "Test",
        category: "Electronics",
        price: "49.99",
        rating: "4.5",
        reviewCount: 200,
        sellerCount: 5,
        weight: "0.5",
        dimensions: "10x10x10",
        productUrl: "https://amazon.com",
        keyword: "test",
      };

      const result = checkHardFilter(product, {
        minPrice: 20,
        maxPrice: 80,
        minWeight: 0,
        maxWeight: 1,
        minReviewCount: 50,
        maxReviewCount: 800,
        excludeCategories: [],
        competitionWeight: 25,
        profitWeight: 25,
        differentiationWeight: 30,
        developmentWeight: 20,
      } as any);

      expect(result.passed).toBe(true);
    });

    it("should reject products in excluded categories", () => {
      const product = {
        asin: "B001",
        title: "Test",
        category: "Hazardous Materials",
        price: "49.99",
        rating: "4.5",
        reviewCount: 200,
        sellerCount: 5,
        weight: "0.5",
        dimensions: "10x10x10",
        productUrl: "https://amazon.com",
        keyword: "test",
      };

      const result = checkHardFilter(product, {
        minPrice: 20,
        maxPrice: 80,
        minWeight: 0,
        maxWeight: 1,
        minReviewCount: 50,
        maxReviewCount: 800,
        excludeCategories: ["Hazardous Materials", "Weapons"],
        competitionWeight: 25,
        profitWeight: 25,
        differentiationWeight: 30,
        developmentWeight: 20,
      } as any);

      expect(result.passed).toBe(false);
    });
  });

  describe("Scoring Algorithm", () => {
    it("should calculate scores for qualified products", async () => {
      const product = {
        asin: "B001",
        title: "Premium Water Bottle",
        category: "Sports & Outdoors",
        price: "34.99",
        rating: "4.6",
        reviewCount: 250,
        sellerCount: 8,
        weight: "0.45",
        dimensions: "10x3x3",
        productUrl: "https://amazon.com",
        keyword: "water bottle",
      };

      const result = await scoreProduct(product, {
        minPrice: 20,
        maxPrice: 80,
        minWeight: 0,
        maxWeight: 1,
        minReviewCount: 50,
        maxReviewCount: 800,
        excludeCategories: [],
        competitionWeight: 25,
        profitWeight: 25,
        differentiationWeight: 30,
        developmentWeight: 20,
      } as any);

      expect(result.asin).toBe("B001");
      expect(result.totalScore).toBeTruthy();
      expect(result.grade).toMatch(/^[A-D]$/);
      expect(result.recommendReason).toBeTruthy();
      expect(result.riskReason).toBeTruthy();
    });

    it("should assign high scores for good products", async () => {
      const product = {
        asin: "B002",
        title: "Premium Bamboo Cutting Board",
        category: "Kitchen & Dining",
        price: "34.99",
        rating: "4.7",
        reviewCount: 378,
        sellerCount: 6,
        weight: "0.85",
        dimensions: "15x10x1",
        productUrl: "https://amazon.com",
        keyword: "cutting board",
      };

      const result = await scoreProduct(product, {
        minPrice: 20,
        maxPrice: 80,
        minWeight: 0,
        maxWeight: 1,
        minReviewCount: 50,
        maxReviewCount: 800,
        excludeCategories: [],
        competitionWeight: 25,
        profitWeight: 25,
        differentiationWeight: 30,
        developmentWeight: 20,
      } as any);

      expect(result.asin).toBe("B002");
      // High rating and review count should lead to higher score
      const score = parseFloat(result.totalScore);
      expect(score).toBeGreaterThan(10);
      expect(score).toBeLessThanOrEqual(100);
    });

    it("should assign D grade for products failing hard filter", async () => {
      const product = {
        asin: "B003",
        title: "Test",
        category: "Electronics",
        price: "15.99", // Below minimum
        rating: "4.5",
        reviewCount: 200,
        sellerCount: 5,
        weight: "0.5",
        dimensions: "10x10x10",
        productUrl: "https://amazon.com",
        keyword: "test",
      };

      const result = await scoreProduct(product, {
        minPrice: 20,
        maxPrice: 80,
        minWeight: 0,
        maxWeight: 1,
        minReviewCount: 50,
        maxReviewCount: 800,
        excludeCategories: [],
        competitionWeight: 25,
        profitWeight: 25,
        differentiationWeight: 30,
        developmentWeight: 20,
      } as any);

      expect(result.grade).toBe("D");
      expect(result.totalScore).toBe("0");
    });
  });
});
