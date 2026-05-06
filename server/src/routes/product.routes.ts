import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { getProducts, getProduct, createProduct, toggleProduct } from '../controllers/product.controller';

const router = Router();

router.get('/', getProducts);
router.get('/:id', getProduct);
router.post('/', authenticate, createProduct);
router.patch('/:id/toggle', authenticate, toggleProduct);

export default router;
