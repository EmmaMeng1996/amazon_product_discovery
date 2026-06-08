import { describe, expect, it } from "vitest";
import { normalizeCsvRow } from "./csv-import";

describe("CSV import normalization", () => {
  it("maps SellerSprite Chinese headers and cleans numeric values", () => {
    const row = normalizeCsvRow(
      {
        ASIN: " B0TEST1234 ",
        商品标题: "Kitchen Storage Rack",
        大类目: "Home & Kitchen",
        "价格($)": "$29.99",
        评分: "4.6",
        评分数: "1,234",
        卖家数: "5",
        商品重量: "0.75",
        商品尺寸: "10 x 20 x 30 cm",
        商品详情页链接: "https://www.amazon.com/dp/B0TEST1234",
      },
      2
    );

    expect(row).toEqual({
      asin: "B0TEST1234",
      title: "Kitchen Storage Rack",
      category: "Home & Kitchen",
      price: 29.99,
      rating: 4.6,
      reviewCount: 1234,
      sellerCount: 5,
      weight: 0.75,
      dimensions: "10 x 20 x 30 cm",
      productUrl: "https://www.amazon.com/dp/B0TEST1234",
    });
  });

  it("supports standard English snake_case headers and optional empty values", () => {
    const row = normalizeCsvRow(
      {
        asin: "B0TEST5678",
        title: "Desk Organizer",
        category: "",
        price: "35",
        rating: "",
        review_count: "",
        seller_count: "",
        weight: "",
        dimensions: "",
        product_url: "",
        keyword: "office organizer",
      },
      3
    );

    expect(row).toEqual({
      asin: "B0TEST5678",
      title: "Desk Organizer",
      price: 35,
      keyword: "office organizer",
    });
  });

  it("reports row, field, and reason for required field errors", () => {
    let thrown: unknown;
    try {
      normalizeCsvRow(
        {
          asin: "B0TEST0000",
          title: "Missing Price",
          price: "",
        },
        8
      );
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toEqual({
      row: 8,
      field: "price",
      error: "必填字段不能为空",
    });
  });

  it("reports row, field, and reason for invalid numbers", () => {
    let thrown: unknown;
    try {
      normalizeCsvRow(
        {
          asin: "B0TEST9999",
          title: "Bad Rating",
          price: "29.99",
          rating: "not available",
        },
        12
      );
    } catch (error) {
      thrown = error;
    }

    expect(thrown).toEqual({
      row: 12,
      field: "rating",
      error: "无法转换为数字: not available",
    });
  });
});
