// Developed by NYSE. Copyright © 2026 NYSE.
import { Router } from "express";
import { db } from "@workspace/db";
import { usersTable, notificationsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import crypto from "crypto";

const router = Router();

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + "avernox_salt_2026").digest("hex");
}

function generateToken(userId: number): string {
  return crypto.createHash("sha256").update(`${userId}_${Date.now()}_avernox`).digest("hex");
}

function generateOtp(): string {
  const pairs = ["11", "22", "33", "44", "55", "66", "77", "88", "99", "00"];
  const pair = pairs[Math.floor(Math.random() * pairs.length)];
  const remaining = Array.from({ length: 4 }, () => Math.floor(Math.random() * 10)).join("");
  const insertAt = Math.floor(Math.random() * 5);
  return (remaining.slice(0, insertAt) + pair + remaining.slice(insertAt)).slice(0, 6);
}

function generateReferralCode(username: string): string {
  const prefix = username.toUpperCase().slice(0, 4).replace(/[^A-Z0-9]/g, "X").padEnd(4, "X");
  const suffix = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `AVX-${prefix}${suffix}`;
}

// In-memory token store
const tokenStore = new Map<string, number>(); // token -> userId
export { tokenStore };

// Register
router.post("/auth/register", async (req, res) => {
  try {
    const { username, email, password, confirmPassword, referralCode } = req.body;
    if (!username || !email || !password || !confirmPassword) {
      return res.status(400).json({ error: "All fields are required" });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters" });
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      return res.status(400).json({ error: "Password must contain at least one special character" });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (existing.length > 0) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const existingUsername = await db.select().from(usersTable).where(eq(usersTable.username, username)).limit(1);
    if (existingUsername.length > 0) {
      return res.status(400).json({ error: "Username already taken" });
    }

    // Handle referral
    let referrerId: number | undefined;
    if (referralCode && referralCode.trim()) {
      const referrer = await db.select().from(usersTable)
        .where(eq(usersTable.referralCode, referralCode.trim().toUpperCase()))
        .limit(1);
      if (referrer.length > 0) {
        referrerId = referrer[0].id;
        // Credit $15 to referrer
        const newBalance = parseFloat(referrer[0].balance as string) + 15;
        await db.update(usersTable).set({ balance: newBalance.toString() }).where(eq(usersTable.id, referrer[0].id));
        // Notify referrer
        await db.insert(notificationsTable).values({
          userId: referrer[0].id,
          title: "Referral Bonus Received!",
          message: `${username} signed up using your referral code. $15.00 has been added to your account.`,
          type: "goal_hit",
        });
      }
    }

    const newReferralCode = generateReferralCode(username);

    const [user] = await db.insert(usersTable).values({
      username,
      email,
      passwordHash: hashPassword(password),
      referralCode: newReferralCode,
      referredBy: referrerId,
    }).returning();

    await db.insert(notificationsTable).values({
      userId: user.id,
      title: "Welcome to AverNox TraderBot",
      message: "Your account has been created successfully. Deposit funds to start your AI investment journey.",
      type: "system",
    });

    const token = generateToken(user.id);
    tokenStore.set(token, user.id);

    return res.status(201).json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        balance: parseFloat(user.balance as string),
        accountStatus: user.accountStatus,
        tradeAlertsEnabled: user.tradeAlertsEnabled,
        createdAt: user.createdAt.toISOString(),
      },
      token,
    });
  } catch (err) {
    req.log.error({ err }, "Register error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Login
router.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(401).json({ error: "Email and password are required" });
    }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (!user || user.passwordHash !== hashPassword(password)) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = generateToken(user.id);
    tokenStore.set(token, user.id);

    return res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        balance: parseFloat(user.balance as string),
        accountStatus: user.accountStatus,
        tradeAlertsEnabled: user.tradeAlertsEnabled,
        createdAt: user.createdAt.toISOString(),
      },
      token,
    });
  } catch (err) {
    req.log.error({ err }, "Login error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Logout
router.post("/auth/logout", async (req, res) => {
  const auth = req.headers.authorization;
  if (auth?.startsWith("Bearer ")) {
    tokenStore.delete(auth.slice(7));
  }
  return res.json({ message: "Logged out successfully" });
});

// Get current user
router.get("/auth/me", async (req, res) => {
  try {
    const auth = req.headers.authorization;
    if (!auth?.startsWith("Bearer ")) return res.status(401).json({ error: "Unauthorized" });
    const token = auth.slice(7);
    const userId = tokenStore.get(token);
    if (!userId) return res.status(401).json({ error: "Unauthorized" });

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).limit(1);
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    return res.json({
      id: user.id,
      username: user.username,
      email: user.email,
      balance: parseFloat(user.balance as string),
      accountStatus: user.accountStatus,
      tradeAlertsEnabled: user.tradeAlertsEnabled,
      createdAt: user.createdAt.toISOString(),
    });
  } catch (err) {
    req.log.error({ err }, "Get me error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Forgot password - send OTP
router.post("/auth/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (!user) {
      return res.json({ message: "If this email is registered, a code has been sent" });
    }

    const otp = generateOtp();
    await db.update(usersTable).set({ resetOtp: otp, resetOtpEmail: email }).where(eq(usersTable.id, user.id));

    return res.json({ message: "A 6-digit code has been sent to your email" });
  } catch (err) {
    req.log.error({ err }, "Forgot password error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Verify OTP
router.post("/auth/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ error: "Email and OTP are required" });

    // Validate OTP has a double digit
    const hasDouble = /(.)\1/.test(otp);
    if (!hasDouble || otp.length !== 6) {
      return res.status(400).json({ error: "Invalid code" });
    }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (!user || user.resetOtp !== otp) {
      return res.status(400).json({ error: "Invalid code" });
    }

    await db.update(usersTable).set({ resetOtp: null, resetOtpEmail: null }).where(eq(usersTable.id, user.id));

    const token = generateToken(user.id);
    tokenStore.set(token, user.id);

    return res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        balance: parseFloat(user.balance as string),
        accountStatus: user.accountStatus,
        tradeAlertsEnabled: user.tradeAlertsEnabled,
        createdAt: user.createdAt.toISOString(),
      },
      token,
    });
  } catch (err) {
    req.log.error({ err }, "Verify OTP error");
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
