import { Router } from 'express';
import { authenticate, requireRole } from '../middlewares/auth.middleware';
import { upload } from '../utils/cloudinary';
import {
  createShop, getShops, getShopById,
  getMyShop, updateShop,
} from '../controllers/shop.controller';

const router = Router();

router.get('/', getShops);
router.get('/:id', getShopById);
router.get('/me/shop', authenticate, requireRole('SELLER'), getMyShop);
router.post('/', authenticate, requireRole('SELLER'), upload.array('photos', 5), createShop);
router.put('/me', authenticate, requireRole('SELLER'), upload.array('photos', 5), updateShop);

export default router;
