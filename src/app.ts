import "dotenv/config";
import express, { Application, Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";
import { connectDatabase } from "./database/mongodb";
import { PORT } from "./config";
import cors from "cors";
import path from "path";
import cookieParser from "cookie-parser";
import { HttpError } from "./errors/http-error";

// ROUTES
import authRoutes from "./routes/auth.route";
import adminUserRoutes from "./routes/admin/user.route";
import adminCategoryRoutes from "./routes/admin/category.route";
import adminProductRoutes from "./routes/admin/product.route";
import adminOrderRoutes from "./routes/admin/order.route";
import categoryRoutes from "./routes/category.route";
import productRoutes from "./routes/product.route";
import orderRoutes from "./routes/order.route";

const app: Application = express();

/**
 * CORS configuration
 * Allow local development + mobile device access
 */
app.use(
  cors({
    origin: true, // allow any origin during development
    credentials: true,
    optionsSuccessStatus: 200,
  })
);

app.use(cookieParser());

// Static uploads
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Body parsing
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// API ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/admin/users", adminUserRoutes);
app.use("/api/admin/categories", adminCategoryRoutes);
app.use("/api/admin/products", adminProductRoutes);
app.use("/api/admin/orders", adminOrderRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);

// Root route
app.get("/", (req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    message: "Welcome to the API",
  });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof HttpError) {
    return res
      .status(err.statusCode)
      .json({ success: false, message: err.message });
  }

  return res.status(500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

async function startServer() {
  await connectDatabase();

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server listening on 0.0.0.0:${PORT}`);
  });
}

startServer();