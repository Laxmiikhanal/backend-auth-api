import { Router } from "express";
import { getAllUsers, getUserById, updateUser, deleteUser } from "../../controllers/admin/user.controller";
import { authorizedMiddleware, adminMiddleware } from "../../middlewares/authorized.middleware";

const router = Router();

// Admin-only routes
router.get("/", authorizedMiddleware, adminMiddleware, getAllUsers);
router.get("/:userId", authorizedMiddleware, adminMiddleware, getUserById);
router.put("/:userId", authorizedMiddleware, adminMiddleware, updateUser);
router.delete("/:userId", authorizedMiddleware, adminMiddleware, deleteUser);

export default router;