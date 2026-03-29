import { Request, Response } from 'express';
import { CategoryService } from '../services/category.service';

const categoryService = new CategoryService();

export class CategoryPublicController {
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
}
