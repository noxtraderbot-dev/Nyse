// Developed by NYSE. Copyright © 2026 NYSE.
import { Router } from "express";

const router = Router();

const GAINERS = [
  { symbol: "SOL", name: "Solana", price: 178.45, change24h: 12.34, changePercent24h: 7.43, volume: "$4.2B", marketCap: "$82.1B" },
  { symbol: "AVAX", name: "Avalanche", price: 38.92, change24h: 3.21, changePercent24h: 9.01, volume: "$1.1B", marketCap: "$16.0B" },
  { symbol: "MATIC", name: "Polygon", price: 0.8821, change24h: 0.0621, changePercent24h: 7.57, volume: "$780M", marketCap: "$8.2B" },
  { symbol: "LINK", name: "Chainlink", price: 18.76, change24h: 1.34, changePercent24h: 7.69, volume: "$920M", marketCap: "$11.2B" },
  { symbol: "UNI", name: "Uniswap", price: 11.43, change24h: 0.79, changePercent24h: 7.42, volume: "$340M", marketCap: "$6.8B" },
];

const LOSERS = [
  { symbol: "DOGE", name: "Dogecoin", price: 0.1287, change24h: -0.0098, changePercent24h: -7.08, volume: "$1.4B", marketCap: "$18.2B" },
  { symbol: "ADA", name: "Cardano", price: 0.5621, change24h: -0.0412, changePercent24h: -6.83, volume: "$520M", marketCap: "$19.8B" },
  { symbol: "XRP", name: "XRP", price: 0.6187, change24h: -0.0322, changePercent24h: -4.95, volume: "$2.1B", marketCap: "$33.7B" },
  { symbol: "DOT", name: "Polkadot", price: 8.12, change24h: -0.56, changePercent24h: -6.45, volume: "$290M", marketCap: "$10.2B" },
  { symbol: "LTC", name: "Litecoin", price: 87.43, change24h: -4.21, changePercent24h: -4.59, volume: "$480M", marketCap: "$6.4B" },
];

let lastAlertRefresh = 0;
let cachedAlerts: any[] = [];

function getTradeAlerts() {
  const now = Date.now();
  if (now - lastAlertRefresh < 24 * 60 * 60 * 1000 && cachedAlerts.length > 0) {
    return cachedAlerts;
  }
  lastAlertRefresh = now;
  cachedAlerts = [
    {
      id: 1,
      title: "Federal Reserve Interest Rate Decision",
      description: "The Fed is expected to hold rates steady at 5.25-5.5%. Markets anticipate dovish commentary hinting at cuts in Q1 2027.",
      impact: "HIGH",
      time: "Tomorrow, 2:00 PM EST",
      asset: "BTC, ETH, Indices",
    },
    {
      id: 2,
      title: "Ethereum EIP-7702 Upgrade",
      description: "The next Ethereum upgrade introducing smart account features goes live on testnet. Positive momentum expected for ETH.",
      impact: "HIGH",
      time: "Today, 4:00 PM UTC",
      asset: "ETH",
    },
    {
      id: 3,
      title: "Bitcoin Miner Capitulation Signal",
      description: "Hash ribbons indicator signaling potential miner capitulation. Historically a strong buy signal for BTC.",
      impact: "MEDIUM",
      time: "Ongoing",
      asset: "BTC",
    },
    {
      id: 4,
      title: "Solana Breakpoint Conference",
      description: "Annual Solana developer conference begins. Major protocol announcements expected. Historically bullish for SOL.",
      impact: "MEDIUM",
      time: "In 2 days",
      asset: "SOL",
    },
    {
      id: 5,
      title: "US CPI Inflation Data Release",
      description: "Consumer Price Index data for May 2026. Expected at 2.8% YoY. Deviation could trigger volatility across all assets.",
      impact: "HIGH",
      time: "Friday, 8:30 AM EST",
      asset: "All markets",
    },
    {
      id: 6,
      title: "Chainlink CCIP Mainnet Expansion",
      description: "CCIP expanding to 5 new blockchain networks. Cross-chain liquidity boost expected.",
      impact: "LOW",
      time: "This week",
      asset: "LINK",
    },
    {
      id: 7,
      title: "Coinbase Earnings Report",
      description: "Q2 2026 earnings expected to show record trading volume. May influence broader crypto sentiment.",
      impact: "MEDIUM",
      time: "Thursday, After Hours",
      asset: "Crypto sector",
    },
  ];
  return cachedAlerts;
}

router.get("/market/trending", async (req, res) => {
  // Add slight variation to prices
  const gainers = GAINERS.map(g => ({
    ...g,
    price: parseFloat((g.price * (1 + (Math.random() - 0.5) * 0.005)).toFixed(4)),
  }));
  const losers = LOSERS.map(l => ({
    ...l,
    price: parseFloat((l.price * (1 + (Math.random() - 0.5) * 0.005)).toFixed(4)),
  }));
  return res.json({ gainers, losers });
});

router.get("/market/crypto-rates", async (req, res) => {
  return res.json([
    { symbol: "BTC", name: "Bitcoin", usdRate: 67800 * (1 + (Math.random() - 0.5) * 0.01), icon: "₿" },
    { symbol: "ETH", name: "Ethereum", usdRate: 3450 * (1 + (Math.random() - 0.5) * 0.01), icon: "Ξ" },
    { symbol: "SOL", name: "Solana", usdRate: 178 * (1 + (Math.random() - 0.5) * 0.01), icon: "◎" },
    { symbol: "BNB", name: "BNB", usdRate: 610 * (1 + (Math.random() - 0.5) * 0.01), icon: "B" },
    { symbol: "USDT", name: "Tether", usdRate: 1, icon: "₮" },
    { symbol: "USDC", name: "USD Coin", usdRate: 1, icon: "$" },
  ]);
});

router.get("/market/trade-alerts", async (req, res) => {
  return res.json(getTradeAlerts());
});

export default router;
