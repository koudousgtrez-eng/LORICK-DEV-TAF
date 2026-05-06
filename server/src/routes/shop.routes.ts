import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { getShops, getShop, createShop, getMyShop } from '../controllers/shop.controller';

const router = Router();

router.get('/', getShops);
router.get('/me/shop', authenticate, getMyShop);
router.get('/:id', getShop);
router.post('/', authenticate, createShop);

export default router;
