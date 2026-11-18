import dns from "dns";
import mongoose from "mongoose";

// Set reliable public DNS servers on Windows/Node environments for SRV resolution
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch {
  // Ignore in environments where setServers is restricted
}

const MONGODB_URI = process.env.MONGODB_URI || "";
const MONGODB_DB = process.env.MONGODB_DB || "sukoon";

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };

if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export function isMongoConfigured(): boolean {
  if (!MONGODB_URI) return false;
  if (MONGODB_URI.includes("<password>")) return false;
  return true;
}

export async function connectToDatabase(): Promise<typeof mongoose | null> {
  if (!isMongoConfigured()) {
    return null;
  }

  // Ensure DNS is set before connecting
  try {
    dns.setServers(["8.8.8.8", "1.1.1.1"]);
  } catch {
    // ignore
  }

  if (cached.conn && cached.conn.connection.readyState === 1) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      dbName: MONGODB_DB,
      serverSelectionTimeoutMS: 5000,
    };

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((m) => {
        return m;
      })
      .catch((err) => {
        console.warn("MongoDB connection could not be established:", err.message);
        cached.promise = null;
        return null as unknown as typeof mongoose;
      });
  }

  try {
    const conn = await cached.promise;
    if (conn && conn.connection && conn.connection.readyState === 1) {
      cached.conn = conn;
    }
    return cached.conn;
  } catch (error) {
    console.warn("Failed resolving MongoDB connection:", error);
    cached.promise = null;
    return null;
  }
}
