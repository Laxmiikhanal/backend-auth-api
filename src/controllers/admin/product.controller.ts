import { Request, Response } from "express";
import { AdminProductService } from "../../services/admin/product.service";

const service = new AdminProductService();

export class AdminProductController {
  async list(req: Request, res: Response) {
    const page = parseInt(String(req.query.page || "1")) || 1;
    const limit = parseInt(String(req.query.limit || "10")) || 10;
    const q = String(req.query.q || "");

    const result = await service.list({ page, limit, q });
    return res.status(200).json({ success: true, ...result });
  }

  async get(req: Request, res: Response) {
    const item = await service.getById(String(req.params.id));
    if (!item) return res.status(404).json({ success: false, message: "Product not found" });
    return res.status(200).json({ success: true, data: item });
  }

  async create(req: Request, res: Response) {
    const { name, price, description, stock, isActive, categoryId } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({ success: false, message: "name and price are required" });
    }

    const imageUrl = (req as any).file ? `/uploads/${(req as any).file.filename}` : "";

    const payload: any = {
      name,
      price: Number(price),
      description: description || "",
      stock: stock !== undefined ? Number(stock) : 0,
      isActive: isActive !== undefined ? String(isActive) !== "false" : true,
      imageUrl,
      categoryId: categoryId || null,
    };

    const created = await service.create(payload);
    return res.status(201).json({ success: true, data: created, message: "Product created" });
  }

  async update(req: Request, res: Response) {
    const id = String(req.params.id);

    const imageUrl = (req as any).file ? `/uploads/${(req as any).file.filename}` : undefined;

    const payload: any = {};
    if (req.body.name !== undefined) payload.name = req.body.name;
    if (req.body.price !== undefined) payload.price = Number(req.body.price);
    if (req.body.description !== undefined) payload.description = req.body.description;
    if (req.body.stock !== undefined) payload.stock = Number(req.body.stock);
    if (req.body.isActive !== undefined) payload.isActive = String(req.body.isActive) !== "false";
    if (req.body.categoryId !== undefined) payload.categoryId = req.body.categoryId || null;
    if (imageUrl !== undefined) payload.imageUrl = imageUrl;

    const updated = await service.update(id, payload);
    if (!updated) return res.status(404).json({ success: false, message: "Product not found" });

    return res.status(200).json({ success: true, data: updated, message: "Product updated" });
  }

  async remove(req: Request, res: Response) {
    const ok = await service.remove(String(req.params.id));
    if (!ok) return res.status(404).json({ success: false, message: "Product not found" });
    return res.status(200).json({ success: true, message: "Product deleted" });
  }
}
