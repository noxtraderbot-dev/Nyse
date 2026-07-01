// Developed by NYSE. Copyright © 2026 NYSE.
import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { tokenStore } from "./auth";
import crypto from "crypto";

const router = Router();

function getUserId(req: any): number | null {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) return null;
  return tokenStore.get(auth.slice(7)) ?? null;
}

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + "avernox_salt_2026").digest("hex");
}

router.get("/settings", async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    return res.json({
      username: user.username,
      email: user.email,
      accountStatus: user.accountStatus,
      tradeAlertsEnabled: user.tradeAlertsEnabled,
    });
  } catch (err) {
    req.log.error({ err }, "Get settings error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/settings", async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { username, accountStatus, tradeAlertsEnabled } = req.body;
    const updates: any = {};

    if (username !== undefined) {
      const existing = await db.select().from(usersTable).where(eq(usersTable.username, username)).limit(1);
      if (existing.length > 0 && existing[0].id !== userId) {
        return res.status(400).json({ error: "Username already taken" });
      }
      updates.username = username;
    }
    if (accountStatus !== undefined) updates.accountStatus = accountStatus;
    if (tradeAlertsEnabled !== undefined) updates.tradeAlertsEnabled = tradeAlertsEnabled;

    await db.update(usersTable).set(updates).where(eq(usersTable.id, userId));

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    return res.json({
      username: user.username,
      email: user.email,
      accountStatus: user.accountStatus,
      tradeAlertsEnabled: user.tradeAlertsEnabled,
    });
  } catch (err) {
    req.log.error({ err }, "Update settings error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/settings/change-password", async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: "Old and new passwords are required" });
    }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (user.passwordHash !== hashPassword(oldPassword)) {
      return res.status(400).json({ error: "Failed to change password. Old password is incorrect." });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: "New password must be at least 8 characters" });
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword)) {
      return res.status(400).json({ error: "New password must contain at least one special character" });
    }

    await db.update(usersTable).set({ passwordHash: hashPassword(newPassword) }).where(eq(usersTable.id, userId));
    return res.json({ message: "Password changed successfully" });
  } catch (err) {
    req.log.error({ err }, "Change password error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Password verification endpoint (used by withdrawal flow)
router.post("/settings/verify-password", async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const { password } = req.body;
    if (!password) return res.status(400).json({ error: "Password required" });

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    const valid = user.passwordHash === hashPassword(password);

    return res.json({ valid });
  } catch (err) {
    req.log.error({ err }, "Verify password error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
