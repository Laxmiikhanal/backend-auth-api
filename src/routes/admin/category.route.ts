// 
import { Router, Request, Response } from "express";
import { authorizedMiddleware, adminMiddleware } from "../../middlewares/authorized.middleware";
import { CategoryService } from "../../services/category.service"; // ✅ correct path

const router = Router();
const categoryService = new CategoryService();

// GET all categories
router.get("/", authorizedMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const categories = await categoryService.getAllCategories();
    return res.status(200).json({ success: true, data: categories });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message || "Failed to fetch categories" });
  }
});

// CREATE category
router.post("/", authorizedMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const created = await categoryService.createCategory(req.body);
    return res.status(201).json({ success: true, data: created, message: "Category created" });
  } catch (err: any) {
    return res.status(err?.statusCode || 400).json({
      success: false,
      message: err?.message || "Failed to create category",
    });
  }
});

// UPDATE category
router.put("/:id", authorizedMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    const updated = await categoryService.updateCategory(req.params.id, req.body);
    return res.status(200).json({ success: true, data: updated, message: "Category updated" });
  } catch (err: any) {
    return res.status(err?.statusCode || 400).json({
      success: false,
      message: err?.message || "Failed to update category",
    });
  }
});

// DELETE category
router.delete("/:id", authorizedMiddleware, adminMiddleware, async (req: Request, res: Response) => {
  try {
    await categoryService.deleteCategory(req.params.id);
    return res.status(200).json({ success: true, message: "Category deleted" });
  } catch (err: any) {
    return res.status(err?.statusCode || 400).json({
      success: false,
      message: err?.message || "Failed to delete category",
    });
  }
});

export default router;