import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getShops = async (req: Request, res: Response): Promise<void> => {
  try {
    const shops = await prisma.shop.findMany({
      where: { status: 'APPROVED' },
      include: {
        products: {
          where: { isPublished: true },
          select: { id: true, name: true, price: true, photos: true },
        },
      },
    });
    res.json(shops);
  } catch {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const getShop = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const shop = await prisma.shop.findUnique({
      where: { id },
      include: {
        products: {
          where: { isPublished: true },
          orderBy: { createdAt: 'desc' },
        },
        owner: { select: { firstName: true, lastName: true } },
      },
    });
    if (!shop) { res.status(404).json({ message: 'Boutique introuvable' }); return; }
    res.json(shop);
  } catch {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const createShop = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const existing = await prisma.shop.findFirst({ where: { ownerId: req.user!.id } });
    if (existing) { res.status(400).json({ message: 'Vous avez déjà une boutique' }); return; }

    const { name, description, latitude, longitude, address } = req.body;

    const shop = await prisma.shop.create({
      data: {
        name,
        description,
        address: address || '',
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        ownerId: req.user!.id,
        status: 'APPROVED',
      },
    });
    res.status(201).json(shop);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const getMyShop = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const shop = await prisma.shop.findFirst({
      where: { ownerId: req.user!.id },
      include: {
        products: { orderBy: { createdAt: 'desc' } },
      },
    });
    if (!shop) { res.status(404).json({ message: 'Boutique introuvable' }); return; }
    res.json(shop);
  } catch {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};