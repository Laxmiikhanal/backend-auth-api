import mongoose from "mongoose";

export async function connectDatabase() {
  try {
    const MONGODB_URI =
      process.env.MONGODB_URI || "mongodb://localhost:27017/blossom_db";

    console.log("✅ MONGODB_URI BEING USED:", MONGODB_URI);

    await mongoose.connect(MONGODB_URI);

    console.log("✅ Connected to MongoDB");
    console.log("✅ DB NAME:", mongoose.connection.name);
    console.log("✅ DB HOST:", mongoose.connection.host);
  } catch (error) {
    console.error("Database Error:", error);
    process.exit(1);
  }
}
