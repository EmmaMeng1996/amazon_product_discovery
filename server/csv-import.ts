import { z } from "zod";

export type NormalizedCsvRow = {
  asin: string;
  title: string;
  category?: string;
  price: number;
  rating?: number;
  reviewCount?: number;
  sellerCount?: number;
  weight?: number;
  dimensions?: string;
  productUrl?: string;
  keyword?: string;
};

export type CsvImportError = {
  row: number;
  field: string;
  error: string;
};

const FIELD_ALIASES = {
  asin: ["ASIN", "asin"],
  title: ["商品标题", "title"],
  category: ["大类目", "category"],
  price: ["价格($)", "price"],
  rating: ["评分", "rating"],
  reviewCount: ["评分数", "review_count", "reviewCount"],
  sellerCount: ["卖家数", "seller_count", "sellerCount"],
  weight: ["商品重量", "weight"],
  dimensions: ["商品尺寸", "dimensions"],
  productUrl: ["商品详情页链接", "product_url", "productUrl"],
  keyword: ["keyword"],
} as const;

const REQUIRED_FIELDS = ["asin", "title", "price"] as const;

const normalizedCsvRowSchema = z.object({
  asin: z.string().min(1, "不能为空"),
  title: z.string().min(1, "不能为空"),
  category: z.string().optional(),
  price: z.number(),
  rating: z.number().optional(),
  reviewCount: z.number().int().optional(),
  sellerCount: z.number().int().optional(),
  weight: z.number().optional(),
  dimensions: z.string().optional(),
  productUrl: z.string().optional(),
  keyword: z.string().optional(),
});

function isEmpty(value: unknown) {
  return value === undefined || value === null || String(value).trim() === "";
}

function readAliasedValue(
  row: Record<string, unknown>,
  field: keyof typeof FIELD_ALIASES
) {
  const normalizedRow = new Map(
    Object.entries(row).map(([key, value]) => [normalizeHeader(key), value])
  );

  for (const key of FIELD_ALIASES[field]) {
    const normalizedKey = normalizeHeader(key);
    if (normalizedRow.has(normalizedKey)) {
      return normalizedRow.get(normalizedKey);
    }
  }
  return undefined;
}

function normalizeHeader(value: string) {
  return value.replace(/^\uFEFF/, "").trim();
}

function cleanText(value: unknown) {
  if (isEmpty(value)) return undefined;
  return String(value).trim();
}

function cleanNumber(value: unknown, field: string, rowNumber: number) {
  if (isEmpty(value)) return undefined;

  const raw = String(value).trim();
  const cleaned = raw.replace(/[$,\s]/g, "");
  const parsed = Number(cleaned);

  if (!Number.isFinite(parsed)) {
    throw {
      row: rowNumber,
      field,
      error: `无法转换为数字: ${raw}`,
    } satisfies CsvImportError;
  }

  return parsed;
}

function cleanInteger(value: unknown, field: string, rowNumber: number) {
  const parsed = cleanNumber(value, field, rowNumber);
  return parsed === undefined ? undefined : Math.trunc(parsed);
}

function formatZodError(
  error: z.ZodError,
  rowNumber: number
): CsvImportError[] {
  return error.issues.map(issue => ({
    row: rowNumber,
    field: String(issue.path[0] ?? "row"),
    error: issue.message,
  }));
}

function omitUndefined<T extends Record<string, unknown>>(value: T) {
  return Object.fromEntries(
    Object.entries(value).filter(([, fieldValue]) => fieldValue !== undefined)
  );
}

export function normalizeCsvRow(
  row: Record<string, unknown>,
  rowNumber: number
): NormalizedCsvRow {
  try {
    const normalized = {
      asin: cleanText(readAliasedValue(row, "asin")),
      title: cleanText(readAliasedValue(row, "title")),
      category: cleanText(readAliasedValue(row, "category")),
      price: cleanNumber(readAliasedValue(row, "price"), "price", rowNumber),
      rating: cleanNumber(readAliasedValue(row, "rating"), "rating", rowNumber),
      reviewCount: cleanInteger(
        readAliasedValue(row, "reviewCount"),
        "review_count",
        rowNumber
      ),
      sellerCount: cleanInteger(
        readAliasedValue(row, "sellerCount"),
        "seller_count",
        rowNumber
      ),
      weight: cleanNumber(readAliasedValue(row, "weight"), "weight", rowNumber),
      dimensions: cleanText(readAliasedValue(row, "dimensions")),
      productUrl: cleanText(readAliasedValue(row, "productUrl")),
      keyword: cleanText(readAliasedValue(row, "keyword")),
    };

    for (const field of REQUIRED_FIELDS) {
      if (isEmpty(normalized[field])) {
        throw {
          row: rowNumber,
          field,
          error: "必填字段不能为空",
        } satisfies CsvImportError;
      }
    }

    return normalizedCsvRowSchema.parse(omitUndefined(normalized));
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw formatZodError(error, rowNumber)[0];
    }
    throw error;
  }
}
