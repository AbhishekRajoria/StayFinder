import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = [
  "MONGODB_URI",
  "JWT_SECRET",
  "JWT_REFRESH_SECRET",
  "COOKIE_SECRET",
] as const;

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

// Export validated environment variables
export const env = {
  // Server
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || "development",
  
  // MongoDB
  MONGODB_URI: process.env.MONGODB_URI!,
  
  // JWT
  JWT_SECRET: process.env.JWT_SECRET!,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET!,
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
  
  // Client — env-driven so we can deploy to any backend host without code change
  CLIENT_URL: process.env.CLIENT_URL ||
    (process.env.NODE_ENV === 'production'
      ? 'https://stayfinder-eta.vercel.app'
      : 'http://localhost:5173'),

  // Cookie
  COOKIE_SECRET: process.env.COOKIE_SECRET!,
  COOKIE_EXPIRES_IN: parseInt(process.env.COOKIE_EXPIRES_IN || "7", 10),
  // No domain set — cookie is scoped to the API host. Cross-site delivery to
  // the FE relies on SameSite=None + Secure + CORS credentials.
  COOKIE_DOMAIN: undefined as string | undefined,
} as const;
