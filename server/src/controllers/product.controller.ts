import { Response } from 'express';
import { prisma } from '../config/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';
import { createProductSchema, updateProductSchema } from '../validators/product.validator';
import { uploadToCloudinary } from '../utils/cloudinary';

export const createProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const shop = await prisma.shop.findUnique({ where: { ownerId: req.user!.id } });
    if (!shop) { res.status(404).json({ message: 'Créez d\'abord une boutique' }); return; }

    const data = createProductSchema.parse(req.body);
    const files = req.files as Express.Multer.File[];
    const photos: string[] = [];

    if (files && files.length > 0) {
      for (const file of files.slice(0, 5)) {
        const url = await uploadToCloudinary(file.path);
        photos.push(url);
      }
    }

    const product = await prisma.product.create({
      data: { ...data, photos, shopId: shop.id },
    });

    res.status(201).json(product);
  } catch (err: any) {
    if (err.name === 'ZodError') { res.status(400).json({ errors: err.errors }); return; }
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const getProducts = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { category, minPrice, maxPrice, search, page = '1', limit = '12' } = req.query as any;

    const where: any = { isPublished: true };
    if (category) where.category = category;
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          shop: {
            select: { id: true, name: true, latitude: true, longitude: true },
          },
          reviews: { select: { rating: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where }),
    ]);

    res.json({
      products,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const getProductById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: String(req.params.id) },
      include: {
        shop: { include: { pickupPoints: true } },
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

export const updateProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const shop = await prisma.shop.findUnique({ where: { ownerId: req.user!.id } });
    if (!shop) { res.status(403).json({ message: 'Accès refusé' }); return; }

    const product = await prisma.product.findFirst({
      where: { id: String(req.params.id), shopId: shop.id },
    });
    if (!product) { res.status(404).json({ message: 'Produit introuvable' }); return; }

    const data = updateProductSchema.parse(req.body);
    const updated = await prisma.product.update({
      where: { id: String(req.params.id) },
      data,
    });

    res.json(updated);
  } catch (err: any) {
    if (err.name === 'ZodError') { res.status(400).json({ errors: err.errors }); return; }
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const deleteProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const shop = await prisma.shop.findUnique({ where: { ownerId: req.user!.id } });
    if (!shop) { res.status(403).json({ message: 'Accès refusé' }); return; }

    await prisma.product.delete({ where: { id: String(req.params.id) } });
    res.json({ message: 'Produit supprimé' });
  } catch {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const togglePublish = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const shop = await prisma.shop.findUnique({ where: { ownerId: req.user!.id } });
    if (!shop) { res.status(403).json({ message: 'Accès refusé' }); return; }

    const product = await prisma.product.findFirst({
      where: { id: String(req.params.id), shopId: shop.id },
    });
    if (!product) { res.status(404).json({ message: 'Produit introuvable' }); return; }

    const updated = await prisma.product.update({
      where: { id: String(req.params.id) },
      data: { isPublished: !product.isPublished },
    });

    res.json(updated);
  } catch {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
