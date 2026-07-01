// Developed by NYSE. Copyright © 2026 NYSE.
import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable, depositsTable, txnCodeUsageTable, investmentsTable, tradesTable, notificationsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { tokenStore } from "./auth";

const router = Router();

const VALID_CODES = new Set([
  "TXN-AX7K-9F2D-QW81-7C4E",
  "TXN-BR4M-3J8X-VP26-1LA9",
  "TXN-CK9Z-7N1F-XE84-2RW5",
  "TXN-DQ2H-8B6P-TM91-4YC7",
  "TXN-EV8L-5R3K-ZA72-9GX1",
  "TXN-FM1Q-4C9W-LD85-6NB2",
  "TXN-GX7D-2V8E-RT34-1PK9",
  "TXN-HZ5A-6Y2N-CF80-3QM4",
  "TXN-JN3T-8L7B-WX61-5RD2",
  "TXN-KP4F-1M9Z-VE73-8HA6",
  "TXN-LC8R-5Q2D-YN14-7BT3",
  "TXN-MW2X-7E6A-KR95-0CF8",
  "TXN-NF9P-3T1L-DX62-4GV7",
  "TXN-PR6B-8W5Q-AM30-9JK2",
  "TXN-QD1Y-4K8F-ZN57-6EX9",
  "TXN-RV7C-2P9H-LA84-1WM5",
  "TXN-SX5N-6D3R-QF20-8TB1",
  "TXN-TA9E-1V7K-CM65-4PY8",
  "TXN-UK4W-8B2X-JR91-5DN3",
  "TXN-VE6M-3F9A-XQ47-2LC8",
]);

const COOLDOWN_HOURS = 44;

const SYMBOLS = ["BTC/USD", "ETH/USD", "SOL/USD", "BNB/USD", "ADA/USD", "DOGE/USD", "XRP/USD", "MATIC/USD", "AVAX/USD", "DOT/USD"];
const PRICES: Record<string, number> = {
  "BTC/USD": 67800, "ETH/USD": 3450, "SOL/USD": 178, "BNB/USD": 610,
  "ADA/USD": 0.58, "DOGE/USD": 0.13, "XRP/USD": 0.62, "MATIC/USD": 0.88,
  "AVAX/USD": 38, "DOT/USD": 8.2,
};

function getUserId(req: any): number | null {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return null;
  return tokenStore.get(auth.slice(7)) ?? null;
}

function generateInitialTrades(investmentId: number, userId: number, principal: number, targetReturn: number) {
  const trades: any[] = [];
  const now = new Date();
  let runningValue = principal;
  const totalGain = targetReturn - principal;
  const numDays = 7;

  for (let day = 0; day < numDays; day++) {
    const tradesPerDay = 8 + Math.floor(Math.random() * 6); // 8-13 trades per day
    for (let t = 0; t < tradesPerDay; t++) {
      const symbol = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
      const basePrice = PRICES[symbol];
      const price = basePrice * (1 + (Math.random() - 0.5) * 0.02);
      const tradeAmount = (principal * 0.05) + (Math.random() * principal * 0.08);
      const isLoss = Math.random() < 0.35; // 35% chance of loss trade
      const rawPnl = isLoss
        ? -(tradeAmount * (0.005 + Math.random() * 0.025))
        : tradeAmount * (0.008 + Math.random() * 0.04);

      // Scale to ensure overall target is hit
      const dailyTarget = totalGain / numDays;
      const pnl = isLoss ? rawPnl : rawPnl * (dailyTarget / (tradesPerDay * tradeAmount * 0.02));
      const clampedPnl = isLoss ? Math.max(rawPnl, -tradeAmount * 0.03) : Math.min(pnl, tradeAmount * 0.05);

      const executedAt = new Date(now);
      executedAt.setDate(executedAt.getDate() - (numDays - 1 - day));
      executedAt.setHours(9 + Math.floor(Math.random() * 14), Math.floor(Math.random() * 60));

      trades.push({
        investmentId,
        userId,
        symbol,
        type: Math.random() > 0.5 ? "BUY" : "SELL",
        amount: parseFloat(tradeAmount.toFixed(2)),
        price: parseFloat(price.toFixed(6)),
        profitLoss: parseFloat(clampedPnl.toFixed(2)),
        profitLossPercent: parseFloat(((clampedPnl / tradeAmount) * 100).toFixed(4)),
        status: isLoss ? "LOSS" : "WIN",
        executedAt,
      });
    }
  }
  return trades;
}

