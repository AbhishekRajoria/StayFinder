import mongoose from "mongoose";
import { env } from "./env";

/**
 * Cached connection pattern for serverless. Each cold-started function reuses a
 * single Mongo connection across warm invocations; concurrent invocations share
 * the same connect promise instead of dialling Atlas in parallel.
 */
type Cached = { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };

const globalForMongoose = global as unknown as { _mongoose?: Cached };

const cached: Cached = globalForMongoose._mongoose ?? { conn: null, promise: null };
globalForMongoose._mongoose = cached;

export async function connectDB(): Promise<typeof mongoose> {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose
      .connect(env.MONGODB_URI, {
        bufferCommands: false,
      })
      .then((m) => {
        console.log("Mongo connected.");
        return m;
      });
  }
  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    throw err;
  }
  return cached.conn;
}
