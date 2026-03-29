import { CategoryRepository } from '../repositories/category.repository';
import { HttpError } from '../errors/http-error';

const categoryRepository = new CategoryRepository();

export class CategoryService {
    async createCategory(data: { name: string; description?: string; imageUrl?: string }) {
        const existing = await categoryRepository.getCategoryByName(data.name);
        if (existing) {
            throw new HttpError(409, 'Category name already exists');
        }

        const category = await categoryRepository.createCategory(data);
        return category;
    }

    async getAllCategories() {
        return categoryRepository.getAllCategories();
    }

    async getCategoryById(id: string) {
        const category = await categoryRepository.getCategoryById(id);
        if (!category) {
            throw new HttpError(404, 'Category not found');
        }
        return category;
    }

    async updateCategory(id: string, data: { name?: string; description?: string; imageUrl?: string }) {
        if (data.name) {
            const existing = await categoryRepository.getCategoryByName(data.name);
            if (existing && existing._id.toString() !== id) {
                throw new HttpError(409, 'Category name already exists');
            }
        }

        const category = await categoryRepository.updateCategoryById(id, data);
        if (!category) {
            throw new HttpError(404, 'Category not found');
        }
        return category;
    }

    async deleteCategory(id: string) {
        const deleted = await categoryRepository.deleteCategoryById(id);
        if (!deleted) {
            throw new HttpError(404, 'Category not found');
        }
        return true;
    }
}
