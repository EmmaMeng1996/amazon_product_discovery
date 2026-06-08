import { decimal, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Products table - stores Amazon product data
export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  asin: varchar("asin", { length: 20 }).notNull().unique(),
  title: text("title").notNull(),
  category: varchar("category", { length: 255 }),
  price: decimal("price", { precision: 10, scale: 2 }),
  rating: decimal("rating", { precision: 3, scale: 1 }),
  reviewCount: int("reviewCount").default(0),
  sellerCount: int("sellerCount").default(0),
  weight: decimal("weight", { precision: 8, scale: 3 }), // in kg
  dimensions: varchar("dimensions", { length: 255 }), // e.g., "10 x 20 x 30 cm"
  productUrl: text("productUrl"),
  keyword: varchar("keyword", { length: 255 }),
  passedHardFilter: int("passedHardFilter").default(0), // 0 or 1
  filterReason: text("filterReason"), // reason for hard filter failure
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

// Scores table - stores product evaluation scores
export const scores = mysqlTable("scores", {
  id: int("id").autoincrement().primaryKey(),
  asin: varchar("asin", { length: 20 }).notNull().unique(),
  competitionScore: decimal("competitionScore", { precision: 5, scale: 2 }).default("0"), // 0-25
  profitScore: decimal("profitScore", { precision: 5, scale: 2 }).default("0"), // 0-25
  differentiationScore: decimal("differentiationScore", { precision: 5, scale: 2 }).default("0"), // 0-30
  developmentScore: decimal("developmentScore", { precision: 5, scale: 2 }).default("0"), // 0-20
  totalScore: decimal("totalScore", { precision: 5, scale: 2 }).default("0"), // 0-100
  grade: mysqlEnum("grade", ["A", "B", "C", "D"]).notNull(),
  recommendReason: text("recommendReason"),
  riskReason: text("riskReason"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Score = typeof scores.$inferSelect;
export type InsertScore = typeof scores.$inferInsert;

// Scoring rules table - stores configurable scoring parameters
export const scoringRules = mysqlTable("scoringRules", {
  id: int("id").autoincrement().primaryKey(),
  // Price range
  minPrice: decimal("minPrice", { precision: 10, scale: 2 }).default("20"),
  maxPrice: decimal("maxPrice", { precision: 10, scale: 2 }).default("80"),
  // Review count range
  minReviewCount: int("minReviewCount").default(50),
  maxReviewCount: int("maxReviewCount").default(800),
  // Weight limit (in kg)
  maxWeight: decimal("maxWeight", { precision: 8, scale: 3 }).default("1"),
  // Scoring weights (should sum to 100)
  competitionWeight: decimal("competitionWeight", { precision: 5, scale: 2 }).default("25"),
  profitWeight: decimal("profitWeight", { precision: 5, scale: 2 }).default("25"),
  differentiationWeight: decimal("differentiationWeight", { precision: 5, scale: 2 }).default("30"),
  developmentWeight: decimal("developmentWeight", { precision: 5, scale: 2 }).default("20"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ScoringRule = typeof scoringRules.$inferSelect;
export type InsertScoringRule = typeof scoringRules.$inferInsert;