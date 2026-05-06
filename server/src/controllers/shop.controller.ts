import { Response } from 'express';
import { prisma } from '../config/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';
import { createShopSchema, updateShopSchema } from '../validators/shop.validator';
import { uploadToCloudinary } from '../utils/cloudinary';

export const createShop = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const existing = await prisma.shop.findUnique({ where: { ownerId: req.user!.id } });
    if (existing) { res.status(409).json({ message: 'Vous avez déjà une boutique' }); return; }

    const data = createShopSchema.parse(req.body);
    const files = req.files as Express.Multer.File[];
    const photos: string[] = [];

    if (files && files.length > 0) {
      for (const file of files) {
        const url = await uploadToCloudinary(file.path);
        photos.push(url);
      }
    }

    const { pickupPoints, ...shopData } = data;

    const shop = await prisma.shop.create({
      data: {
        ...shopData,
        photos,
        ownerId: req.user!.id,
        pickupPoints: pickupPoints ? { create: pickupPoints } : undefined,
      },
      include: { pickupPoints: true },
    });

    res.status(201).json(shop);
  } catch (err: any) {
    if (err.name === 'ZodError') { res.status(400).json({ errors: err.errors }); return; }
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const getShops = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { lat, lng, radius = '20' } = req.query as any;

    const shops = await prisma.shop.findMany({
      where: { status: 'APPROVED' },
      include: {
        owner: { select: { firstName: true, lastName: true } },
        products: {
          where: { isPublished: true },
          take: 4,
          select: { id: true, name: true, price: true, photos: true, category: true },
        },
        pickupPoints: true,
      },
    });

    let result = shops;
    if (lat && lng) {
      const userLat = parseFloat(lat);
      const userLng = parseFloat(lng);
      const maxRadius = parseFloat(radius);
      result = shops.filter(shop => {
        const distance = getDistance(userLat, userLng, shop.latitude, shop.longitude);
        return distance <= maxRadius;
      });
    }

    res.json(result);
  } catch {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const getShopById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const shopId = String(req.params.id);
    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
      include: {
        owner: { select: { firstName: true, lastName: true, email: true } },
        products: { where: { isPublished: true } },
        pickupPoints: true,
      },
    });

    if (!shop) { res.status(404).json({ message: 'Boutique introuvable' }); return; }
    res.json(shop);
  } catch {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const getMyShop = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const shop = await prisma.shop.findUnique({
      where: { ownerId: req.user!.id },
      include: { products: true, pickupPoints: true },
    });

    if (!shop) { res.status(404).json({ message: 'Aucune boutique trouvée' }); return; }
    res.json(shop);
  } catch {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const updateShop = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = updateShopSchema.parse(req.body);
    const files = req.files as Express.Multer.File[];
    const photos: string[] = [];

    if (files && files.length > 0) {
      for (const file of files) {
        const url = await uploadToCloudinary(file.path);
        photos.push(url);
      }
    }

    const { pickupPoints, ...shopData } = data;

    const shop = await prisma.shop.update({
      where: { ownerId: req.user!.id },
      data: {
        ...shopData,
        ...(photos.length > 0 && { photos }),
      },
    });

    res.json(shop);
  } catch (err: any) {
    if (err.name === 'ZodError') { res.status(400).json({ errors: err.errors }); return; }
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

const getDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};