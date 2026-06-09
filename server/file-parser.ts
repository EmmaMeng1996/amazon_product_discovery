import * as XLSX from "xlsx";
import * as pdfParseModule from "pdf-parse";

const pdfParse = (pdfParseModule as any).default || pdfParseModule;

export interface ParsedProduct {
  asin: string;
  title: string;
  category: string;
  price: string;
  rating: string;
  reviewCount: number;
  sellerCount: number;
  weight: string;
  dimensions: string;
  productUrl: string;
  keyword: string;
}

/**
 * Map Chinese column names to English field names
 */
const chineseToEnglishMap: Record<string, string> = {
  "ASIN": "asin",
  "商品标题": "title",
  "小类目": "category",
  "价格($)": "price",
  "评分": "rating",
  "月新增评分数": "reviewCount",
  "卖家数": "sellerCount",
  "商品重量（单位换算）": "weight",
  "商品尺寸（单位换算）": "dimensions",
  "商品详情页链接": "productUrl",
  "AC关键词": "keyword",
  // English column names
  "asin": "asin",
  "title": "title",
  "category": "category",
  "price": "price",
  "rating": "rating",
  "reviewCount": "reviewCount",
  "sellerCount": "sellerCount",
  "weight": "weight",
  "dimensions": "dimensions",
  "productUrl": "productUrl",
  "keyword": "keyword",
};

/**
 * Normalize row keys to English field names
 */
function normalizeRowKeys(row: Record<string, any>): Record<string, any> {
  const normalized: Record<string, any> = {};
  for (const [key, value] of Object.entries(row)) {
    const trimmedKey = String(key).trim();
    const englishKey = chineseToEnglishMap[trimmedKey] || trimmedKey.toLowerCase();
    normalized[englishKey] = value;
  }
  return normalized;
}

/**
 * Parse CSV data (already parsed by Papa Parse on frontend)
 */
export function parseCSVData(data: Record<string, any>[]): ParsedProduct[] {
  return data.map((row) => {
    const normalized = normalizeRowKeys(row);
    return {
      asin: String(normalized.asin || "").trim(),
      title: String(normalized.title || "").trim(),
      category: String(normalized.category || "").trim(),
      price: String(normalized.price || "0").trim(),
      rating: String(normalized.rating || "0").trim(),
      reviewCount: parseInt(String(normalized.reviewCount || "0")) || 0,
      sellerCount: parseInt(String(normalized.sellerCount || "0")) || 0,
      weight: String(normalized.weight || "0").trim(),
      dimensions: String(normalized.dimensions || "").trim(),
      productUrl: String(normalized.productUrl || "").trim(),
      keyword: String(normalized.keyword || "").trim(),
    };
  });
}

/**
 * Parse Excel file buffer
 */
