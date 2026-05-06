import { Router } from 'express';
import { authenticate, requireRole } from '../middlewares/auth.middleware';
import {
  getStats,
  getUsers,
  toggleUser,
  getShops,
  updateShopStatus,
  getFlaggedReviews,
  deleteReview,
  restoreReview,
} from '../controllers/admin.controller';

const router = Router();

router.use(authenticate, requireRole('ADMIN'));

router.get('/stats', getStats);
router.get('/users', getUsers);
router.patch('/users/:id/toggle', toggleUser);
router.get('/shops', getShops);
router.patch('/shops/:id/status', updateShopStatus);
router.get('/reviews/flagged', getFlaggedReviews);
router.delete('/reviews/:id', deleteReview);
router.patch('/reviews/:id/restore', restoreReview);

export default router;