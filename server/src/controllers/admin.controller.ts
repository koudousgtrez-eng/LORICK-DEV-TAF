import { Response } from 'express';
import { prisma } from '../config/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [users, shops, orders, reviews] = await Promise.all([prisma.user.count(), prisma.shop.count(), prisma.order.count(), prisma.review.count()]);
    const revenue = await prisma.order.aggregate({ _sum: { totalAmount: true } });
    res.json({ users, shops, orders, reviews, totalRevenue: revenue._sum.totalAmount || 0 });
  } catch { res.status(500).json({ message: 'Erreur serveur' }); }
};

export const getUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({ select: { id: true, email: true, firstName: true, lastName: true, role: true, isEmailVerified: true, createdAt: true }, orderBy: { createdAt: 'desc' } });
    res.json(users);
  } catch { res.status(500).json({ message: 'Erreur serveur' }); }
};

export const toggleUser = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) { res.status(404).json({ message: 'Utilisateur introuvable' }); return; }
    const updated = await prisma.user.update({ where: { id }, data: { isEmailVerified: !user.isEmailVerified } });
    res.json({ message: updated.isEmailVerified ? 'Compte réactivé' : 'Compte suspendu' });
  } catch { res.status(500).json({ message: 'Erreur serveur' }); }
};

export const getShops = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const shops = await prisma.shop.findMany({ include: { owner: { select: { firstName: true, lastName: true, email: true } } }, orderBy: { createdAt: 'desc' } });
    res.json(shops);
  } catch { res.status(500).json({ message: 'Erreur serveur' }); }
};

export const updateShopStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const { status } = req.body;
    const shop = await prisma.shop.update({ where: { id }, data: { status } });
    res.json(shop);
  } catch { res.status(500).json({ message: 'Erreur serveur' }); }
};

export const getFlaggedReviews = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const reviews = await prisma.review.findMany({ where: { status: 'FLAGGED' as any }, include: { author: { select: { firstName: true, lastName: true } }, product: { select: { name: true } } }, orderBy: { createdAt: 'desc' } });
    res.json(reviews);
  } catch { res.status(500).json({ message: 'Erreur serveur' }); }
};

export const deleteReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    await prisma.review.delete({ where: { id } });
    res.json({ message: 'Avis supprimé' });
  } catch { res.status(500).json({ message: 'Erreur serveur' }); }
};

export const restoreReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    await prisma.review.update({ where: { id }, data: { status: 'VISIBLE' as any } });
    res.json({ message: 'Avis restauré' });
  } catch { res.status(500).json({ message: 'Erreur serveur' }); }
};
