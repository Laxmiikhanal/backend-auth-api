import "dotenv/config";
import mongoose from "mongoose";
import { ProductModel } from "./src/models/product.model";

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI missing in .env");

  await mongoose.connect(uri);
  console.log("✅ Connected:", uri);

  const products = [
    { name: "Floral Surprise", price: 2500, description: "Offer flowers", imageUrl: "/flowers.jpg", stock: 20, isActive: true, categoryId: null },
    { name: "Sunny Sunflowers", price: 3200, description: "Sunflower bouquet", imageUrl: "/sunflowerrrr.jpg", stock: 20, isActive: true, categoryId: null },
    { name: "Birthday Delight", price: 4000, description: "Birthday flowers", imageUrl: "/birthday.jpg", stock: 20, isActive: true, categoryId: null },
    { name: "White Rose", price: 1500, description: "White rose", imageUrl: "/whiterose.jpg", stock: 20, isActive: true, categoryId: null },
    { name: "Red Rose Classic", price: 1800, description: "Red rose", imageUrl: "/redrose.jpg", stock: 20, isActive: true, categoryId: null },
    { name: "Pink Rose Bouquet", price: 2200, description: "Pink rose bouquet", imageUrl: "/pinkrosebouquet.jpg", stock: 20, isActive: true, categoryId: null },
    { name: "Rose Bouquet (Luxury)", price: 5500, description: "Luxury rose bouquet", imageUrl: "/imageflower.jpg", stock: 20, isActive: true, categoryId: null },
    { name: "Pink Rose", price: 125, description: "Pink rose", imageUrl: "/pinkrosee.jpg", stock: 50, isActive: true, categoryId: null },
    { name: "Fresh Tulip Bouquet", price: 3800, description: "Tulip bouquet", imageUrl: "/image6.png", stock: 20, isActive: true, categoryId: null },
    { name: "Yellow Tulip", price: 285, description: "Yellow tulip", imageUrl: "/yellowtulip.jpg", stock: 30, isActive: true, categoryId: null },
    { name: "White Tulip", price: 290, description: "White tulip", imageUrl: "/whitetulip.jpg", stock: 30, isActive: true, categoryId: null },
    { name: "Pink Elegance", price: 3500, description: "Mix bouquet", imageUrl: "/bouquet.jpg", stock: 20, isActive: true, categoryId: null },
    { name: "Rainbow Bliss", price: 2800, description: "Colorful bouquet", imageUrl: "/colorfulflower.jpg", stock: 20, isActive: true, categoryId: null }
  ];

  for (const p of products) {
    await ProductModel.updateOne({ name: p.name }, { $set: p }, { upsert: true });
  }

  console.log("✅ Seeded:", products.length);
  process.exit(0);
}

run().catch((e) => {
  console.error("❌ Seed failed:", e);
  process.exit(1);
});