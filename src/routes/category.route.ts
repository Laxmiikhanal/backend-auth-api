import { Router } from 'express';
import { CategoryPublicController } from '../controllers/category.controller';

const router = Router();
const categoryController = new CategoryPublicController();

router.get('/', categoryController.getAllCategories.bind(categoryController));
router.get('/:id', categoryController.getCategoryById.bind(categoryController));

export default router;
