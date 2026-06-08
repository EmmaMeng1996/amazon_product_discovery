import { drizzle } from "drizzle-orm/mysql2";
import { products, scores } from "../drizzle/schema";
import mysql from "mysql2/promise";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error("DATABASE_URL environment variable is not set");
  process.exit(1);
}

// Sample products data
const sampleProducts = [
  {
    asin: "B0D1ABC001",
    title: "Premium Stainless Steel Water Bottle 32oz",
    category: "Sports & Outdoors",
    price: "29.99",
    rating: "4.6",
    reviewCount: 245,
    sellerCount: 8,
    weight: "0.45",
    dimensions: "10 x 3 x 3 inches",
    productUrl: "https://amazon.com/dp/B0D1ABC001",
    keyword: "water bottle",
  },
  {
    asin: "B0D1ABC002",
    title: "Ergonomic Wireless Mouse with USB Receiver",
    category: "Electronics",
    price: "24.99",
    rating: "4.3",
    reviewCount: 512,
    sellerCount: 15,
    weight: "0.15",
    dimensions: "6 x 3 x 2 inches",
    productUrl: "https://amazon.com/dp/B0D1ABC002",
    keyword: "wireless mouse",
  },
  {
    asin: "B0D1ABC003",
    title: "Bamboo Cutting Board Set with Knife",
    category: "Kitchen & Dining",
    price: "34.99",
    rating: "4.7",
    reviewCount: 378,
    sellerCount: 6,
    weight: "0.85",
    dimensions: "15 x 10 x 1 inches",
    productUrl: "https://amazon.com/dp/B0D1ABC003",
    keyword: "cutting board",
  },
  {
    asin: "B0D1ABC004",
    title: "LED Desk Lamp with USB Charging Port",
    category: "Lighting",
    price: "39.99",
    rating: "4.5",
    reviewCount: 289,
    sellerCount: 12,
    weight: "0.6",
    dimensions: "8 x 6 x 12 inches",
    productUrl: "https://amazon.com/dp/B0D1ABC004",
    keyword: "desk lamp",
  },
  {
    asin: "B0D1ABC005",
    title: "Portable Phone Stand for Desk",
    category: "Electronics",
    price: "15.99",
    rating: "4.2",
    reviewCount: 156,
    sellerCount: 20,
    weight: "0.12",
    dimensions: "4 x 3 x 2 inches",
    productUrl: "https://amazon.com/dp/B0D1ABC005",
    keyword: "phone stand",
  },
  {
    asin: "B0D1ABC006",
    title: "Stainless Steel Coffee Filter Holder",
    category: "Kitchen & Dining",
    price: "22.99",
    rating: "4.4",
    reviewCount: 423,
    sellerCount: 9,
    weight: "0.35",
    dimensions: "5 x 5 x 3 inches",
    productUrl: "https://amazon.com/dp/B0D1ABC006",
    keyword: "coffee filter",
  },
  {
    asin: "B0D1ABC007",
    title: "Silicone Baking Mat Set (2 Pack)",
    category: "Kitchen & Dining",
    price: "18.99",
    rating: "4.6",
    reviewCount: 567,
    sellerCount: 11,
    weight: "0.25",
    dimensions: "16 x 12 inches",
    productUrl: "https://amazon.com/dp/B0D1ABC007",
    keyword: "baking mat",
  },
  {
    asin: "B0D1ABC008",
    title: "Adjustable Laptop Stand for Desk",
    category: "Electronics",
    price: "44.99",
    rating: "4.7",
    reviewCount: 334,
    sellerCount: 7,
    weight: "0.8",
    dimensions: "12 x 10 x 2 inches",
    productUrl: "https://amazon.com/dp/B0D1ABC008",
    keyword: "laptop stand",
  },
  {
    asin: "B0D1ABC009",
    title: "Bamboo Desk Organizer with Drawers",
    category: "Office Products",
    price: "32.99",
    rating: "4.5",
    reviewCount: 289,
    sellerCount: 8,
    weight: "0.95",
    dimensions: "12 x 8 x 6 inches",
    productUrl: "https://amazon.com/dp/B0D1ABC009",
    keyword: "desk organizer",
  },
  {
    asin: "B0D1ABC010",
    title: "Wireless Charging Pad for Smartphones",
    category: "Electronics",
    price: "27.99",
    rating: "4.3",
    reviewCount: 445,
    sellerCount: 14,
    weight: "0.2",
    dimensions: "4 x 4 x 0.5 inches",
    productUrl: "https://amazon.com/dp/B0D1ABC010",
    keyword: "wireless charger",
  },
];

