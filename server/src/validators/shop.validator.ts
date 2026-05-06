import { z } from 'zod';

export const createShopSchema = z.object({
  name: z.string().min(2, 'Nom trop court'),
  description: z.string().optional(),
  address: z.string().min(5, 'Adresse requise'),
  latitude: z.number(),
  longitude: z.number(),
  practices: z.string().optional(),
  pickupPoints: z.array(z.object({
    name: z.string(),
    address: z.string(),
  })).optional(),
});

export const updateShopSchema = createShopSchema.partial();