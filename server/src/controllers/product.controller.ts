import { Request, Response } from 'express';
import { prisma } from '../config/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, category, page = '1', limit = '12' } = req.query;
    const where: any = { isPublished: true };
    if (search) {
      where.OR = [
        { name: { contains: String(search), mode: 'insensitive' } },
        { description: { contains: String(search), mode: 'insensitive' } },
      ];
    }
    if (category) where.category = { equals: String(category), mode: 'insensitive' };
    const pageNum = parseInt(String(page));
    const limitNum = parseInt(String(limit));
    const skip = (pageNum - 1) * limitNum;
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { shop: { select: { id: true, name: true, latitude: true, longitude: true } } },
        skip, take: limitNum, orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where }),
    ]);
    res.json({ products, pagination: { total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const getProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        shop: { select: { id: true, name: true, latitude: true, longitude: true } },
        reviews: {
          include: { author: { select: { firstName: true, lastName: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    if (!product) { res.status(404).json({ message: 'Produit introuvable' }); return; }
    res.json(product);
  } catch {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const createProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const shop = await prisma.shop.findFirst({ where: { ownerId: req.user!.id } });
    if (!shop) { res.status(404).json({ message: 'Boutique introuvable' }); return; }
    const { name, description, category, price, unit, stock } = req.body;
    const product = await prisma.product.create({
      data: { name, description, category, price: parseFloat(price), unit, stock: parseInt(stock), shopId: shop.id, isPublished: false },
    });
    res.status(201).json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const toggleProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) { res.status(404).json({ message: 'Produit introuvable' }); return; }
    const updated = await prisma.product.update({ where: { id }, data: { isPublished: !product.isPublished } });
    res.json(updated);
  } catch {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};