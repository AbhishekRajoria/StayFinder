import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

import { errorHandler } from "./middleware/errorHandler";
import authRoutes from "./routes/authRoutes";
import listingRoutes from "./routes/listingRoutes";
import bookingRoutes from "./routes/bookingRoutes";
import paymentROutes from "./routes/paymentRoutes";
import webhookRoutes from "./routes/webhookRoutes";
import { env } from "./config/env";
import { connectDB } from "./config/db";

dotenv.config();

const app = express();

app.set("trust proxy", 1);

// Webhook route must be registered BEFORE body parsing middleware
app.use("/api/webhook", webhookRoutes);

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(compression());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
if (env.NODE_ENV !== "production") {
  app.use(morgan("dev"));
}

// Ensure DB is connected for every request (serverless-aware; warm invocations
// reuse the cached connection)
app.use(async (_req, _res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many auth attempts, try again later." },
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/auth", authLimiter);
app.use("/api", apiLimiter);

// CORS — allow CLIENT_URL (env-driven so we don't hardcode hosts)
app.use(
  cors({
    origin: env.CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"],
    exposedHeaders: ["Set-Cookie"],
    maxAge: 600,
  })
);

// Health check (used for keep-alive pings + uptime monitoring)
app.get("/api/health", (_req, res) => {
  res.json({ ok: true, ts: Date.now() });
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", paymentROutes);

// Error handling
app.use(errorHandler);

// In a long-running container we still want process-level guards. On Vercel
// these have no effect (each function instance is per-invocation isolated).
if (env.NODE_ENV !== "production") {
  process.on("unhandledRejection", (err: Error) => {
    console.error("UNHANDLED REJECTION:", err.name, err.message);
  });
  process.on("uncaughtException", (err: Error) => {
    console.error("UNCAUGHT EXCEPTION:", err.name, err.message);
  });
}

export default app;
