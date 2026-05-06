import { Response } from 'express';
import { prisma } from '../config/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

export const createReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const productId = req.params.productId as string;
    const { rating, comment } = req.body;

    // Vérifier que l'acheteur a bien commandé ce produit
    const orderItem = await prisma.orderItem.findFirst({
      where: {
        productId,
        order: {
          buyerId: req.user!.id,
          status: 'DELIVERED',
        },
      },
    });

    if (!orderItem) {
      res.status(403).json({ message: 'Vous devez avoir reçu ce produit pour laisser un avis' });
      return;
    }

    const review = await prisma.review.create({
      data: {
        rating: parseInt(rating),
        comment,
        authorId: req.user!.id,
        productId,
      },
      include: {
        author: { select: { firstName: true, lastName: true } },
      },
    });

    res.status(201).json(review);
  } catch (err: any) {
    if (err.code === 'P2002') {
      res.status(400).json({ message: 'Vous avez déjà laissé un avis pour ce produit' });
      return;
    }
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const flagReview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    await prisma.review.update({
      where: { id },
      data: { status: 'FLAGGED' },
    });
    res.json({ message: 'Avis signalé' });
  } catch {
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
