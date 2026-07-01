// Developed by NYSE. Copyright © 2026 NYSE.
import { Router } from "express";
import { db } from "@workspace/db";
import { investmentsTable, tradesTable, notificationsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { tokenStore } from "./auth";

const router = Router();

const SYMBOLS = ["BTC/USD", "ETH/USD", "SOL/USD", "BNB/USD", "ADA/USD", "DOGE/USD", "XRP/USD", "MATIC/USD", "AVAX/USD", "DOT/USD", "LINK/USD", "UNI/USD", "LTC/USD", "ATOM/USD"];
const PRICES: Record<string, number> = {
  "BTC/USD": 67800, "ETH/USD": 3450, "SOL/USD": 178, "BNB/USD": 610,
  "ADA/USD": 0.58, "DOGE/USD": 0.13, "XRP/USD": 0.62, "MATIC/USD": 0.88,
  "AVAX/USD": 38, "DOT/USD": 8.2, "LINK/USD": 18.5, "UNI/USD": 11.2,
  "LTC/USD": 88, "ATOM/USD": 9.4,
};

function getUserId(req: any): number | null {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return null;
  return tokenStore.get(auth.slice(7)) ?? null;
}

function calcProgress(startDate: Date, endDate: Date): number {
  const total = endDate.getTime() - startDate.getTime();
  const elapsed = Date.now() - startDate.getTime();
  return Math.min(100, Math.max(0, (elapsed / total) * 100));
}

function calcCurrentValue(principal: number, targetReturn: number, progress: number): number {
  // Non-linear growth curve with some volatility
  const baseGrowth = (targetReturn - principal) * (progress / 100);
  const volatility = principal * 0.02 * Math.sin(progress / 10);
  return principal + baseGrowth + volatility;
}

router.get("/investments/active", async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const [inv] = await db.select().from(investmentsTable)
      .where(eq(investmentsTable.userId, userId))
      .orderBy(desc(investmentsTable.createdAt))
      .limit(1);

    if (!inv) {
      return res.status(404).json({ error: "No active investment" });
    }

    const principal = parseFloat(inv.principal as string);
    const targetReturn = parseFloat(inv.targetReturn as string);
    const progress = calcProgress(inv.startDate, inv.endDate);
    const currentValue = calcCurrentValue(principal, targetReturn, progress);
    const profitLoss = currentValue - principal;
    const daysRemaining = Math.max(0, Math.ceil((inv.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

    // Check if completed
    if (daysRemaining === 0 && inv.status === "active") {
      await db.update(investmentsTable).set({
        status: "completed",
        currentValue: targetReturn.toString(),
      }).where(eq(investmentsTable.id, inv.id));

      await db.insert(notificationsTable).values({
        userId,
        title: "Investment Goal Reached!",
        message: `Your 7-day AI investment has completed. Total return: $${targetReturn.toLocaleString()}`,
        type: "goal_hit",
      });
    }

    return res.json({
      id: inv.id,
      principal,
      targetReturn,
      currentValue: parseFloat(currentValue.toFixed(2)),
      profitLoss: parseFloat(profitLoss.toFixed(2)),
      profitLossPercent: parseFloat(((profitLoss / principal) * 100).toFixed(2)),
      startDate: inv.startDate.toISOString(),
      endDate: inv.endDate.toISOString(),
      daysRemaining,
      status: inv.status,
      progressPercent: parseFloat(progress.toFixed(2)),
    });
  } catch (err) {
    req.log.error({ err }, "Get investment error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/investments/trades", async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const trades = await db.select().from(tradesTable)
      .where(eq(tradesTable.userId, userId))
      .orderBy(desc(tradesTable.executedAt))
      .limit(100);

    return res.json(trades.map(t => ({
      id: t.id,
      symbol: t.symbol,
      type: t.type,
      amount: parseFloat(t.amount as string),
      price: parseFloat(t.price as string),
      profitLoss: parseFloat(t.profitLoss as string),
      profitLossPercent: parseFloat(t.profitLossPercent as string),
      status: t.status,
      executedAt: t.executedAt.toISOString(),
    })));
  } catch (err) {
    req.log.error({ err }, "Get trades error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/investments/refresh", async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const [inv] = await db.select().from(investmentsTable)
      .where(eq(investmentsTable.userId, userId))
      .orderBy(desc(investmentsTable.createdAt))
      .limit(1);

    if (!inv) return res.json([]);

    // Generate 3-6 new trades
    const numNew = 3 + Math.floor(Math.random() * 4);
    const newTrades: any[] = [];
    const principal = parseFloat(inv.principal as string);

    for (let i = 0; i < numNew; i++) {
      const symbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
      const basePrice = PRICES[symbol] || 100;
      const price = basePrice * (1 + (Math.random() - 0.5) * 0.02);
      const tradeAmount = principal * (0.03 + Math.random() * 0.06);
      const isLoss = Math.random() < 0.3;
      const pnl = isLoss
        ? -(tradeAmount * (0.005 + Math.random() * 0.02))
        : tradeAmount * (0.01 + Math.random() * 0.03);

      const executedAt = new Date();
      executedAt.setMinutes(executedAt.getMinutes() - Math.floor(Math.random() * 30));

      const [trade] = await db.insert(tradesTable).values({
        investmentId: inv.id,
        userId,
        symbol,
        type: Math.random() > 0.5 ? "BUY" : "SELL",
        amount: tradeAmount.toFixed(2),
        price: price.toFixed(6),
        profitLoss: pnl.toFixed(2),
        profitLossPercent: ((pnl / tradeAmount) * 100).toFixed(4),
        status: isLoss ? "LOSS" : "WIN",
        executedAt,
      }).returning();

      newTrades.push({
        id: trade.id,
        symbol: trade.symbol,
        type: trade.type,
        amount: parseFloat(trade.amount as string),
        price: parseFloat(trade.price as string),
        profitLoss: parseFloat(trade.profitLoss as string),
        profitLossPercent: parseFloat(trade.profitLossPercent as string),
        status: trade.status,
        executedAt: trade.executedAt.toISOString(),
      });
    }

    return res.json(newTrades);
  } catch (err) {
    req.log.error({ err }, "Refresh trades error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
