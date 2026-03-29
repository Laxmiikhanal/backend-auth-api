import { ICategory, CategoryModel } from '../models/category.model';

export class CategoryRepository {
    async createCategory(data: Partial<ICategory>): Promise<ICategory> {
        const category = new CategoryModel(data);
        await category.save();
        return category;
    }

    async getCategoryById(id: string): Promise<ICategory | null> {
        return CategoryModel.findById(id);
    }

    async getAllCategories(): Promise<ICategory[]> {
        return CategoryModel.find().sort({ createdAt: -1 });
    }

    async updateCategoryById(id: string, data: Partial<ICategory>): Promise<ICategory | null> {
        return CategoryModel.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    }

    async deleteCategoryById(id: string): Promise<boolean> {
        const result = await CategoryModel.findByIdAndDelete(id);
        return !!result;
    }

    async getCategoryByName(name: string): Promise<ICategory | null> {
        return CategoryModel.findOne({ name });
    }
}
