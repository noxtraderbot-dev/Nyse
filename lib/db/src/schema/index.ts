import { pgTable, text, serial, integer, numeric, boolean, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const usersTable = pgTable("users", {
  id: serial("id").primaryKey(),
  username: varchar("username", { length: 64 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  balance: numeric("balance", { precision: 18, scale: 2 }).notNull().default("0"),
  accountStatus: varchar("account_status", { length: 32 }).notNull().default("Active"),
  tradeAlertsEnabled: boolean("trade_alerts_enabled").notNull().default(true),
  resetOtp: varchar("reset_otp", { length: 10 }),
  resetOtpEmail: varchar("reset_otp_email", { length: 255 }),
  referralCode: varchar("referral_code", { length: 16 }).unique(),
  referredBy: integer("referred_by"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true, createdAt: true });
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof usersTable.$inferSelect;

export const depositsTable = pgTable("deposits", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  amount: numeric("amount", { precision: 18, scale: 2 }).notNull(),
  txnCode: varchar("txn_code", { length: 64 }).notNull(),
  status: varchar("status", { length: 32 }).notNull().default("completed"),
  currency: varchar("currency", { length: 16 }).notNull().default("BTC"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertDepositSchema = createInsertSchema(depositsTable).omit({ id: true, createdAt: true });
export type InsertDeposit = z.infer<typeof insertDepositSchema>;
export type Deposit = typeof depositsTable.$inferSelect;

export const txnCodeUsageTable = pgTable("txn_code_usage", {
  id: serial("id").primaryKey(),
  txnCode: varchar("txn_code", { length: 64 }).notNull(),
  usedAt: timestamp("used_at").notNull().defaultNow(),
});

export type TxnCodeUsage = typeof txnCodeUsageTable.$inferSelect;

export const investmentsTable = pgTable("investments", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  principal: numeric("principal", { precision: 18, scale: 2 }).notNull(),
  targetReturn: numeric("target_return", { precision: 18, scale: 2 }).notNull(),
  currentValue: numeric("current_value", { precision: 18, scale: 2 }).notNull(),
  startDate: timestamp("start_date").notNull().defaultNow(),
  endDate: timestamp("end_date").notNull(),
  status: varchar("status", { length: 32 }).notNull().default("active"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Investment = typeof investmentsTable.$inferSelect;

export const tradesTable = pgTable("trades", {
  id: serial("id").primaryKey(),
  investmentId: integer("investment_id").notNull().references(() => investmentsTable.id),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  symbol: varchar("symbol", { length: 16 }).notNull(),
  type: varchar("type", { length: 8 }).notNull(),
  amount: numeric("amount", { precision: 18, scale: 2 }).notNull(),
  price: numeric("price", { precision: 18, scale: 6 }).notNull(),
  profitLoss: numeric("profit_loss", { precision: 18, scale: 2 }).notNull(),
  profitLossPercent: numeric("profit_loss_percent", { precision: 8, scale: 4 }).notNull(),
  status: varchar("status", { length: 16 }).notNull(),
  executedAt: timestamp("executed_at").notNull().defaultNow(),
});

export type Trade = typeof tradesTable.$inferSelect;

export const withdrawalsTable = pgTable("withdrawals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  amount: numeric("amount", { precision: 18, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 16 }).notNull(),
  walletAddress: text("wallet_address").notNull(),
  cryptoAmount: numeric("crypto_amount", { precision: 18, scale: 8 }).notNull(),
  status: varchar("status", { length: 32 }).notNull().default("reversed"),
  failureReason: text("failure_reason"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  completedAt: timestamp("completed_at"),
});

export type Withdrawal = typeof withdrawalsTable.$inferSelect;

export const notificationsTable = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => usersTable.id),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message").notNull(),
  type: varchar("type", { length: 32 }).notNull().default("system"),
  read: boolean("read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type Notification = typeof notificationsTable.$inferSelect;
