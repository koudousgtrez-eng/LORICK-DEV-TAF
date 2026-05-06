import { Router } from 'express';
import express from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import { createCheckoutSession, stripeWebhook, getMyOrders } from '../controllers/order.controller';

const router = Router();

router.post('/webhook', express.raw({ type: 'application/json' }), stripeWebhook);
router.post('/checkout', authenticate, createCheckoutSession);
router.get('/my-orders', authenticate, getMyOrders);

export default router;
