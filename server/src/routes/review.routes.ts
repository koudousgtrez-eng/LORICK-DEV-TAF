import { Router } from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { createReview, flagReview } from '../controllers/review.controller';

const router = Router();

router.post('/products/:productId/reviews', authenticate, createReview);
router.patch('/reviews/:id/flag', authenticate, flagReview);

export default router;