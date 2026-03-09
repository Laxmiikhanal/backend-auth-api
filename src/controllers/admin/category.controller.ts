import { Request, Response } from 'express';
import { CategoryService } from '../../services/category.service';
import { CreateCategoryDto, UpdateCategoryDto } from '../../dtos/ecommerce.dto';

const categoryService = new CategoryService();

export class CategoryController {
    async createCategory(req: Request, res: Response) {
        try {
            const parsed = CreateCategoryDto.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({
                    success: false,
                    message: parsed.error.issues.map((i) => i.message).join(', '),
                });
            }

            const data: any = parsed.data;

            // Handle image upload
            if ((req as any).file) {
                data.imageUrl = `/uploads/${(req as any).file.filename}`;
            }

            const category = await categoryService.createCategory(data);

            return res.status(201).json({
                success: true,
                data: category,
                message: 'Category created successfully',
            });
        } catch (error: any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || 'Internal Server Error',
            });
        }
    }

    async getAllCategories(req: Request, res: Response) {
        try {
            const categories = await categoryService.getAllCategories();
            return res.status(200).json({
                success: true,
                data: categories,
            });
        } catch (error: any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || 'Internal Server Error',
            });
        }
    }

    async getCategoryById(req: Request, res: Response) {
        try {
            const category = await categoryService.getCategoryById(req.params.id);
            return res.status(200).json({
                success: true,
                data: category,
            });
        } catch (error: any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || 'Internal Server Error',
            });
        }
    }

    async updateCategory(req: Request, res: Response) {
        try {
            const parsed = UpdateCategoryDto.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({
                    success: false,
                    message: parsed.error.issues.map((i) => i.message).join(', '),
                });
            }

            const data: any = parsed.data;

            // Handle image upload
            if ((req as any).file) {
                data.imageUrl = `/uploads/${(req as any).file.filename}`;
            }

            const category = await categoryService.updateCategory(req.params.id, data);

            return res.status(200).json({
                success: true,
                data: category,
                message: 'Category updated successfully',
            });
        } catch (error: any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || 'Internal Server Error',
            });
        }
    }

    async deleteCategory(req: Request, res: Response) {
        try {
            await categoryService.deleteCategory(req.params.id);
            return res.status(200).json({
                success: true,
                message: 'Category deleted successfully',
            });
        } catch (error: any) {
            return res.status(error.statusCode || 500).json({
                success: false,
                message: error.message || 'Internal Server Error',
            });
        }
    }
}
