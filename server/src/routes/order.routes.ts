import { Router } from 'express';
import express from 'express';
import { authenticate } from '../middlewares/auth.middleware';
import {
  createCheckoutSession,
  stripeWebhook,
  getMyOrders,
  getSellerOrders,
  updateOrderStatus,
} from '../controllers/order.controller';

const router = Router();

router.post('/webhook', express.raw({ type: 'application/json' }), stripeWebhook);
router.post('/checkout', authenticate, createCheckoutSession);
router.get('/my-orders', authenticate, getMyOrders);
router.get('/seller-orders', authenticate, getSellerOrders);
router.patch('/:id/status', authenticate, updateOrderStatus);

export default router;