import { Router } from "express";
import { placeOrder, getUserOrders } from "../controllers/order.controller";
import { authorizedMiddleware } from "../middlewares/authorized.middleware";

const router = Router();

// ---------------- PLACE ORDER ----------------
router.post("/", authorizedMiddleware, placeOrder);

// ---------------- GET USER ORDERS ----------------
router.get("/", authorizedMiddleware, getUserOrders);

export default router;