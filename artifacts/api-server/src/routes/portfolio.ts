// Developed by NYSE. Copyright © 2026 NYSE.
import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable, depositsTable, withdrawalsTable, investmentsTable, tradesTable } from "@workspace/db";
import { eq, sum, count, desc } from "drizzle-orm";
import { tokenStore } from "./auth";

const router = Router();

function getUserId(req: any): number | null {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return null;
  return tokenStore.get(auth.slice(7)) ?? null;
}

const HOLDINGS = [
  { symbol: "BTC", name: "Bitcoin", baseAlloc: 35 },
  { symbol: "ETH", name: "Ethereum", baseAlloc: 25 },
  { symbol: "SOL", name: "Solana", baseAlloc: 15 },
  { symbol: "BNB", name: "BNB", baseAlloc: 10 },
  { symbol: "ADA", name: "Cardano", baseAlloc: 8 },
  { symbol: "XRP", name: "XRP", baseAlloc: 7 },
];

const PRICES: Record<string, number> = {
  BTC: 67800, ETH: 3450, SOL: 178, BNB: 610, ADA: 0.58, XRP: 0.62,
};
const CHANGES: Record<string, number> = {
  BTC: 2.34, ETH: -1.12, SOL: 5.67, BNB: 0.89, ADA: -2.15, XRP: 3.45,
};

router.get("/portfolio/summary", async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    const balance = parseFloat(user.balance as string);

    const deposits = await db.select().from(depositsTable).where(eq(depositsTable.userId, userId));
    const totalDeposited = deposits.reduce((sum, d) => sum + parseFloat(d.amount as string), 0);

    const withdrawals = await db.select().from(withdrawalsTable).where(eq(withdrawalsTable.userId, userId));
    const totalWithdrawn = withdrawals.reduce((sum, w) => sum + parseFloat(w.amount as string), 0);

    const [inv] = await db.select().from(investmentsTable)
      .where(eq(investmentsTable.userId, userId))
      .orderBy(desc(investmentsTable.createdAt))
      .limit(1);

    let activeInvestmentValue = 0;
    if (inv) {
      const principal = parseFloat(inv.principal as string);
      const targetReturn = parseFloat(inv.targetReturn as string);
      const total = inv.endDate.getTime() - inv.startDate.getTime();
      const elapsed = Date.now() - inv.startDate.getTime();
      const progress = Math.min(100, Math.max(0, (elapsed / total) * 100));
      activeInvestmentValue = principal + (targetReturn - principal) * (progress / 100);
    }

    const trades = await db.select().from(tradesTable).where(eq(tradesTable.userId, userId));
    const totalTrades = trades.length;
    const wins = trades.filter(t => t.status === "WIN").length;
    const winRate = totalTrades > 0 ? (wins / totalTrades) * 100 : 0;

    const totalProfit = balance - totalDeposited + totalWithdrawn;
    const totalProfitPercent = totalDeposited > 0 ? (totalProfit / totalDeposited) * 100 : 0;

    return res.json({
      totalBalance: balance,
      totalDeposited,
      totalProfit: parseFloat(totalProfit.toFixed(2)),
      totalProfitPercent: parseFloat(totalProfitPercent.toFixed(2)),
      activeInvestmentValue: parseFloat(activeInvestmentValue.toFixed(2)),
      totalWithdrawn,
      winRate: parseFloat(winRate.toFixed(1)),
      totalTrades,
    });
  } catch (err) {
    req.log.error({ err }, "Portfolio summary error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/portfolio/holdings", async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    const balance = parseFloat(user.balance as string);

    if (balance <= 0) {
      return res.json([]);
    }

    const holdings = HOLDINGS.map(h => {
      const value = balance * (h.baseAlloc / 100) * (0.9 + Math.random() * 0.2);
      const price = PRICES[h.symbol];
      const amount = value / price;
      return {
        symbol: h.symbol,
        name: h.name,
        amount: parseFloat(amount.toFixed(6)),
        value: parseFloat(value.toFixed(2)),
        change24h: CHANGES[h.symbol],
        allocation: h.baseAlloc,
      };
    });

    return res.json(holdings);
  } catch (err) {
    req.log.error({ err }, "Portfolio holdings error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
