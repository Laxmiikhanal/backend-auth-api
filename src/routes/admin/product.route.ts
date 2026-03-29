import { Router } from "express";
import {
  createProduct,
  updateProduct,
  deleteProduct,
} from "../../controllers/admin/product.controller";
import { authorizedMiddleware, adminMiddleware } from "../../middlewares/authorized.middleware";

const router = Router();

router.post("/", authorizedMiddleware, adminMiddleware, createProduct);
router.put("/:id", authorizedMiddleware, adminMiddleware, updateProduct);
router.delete("/:id", authorizedMiddleware, adminMiddleware, deleteProduct);

export default router;