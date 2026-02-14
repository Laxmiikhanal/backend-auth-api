import mongoose from "mongoose";

let isConnected = false;

export async function connectDatabase(): Promise<void> {
  try {
    // ✅ Use env first (important for Jest in-memory DB)
    const MONGODB_URI =
      process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/blossom_db";

    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI is not defined");
    }

    // ✅ Prevent multiple connections in tests / dev hot-reload
    if (isConnected) {
      return;
    }

    console.log("MONGODB_URI BEING USED:", MONGODB_URI);

    await mongoose.connect(MONGODB_URI);

    isConnected = true;

    console.log("✅ Connected to MongoDB");
    console.log("DB NAME:", mongoose.connection.name);
    console.log("DB HOST:", mongoose.connection.host);
  } catch (error) {
    console.error("❌ Database connection error:", error);

    // ❗ In tests we should NOT kill the process
    if (process.env.NODE_ENV !== "test") {
      process.exit(1);
    }

    throw error;
  }
}
