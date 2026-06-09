import { describe, it, expect } from "vitest";
import { parseCSVData, validateProducts } from "./file-parser";

describe("file-parser", () => {
  describe("parseCSVData", () => {
    it("should parse CSV data with English column names", () => {
      const data = [
        {
          asin: "B001",
          title: "Test Product",
          category: "Electronics",
          price: "29.99",
          rating: "4.5",
          reviewCount: "100",
          sellerCount: "5",
          weight: "0.5",
          dimensions: "10x10x10",
          productUrl: "https://example.com",
          keyword: "test",
        },
      ];

      const result = parseCSVData(data);

      expect(result).toHaveLength(1);
      expect(result[0].asin).toBe("B001");
      expect(result[0].title).toBe("Test Product");
      expect(result[0].price).toBe("29.99");
      expect(result[0].reviewCount).toBe(100);
    });

    it("should parse CSV data with Chinese column names", () => {
      const data = [
        {
          "ASIN": "B002",
          "商品标题": "测试产品",
          "小类目": "电子产品",
          "价格($)": "39.99",
          "评分": "4.8",
          "月新增评分数": "50",
          "卖家数": "3",
          "商品重量（单位换算）": "0.3",
          "商品尺寸（单位换算）": "5x5x5",
          "商品详情页链接": "https://example.com",
          "AC关键词": "测试",
        },
      ];

      const result = parseCSVData(data);

      expect(result).toHaveLength(1);
      expect(result[0].asin).toBe("B002");
      expect(result[0].title).toBe("测试产品");
      expect(result[0].category).toBe("电子产品");
      expect(result[0].price).toBe("39.99");
      expect(result[0].reviewCount).toBe(50);
    });

    it("should handle missing optional fields", () => {
      const data = [
        {
          asin: "B003",
          title: "Minimal Product",
        },
      ];

      const result = parseCSVData(data);

      expect(result).toHaveLength(1);
      expect(result[0].asin).toBe("B003");
      expect(result[0].title).toBe("Minimal Product");
      expect(result[0].category).toBe("");
      expect(result[0].price).toBe("0");
      expect(result[0].reviewCount).toBe(0);
    });
  });

  describe("validateProducts", () => {
    it("should validate valid products", () => {
      const products = [
        {
          asin: "B001",
          title: "Product 1",
          category: "Cat1",
          price: "29.99",
          rating: "4.5",
          reviewCount: 100,
          sellerCount: 5,
          weight: "0.5",
          dimensions: "10x10x10",
          productUrl: "https://example.com",
          keyword: "test",
        },
      ];

      const { valid, errors } = validateProducts(products);

      expect(valid).toHaveLength(1);
      expect(errors).toHaveLength(0);
    });

    it("should reject products with missing ASIN", () => {
      const products = [
        {
          asin: "",
          title: "Product 1",
          category: "Cat1",
          price: "29.99",
          rating: "4.5",
          reviewCount: 100,
          sellerCount: 5,
          weight: "0.5",
          dimensions: "10x10x10",
          productUrl: "https://example.com",
          keyword: "test",
        },
      ];

      const { valid, errors } = validateProducts(products);

      expect(valid).toHaveLength(0);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toContain("Missing ASIN");
    });

    it("should reject products with invalid price", () => {
      const products = [
        {
          asin: "B001",
          title: "Product 1",
          category: "Cat1",
          price: "invalid",
          rating: "4.5",
          reviewCount: 100,
          sellerCount: 5,
          weight: "0.5",
          dimensions: "10x10x10",
          productUrl: "https://example.com",
          keyword: "test",
        },
      ];

      const { valid, errors } = validateProducts(products);

      expect(valid).toHaveLength(0);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toContain("Invalid price");
    });

    it("should reject products with invalid rating", () => {
      const products = [
        {
          asin: "B001",
          title: "Product 1",
          category: "Cat1",
          price: "29.99",
          rating: "6.0",
          reviewCount: 100,
          sellerCount: 5,
          weight: "0.5",
          dimensions: "10x10x10",
          productUrl: "https://example.com",
          keyword: "test",
        },
      ];

      const { valid, errors } = validateProducts(products);

      expect(valid).toHaveLength(0);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0]).toContain("Invalid rating");
    });
  });
});
