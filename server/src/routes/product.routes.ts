import { Router } from 'express';
import { authenticate, requireRole } from '../middlewares/auth.middleware';
import { upload } from '../utils/cloudinary';
import {
  createProduct, getProducts, getProductById,
  updateProduct, deleteProduct, togglePublish,
} from '../controllers/product.controller';

const router = Router();

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', authenticate, requireRole('SELLER'), upload.array('photos', 5), createProduct);
router.put('/:id', authenticate, requireRole('SELLER'), updateProduct);
router.delete('/:id', authenticate, requireRole('SELLER'), deleteProduct);
router.patch('/:id/toggle', authenticate, requireRole('SELLER'), togglePublish);

export default router;