router.get("/deposits", async (req, res) => {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ error: "Unauthorized" });

  const deposits = await db.select().from(depositsTable)
    .where(eq(depositsTable.userId, userId))
    .orderBy(desc(depositsTable.createdAt));

  return res.json(deposits.map(d => ({
    id: d.id,
    amount: parseFloat(d.amount as string),
    txnCode: d.txnCode,
    status: d.status,
    currency: d.currency,
    createdAt: d.createdAt.toISOString(),
  })));
});

router.post("/deposits", async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { amount, txnCode, currency } = req.body;
    if (!amount || !txnCode || !currency) {
      return res.status(400).json({ error: "Amount, transaction code, and currency are required" });
    }
    if (amount <= 0) {
      return res.status(400).json({ error: "Amount must be greater than 0" });
    }
    if (!VALID_CODES.has(txnCode.trim().toUpperCase())) {
      return res.status(400).json({ error: "Invalid transaction code" });
    }

    // Check cooldown
    const recentUsage = await db.select().from(txnCodeUsageTable)
      .where(eq(txnCodeUsageTable.txnCode, txnCode.trim().toUpperCase()))
      .orderBy(desc(txnCodeUsageTable.usedAt))
      .limit(1);

    if (recentUsage.length > 0) {
      const lastUsed = recentUsage[0].usedAt;
      const hoursSince = (Date.now() - lastUsed.getTime()) / (1000 * 60 * 60);
      if (hoursSince < COOLDOWN_HOURS) {
        return res.status(400).json({ error: "This code has already been used. Please try again later." });
      }
    }

    // Record code usage
    await db.insert(txnCodeUsageTable).values({ txnCode: txnCode.trim().toUpperCase() });

    // Create deposit
    const [deposit] = await db.insert(depositsTable).values({
      userId,
      amount: amount.toString(),
      txnCode: txnCode.trim().toUpperCase(),
      status: "completed",
      currency,
    }).returning();

    // Update user balance
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    const newBalance = parseFloat(user.balance as string) + parseFloat(amount.toString());
    await db.update(usersTable).set({ balance: newBalance.toString() }).where(eq(usersTable.id, userId));

    // Create or update investment
    const existing = await db.select().from(investmentsTable)
      .where(eq(investmentsTable.userId, userId))
      .limit(1);

    if (existing.length === 0) {
      // Create 7-day investment
      const multiplier = 1.85 + Math.random() * 0.3; // 1.85x - 2.15x
      const targetReturn = parseFloat((amount * multiplier).toFixed(2));
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 7);

      const [investment] = await db.insert(investmentsTable).values({
        userId,
        principal: amount.toString(),
        targetReturn: targetReturn.toString(),
        currentValue: amount.toString(),
        endDate,
        status: "active",
      }).returning();

      // Generate initial trades
      const trades = generateInitialTrades(investment.id, userId, amount, targetReturn);
      for (const trade of trades) {
        await db.insert(tradesTable).values({
          ...trade,
          amount: trade.amount.toString(),
          price: trade.price.toString(),
          profitLoss: trade.profitLoss.toString(),
          profitLossPercent: trade.profitLossPercent.toString(),
        });
      }
    }

    // Create notification
    await db.insert(notificationsTable).values({
      userId,
      title: "Deposit Confirmed",
      message: `Your deposit of $${parseFloat(amount.toString()).toLocaleString()} has been confirmed. AI investment started.`,
      type: "system",
    });

    return res.json({
      id: deposit.id,
      amount: parseFloat(deposit.amount as string),
      txnCode: deposit.txnCode,
      status: deposit.status,
      currency: deposit.currency,
      createdAt: deposit.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Deposit error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