export function parseExcelData(buffer: Buffer): ParsedProduct[] {
  try {
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    if (!sheetName) {
      throw new Error("No sheets found in Excel file");
    }

    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet) as Record<string, any>[];

    // Normalize keys and parse
    return data.map((row) => {
      const normalized = normalizeRowKeys(row);
      return {
        asin: String(normalized.asin || "").trim(),
        title: String(normalized.title || "").trim(),
        category: String(normalized.category || "").trim(),
        price: String(normalized.price || "0").trim(),
        rating: String(normalized.rating || "0").trim(),
        reviewCount: parseInt(String(normalized.reviewCount || "0")) || 0,
        sellerCount: parseInt(String(normalized.sellerCount || "0")) || 0,
        weight: String(normalized.weight || "0").trim(),
        dimensions: String(normalized.dimensions || "").trim(),
        productUrl: String(normalized.productUrl || "").trim(),
        keyword: String(normalized.keyword || "").trim(),
      };
    });
  } catch (error) {
    throw new Error(`Failed to parse Excel file: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Parse PDF file buffer - extract tables
 */
export async function parsePDFData(buffer: Buffer): Promise<ParsedProduct[]> {
  try {
    const pdfData = await (pdfParse as any)(buffer);
    const text = pdfData.text;

    // Try to extract table data from PDF text
    // This is a simplified approach - looks for lines with ASIN pattern
    const lines = text.split("\n").filter((line: string) => line.trim());

    const products: ParsedProduct[] = [];
    let currentProduct: Partial<ParsedProduct> | null = null;

    // Expected fields in order: ASIN, Title, Category, Price, Rating, ReviewCount, SellerCount, Weight, Dimensions, URL, Keyword
    const fieldNames = [
      "asin",
      "title",
      "category",
      "price",
      "rating",
      "reviewCount",
      "sellerCount",
      "weight",
      "dimensions",
      "productUrl",
      "keyword",
    ];

    for (const line of lines) {
      const trimmed = (line as string).trim();

      // Check if line starts with ASIN pattern (B followed by 9 alphanumeric chars)
      if (/^B[A-Z0-9]{9}/.test(trimmed)) {
        if (currentProduct && currentProduct.asin) {
          products.push(currentProduct as ParsedProduct);
        }

        // Start new product
        const parts = trimmed.split(/\t|\s{2,}/);
        currentProduct = {};

        for (let i = 0; i < Math.min(parts.length, fieldNames.length); i++) {
          const fieldName = fieldNames[i];
          const value = parts[i]?.trim() || "";

          if (fieldName === "reviewCount" || fieldName === "sellerCount") {
            (currentProduct as any)[fieldName] = parseInt(value) || 0;
          } else {
            (currentProduct as any)[fieldName] = value;
          }
        }
      }
    }

    // Add last product
    if (currentProduct && currentProduct.asin) {
      products.push(currentProduct as ParsedProduct);
    }

    if (products.length === 0) {
      throw new Error("No valid product data found in PDF");
    }

    return products;
  } catch (error) {
    throw new Error(`Failed to parse PDF file: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Detect file type and parse accordingly
 */
export async function parseFile(
  buffer: Buffer,
  filename: string
): Promise<{ products: ParsedProduct[]; format: string }> {
  const ext = filename.toLowerCase().split(".").pop() || "";

  if (ext === "xlsx" || ext === "xls") {
    return {
      products: parseExcelData(buffer),
      format: "Excel",
    };
  } else if (ext === "pdf") {
    const products = await parsePDFData(buffer);
    return {
      products,
      format: "PDF",
    };
  } else if (ext === "csv") {
    throw new Error("CSV files should be parsed on the frontend using Papa Parse");
  } else {
    throw new Error(`Unsupported file format: .${ext}`);
  }
}

/**
 * Validate parsed products
 */
export function validateProducts(products: ParsedProduct[]): { valid: ParsedProduct[]; errors: string[] } {
  const valid: ParsedProduct[] = [];
  const errors: string[] = [];

  products.forEach((product, index) => {
    const rowNum = index + 1;

    // Check required fields
    if (!product.asin) {
      errors.push(`Row ${rowNum}: Missing ASIN`);
      return;
    }

    if (!product.title) {
      errors.push(`Row ${rowNum}: Missing title`);
      return;
    }

    // Validate numeric fields
    const price = parseFloat(product.price);
    if (isNaN(price) || price < 0) {
      errors.push(`Row ${rowNum}: Invalid price`);
      return;
    }

    const rating = parseFloat(product.rating);
    if (isNaN(rating) || rating < 0 || rating > 5) {
      errors.push(`Row ${rowNum}: Invalid rating (must be 0-5)`);
      return;
    }

    if (product.reviewCount < 0) {
      errors.push(`Row ${rowNum}: Invalid review count`);
      return;
    }

    if (product.sellerCount < 0) {
      errors.push(`Row ${rowNum}: Invalid seller count`);
      return;
    }

    valid.push(product);
  });

  return { valid, errors };
}
