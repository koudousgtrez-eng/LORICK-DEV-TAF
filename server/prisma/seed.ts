import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding...');
  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.pickupPoint.deleteMany();
  await prisma.product.deleteMany();
  await prisma.shop.deleteMany();
  await prisma.user.deleteMany();

  const hash = await bcrypt.hash('password123', 10);
  const buyer = await prisma.user.create({ data: { email: 'acheteur@ecomarket.fr', password: hash, firstName: 'Marie', lastName: 'Dupont', role: 'BUYER', isEmailVerified: true } });
  const seller1 = await prisma.user.create({ data: { email: 'ferme.martin@ecomarket.fr', password: hash, firstName: 'Jean', lastName: 'Martin', role: 'SELLER', isEmailVerified: true } });
  const seller2 = await prisma.user.create({ data: { email: 'maraicher.dupuis@ecomarket.fr', password: hash, firstName: 'Sophie', lastName: 'Dupuis', role: 'SELLER', isEmailVerified: true } });
  await prisma.user.create({ data: { email: 'admin@ecomarket.fr', password: hash, firstName: 'Admin', lastName: 'EcoMarket', role: 'ADMIN', isEmailVerified: true } });

  const shop1 = await prisma.shop.create({ data: { name: 'Ferme Martin', description: 'Elevage bio, fromages et charcuteries artisanales depuis 3 generations.', address: '12 Route des Champs, 77000 Melun', latitude: 48.5397, longitude: 2.6539, status: 'APPROVED', ownerId: seller1.id, photos: ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&auto=format&fit=crop'] } });
  const pickup1 = await prisma.pickupPoint.create({ data: { name: 'Ferme Martin - Sur place', address: '12 Route des Champs, 77000 Melun', shopId: shop1.id } });
  const shop2 = await prisma.shop.create({ data: { name: 'Maraichage Dupuis', description: 'Legumes et fruits de saison cultives en agriculture raisonnee.', address: '8 Chemin des Vignes, 91300 Massy', latitude: 48.7258, longitude: 2.2717, status: 'APPROVED', ownerId: seller2.id, photos: ['https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800&auto=format&fit=crop'] } });
  const pickup2 = await prisma.pickupPoint.create({ data: { name: 'Maraichage Dupuis - Marche', address: '8 Chemin des Vignes, 91300 Massy', shopId: shop2.id } });

  // Images 100% fiables testées
  const p1 = await prisma.product.create({ data: { name: 'Fromage de chevre frais', description: 'Fromage artisanal au lait cru, affine 10 jours.', category: 'fromage', price: 4.50, unit: 'piece', stock: 30, isPublished: true, shopId: shop1.id, photos: ['https://images.unsplash.com/photo-1452195100486-9cc805987862?w=600&q=80'] } });
  const p2 = await prisma.product.create({ data: { name: 'Saucisson sec fermier', description: 'Saucisson traditionnel au porc eleve en plein air.', category: 'charcuterie', price: 12.00, unit: 'piece', stock: 20, isPublished: true, shopId: shop1.id, photos: ['https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=600&q=80'] } });
  await prisma.product.create({ data: { name: 'Oeufs fermiers (boite de 6)', description: 'Poules elevees en plein air, alimentation 100% naturelle.', category: 'oeufs', price: 3.20, unit: 'barquette', stock: 50, isPublished: true, shopId: shop1.id, photos: ['https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=600&q=80'] } });
  await prisma.product.create({ data: { name: 'Miel de fleurs sauvages', description: 'Miel recolte en juin, ruches en bordure de foret.', category: 'epicerie', price: 8.50, unit: 'pot', stock: 15, isPublished: true, shopId: shop1.id, photos: ['https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=600&q=80'] } });
  const p4 = await prisma.product.create({ data: { name: 'Tomates anciennes', description: 'Varietes anciennes : coeur de boeuf, noire de Crimee, ananas.', category: 'legumes', price: 5.50, unit: 'kg', stock: 40, isPublished: true, shopId: shop2.id, photos: ['https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&q=80'] } });
  await prisma.product.create({ data: { name: 'Courgettes bio', description: 'Courgettes vertes et jaunes recoltees le matin meme.', category: 'legumes', price: 2.80, unit: 'kg', stock: 60, isPublished: true, shopId: shop2.id, photos: ['https://images.unsplash.com/photo-1566486189376-d5f21e25aae4?w=600&q=80'] } });
  await prisma.product.create({ data: { name: 'Fraises Gariguette', description: 'Fraises sucrees et parfumees, recoltees a la main.', category: 'fruits', price: 6.00, unit: 'barquette', stock: 25, isPublished: true, shopId: shop2.id, photos: ['https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=600&q=80'] } });
  await prisma.product.create({ data: { name: 'Carottes fanes', description: 'Carottes primeurs avec fanes fraiches.', category: 'legumes', price: 3.00, unit: 'botte', stock: 35, isPublished: true, shopId: shop2.id, photos: ['https://images.unsplash.com/photo-1447175008436-054170c2e979?w=600&q=80'] } });
  await prisma.product.create({ data: { name: 'Pommes Golden', description: 'Pommes croquantes et sucrees, verger sans pesticides.', category: 'fruits', price: 4.00, unit: 'kg', stock: 80, isPublished: true, shopId: shop2.id, photos: ['https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=600&q=80'] } });

  await prisma.order.create({ data: { buyerId: buyer.id, shopId: shop1.id, pickupPointId: pickup1.id, totalAmount: 16.50, status: 'DELIVERED', stripePaymentId: 'pi_demo_123456', items: { create: [{ productId: p1.id, quantity: 2, unitPrice: 4.50 }, { productId: p2.id, quantity: 1, unitPrice: 12.00 }] } } });
  await prisma.review.create({ data: { rating: 5, comment: 'Fromage excellent !', authorId: buyer.id, productId: p1.id } });
  await prisma.review.create({ data: { rating: 4, comment: 'Tres bonnes tomates !', authorId: buyer.id, productId: p4.id } });
  console.log('Seed termine !');
}
main().catch(console.error).finally(() => prisma.$disconnect());
