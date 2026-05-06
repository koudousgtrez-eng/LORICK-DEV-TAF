import { Response } from 'express';
import Stripe from 'stripe';
import { prisma } from '../config/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';
import { sendEmail } from '../utils/mailer';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

export const createCheckoutSession = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { items, pickupPointId } = req.body;

    if (!items || items.length === 0) {
      res.status(400).json({ message: 'Panier vide' });
      return;
    }

    const products = await Promise.all(
      items.map((item: any) => prisma.product.findUnique({
        where: { id: item.productId },
        include: { shop: true },
      }))
    );

    const lineItems = products.map((product: any, i: number) => ({
      price_data: {
        currency: 'eur',
        product_data: { name: product.name },
        unit_amount: Math.round(product.price * 100),
      },
      quantity: items[i].quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.CLIENT_URL}/order-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/cart`,
      metadata: {
        buyerId: req.user!.id,
        pickupPointId,
        items: JSON.stringify(items),
      },
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur paiement' });
  }
};

export const stripeWebhook = async (req: any, res: Response): Promise<void> => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET || '');
  } catch {
    res.status(400).json({ message: 'Webhook invalide' });
    return;
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as any;
    const { buyerId, pickupPointId, items } = session.metadata;
    const parsedItems = JSON.parse(items);

    const products = await Promise.all(
      parsedItems.map((item: any) => prisma.product.findUnique({
        where: { id: item.productId },
        include: { shop: true },
      }))
    );

    const shopId = products[0]?.shop.id;

    const order = await prisma.order.create({
      data: {
        buyerId,
        shopId,
        pickupPointId,
        totalAmount: session.amount_total / 100,
        stripePaymentId: session.payment_intent,
        items: {
          create: parsedItems.map((item: any, i: number) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: products[i]?.price || 0,
          })),
        },
      },
      include: { buyer: true },
    });

    await sendEmail({
      to: order.buyer.email,
      subject: 'Commande confirmée — EcoMarket',
      html: `<h2>Commande confirmée ✅</h2><p>Votre commande #${order.id.slice(0, 8)} a été reçue.</p>`,
    });
  }

  res.json({ received: true });
};

export const getMyOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orders = await prisma.order.findMany({
      where: { buyerId: req.user!.id },
      include: {
        items: { include: { product: { select: { name: true, photos: true } } } },
        shop: { select: { name: true } },
        pickupPoint: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(orders);
  } catch {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