// Sample scores data
const sampleScores = [
  {
    asin: "B0D1ABC001",
    competitionScore: "18",
    profitScore: "22",
    differentiationScore: "24",
    developmentScore: "16",
    totalScore: "80",
    grade: "B" as const,
    recommendReason: "产品市场需求稳定，利润空间可观，竞争度中等。适合中等规模运营。",
    riskReason: "市场已有多个成熟竞争对手，需要通过品质和服务差异化。",
  },
  {
    asin: "B0D1ABC002",
    competitionScore: "16",
    profitScore: "20",
    differentiationScore: "22",
    developmentScore: "14",
    totalScore: "72",
    grade: "B" as const,
    recommendReason: "电子产品市场需求大，但竞争激烈。需要关注供应链成本。",
    riskReason: "电子产品风险较高，需要考虑售后服务和产品质量保证。",
  },
  {
    asin: "B0D1ABC003",
    competitionScore: "20",
    profitScore: "24",
    differentiationScore: "26",
    developmentScore: "18",
    totalScore: "88",
    grade: "A" as const,
    recommendReason: "高端厨房用品市场增长快，利润空间大，差异化机会多。强烈推荐。",
    riskReason: "需要确保产品质量和食品安全认证，初期投入较大。",
  },
  {
    asin: "B0D1ABC004",
    competitionScore: "19",
    profitScore: "23",
    differentiationScore: "25",
    developmentScore: "17",
    totalScore: "84",
    grade: "A" as const,
    recommendReason: "LED照明产品市场需求稳定增长，功能创新空间大。值得深入研究。",
    riskReason: "需要关注能效标准和安全认证，产品设计需要专业支持。",
  },
  {
    asin: "B0D1ABC005",
    competitionScore: "22",
    profitScore: "18",
    differentiationScore: "20",
    developmentScore: "12",
    totalScore: "62",
    grade: "C" as const,
    recommendReason: "产品简单，市场需求一般，竞争度高。可作为补充产品。",
    riskReason: "利润空间受限，市场饱和度高，难以形成竞争优势。",
  },
  {
    asin: "B0D1ABC006",
    competitionScore: "17",
    profitScore: "21",
    differentiationScore: "23",
    developmentScore: "15",
    totalScore: "76",
    grade: "B" as const,
    recommendReason: "咖啡配件市场细分，目标用户明确，改良空间存在。",
    riskReason: "市场规模相对较小，需要精准营销和用户定位。",
  },
  {
    asin: "B0D1ABC007",
    competitionScore: "21",
    profitScore: "19",
    differentiationScore: "21",
    developmentScore: "13",
    totalScore: "64",
    grade: "C" as const,
    recommendReason: "烘焙用品市场稳定，但竞争激烈，利润有限。",
    riskReason: "产品同质化严重，难以建立品牌差异化。",
  },
  {
    asin: "B0D1ABC008",
    competitionScore: "18",
    profitScore: "25",
    differentiationScore: "27",
    developmentScore: "19",
    totalScore: "89",
    grade: "A" as const,
    recommendReason: "办公用品市场需求大，远程工作趋势持续，利润空间大。强烈推荐。",
    riskReason: "需要关注人体工学设计和材料成本，产品迭代快。",
  },
  {
    asin: "B0D1ABC009",
    competitionScore: "19",
    profitScore: "22",
    differentiationScore: "24",
    developmentScore: "16",
    totalScore: "81",
    grade: "B" as const,
    recommendReason: "办公整理产品市场需求稳定，消费者愿意为品质付费。",
    riskReason: "需要关注设计创新和材料选择，生产工艺要求高。",
  },
  {
    asin: "B0D1ABC010",
    competitionScore: "20",
    profitScore: "21",
    differentiationScore: "23",
    developmentScore: "15",
    totalScore: "79",
    grade: "B" as const,
    recommendReason: "无线充电市场增长快，技术成熟，市场需求持续。",
    riskReason: "技术标准众多，需要确保兼容性和安全认证。",
  },
];

async function seedData() {
  try {
    // Create connection
    const connection = await mysql.createConnection(DATABASE_URL);
    const db = drizzle(connection);

    console.log("开始导入示例数据...");

    // Insert products
    for (const product of sampleProducts) {
      await db.insert(products).values(product as any).onDuplicateKeyUpdate({
        set: product as any,
      });
      console.log(`✓ 产品已导入: ${product.asin}`);
    }

    // Insert scores
    for (const score of sampleScores) {
      await db.insert(scores).values(score as any).onDuplicateKeyUpdate({
        set: score as any,
      });
      console.log(`✓ 评分已导入: ${score.asin}`);
    }

    console.log("\n✅ 示例数据导入完成！");
    console.log(`- 导入产品数: ${sampleProducts.length}`);
    console.log(`- 导入评分数: ${sampleScores.length}`);

    await connection.end();
  } catch (error) {
    console.error("导入失败:", error);
    process.exit(1);
  }
}

seedData();
