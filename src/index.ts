import express, { Application, Request, Response } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { connectDatabase } from "./database/mongodb";
import { PORT } from "./config";
import authRoutes from "./routes/auth.route";

const app: Application = express();

/**
 * CORS: allow your Next.js frontend (running on port 3001) to call this API
 */
app.use(
  cors({
    origin: ["http://localhost:3001"],
    credentials: true,
  })
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Optional but VERY helpful for debugging requests
app.use((req: Request, _res: Response, next) => {
  console.log(`[REQ] ${req.method} ${req.url}`);
  next();
});

app.use("/api/auth", authRoutes);

app.get("/", (_req: Request, res: Response) => {
  return res.status(200).json({ success: true, message: "Welcome to the API" });
});

async function startServer() {
  await connectDatabase();

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server: http://localhost:${PORT}`);
  });
}

startServer();
