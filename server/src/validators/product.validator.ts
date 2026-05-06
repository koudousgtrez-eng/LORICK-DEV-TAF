import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  category: z.string().min(1, 'Catégorie requise'),
  price: z.number().positive('Prix doit être positif'),
  unit: z.enum(['pièce', 'kg', 'litre', 'barquette']),
  stock: z.number().int().min(0),
  nutritionalInfo: z.string().optional(),
  isPublished: z.boolean().optional(),
});

export const updateProductSchema = createProductSchema.partial();
