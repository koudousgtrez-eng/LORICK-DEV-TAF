import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding...');

  // Nettoyage
  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.pickupPoint.deleteMany();
  await prisma.product.deleteMany();
  await prisma.shop.deleteMany();
  await prisma.user.deleteMany();

  const hash = await bcrypt.hash('password123', 10);

  // Acheteur
  const buyer = await prisma.user.create({
    data: {
      email: 'acheteur@ecomarket.fr',
      password: hash,
      firstName: 'Marie',
      lastName: 'Dupont',
      role: 'BUYER',
      isEmailVerified: true,
    },
  });

  // Vendeur 1
  const seller1 = await prisma.user.create({
    data: {
      email: 'ferme.martin@ecomarket.fr',
      password: hash,
      firstName: 'Jean',
      lastName: 'Martin',
      role: 'SELLER',
      isEmailVerified: true,
    },
  });

  // Vendeur 2
  const seller2 = await prisma.user.create({
    data: {
      email: 'maraicher.dupuis@ecomarket.fr',
      password: hash,
      firstName: 'Sophie',
      lastName: 'Dupuis',
      role: 'SELLER',
      isEmailVerified: true,
    },
  });

  // Admin
  await prisma.user.create({
    data: {
      email: 'admin@ecomarket.fr',
      password: hash,
      firstName: 'Admin',
      lastName: 'EcoMarket',
      role: 'ADMIN',
      isEmailVerified: true,
    },
  });

  // Boutique 1
  const shop1 = await prisma.shop.create({
    data: {
      name: 'Ferme Martin',
      description: 'Élevage bio, fromages et charcuteries artisanales depuis 3 générations.',
      address: '12 Route des Champs, 77000 Melun',
      latitude: 48.5397,
      longitude: 2.6539,
      status: 'APPROVED',
      ownerId: seller1.id,
    },
  });

  // Point de retrait boutique 1
  const pickup1 = await prisma.pickupPoint.create({
    data: {
      name: 'Ferme Martin — Sur place',
      address: '12 Route des Champs, 77000 Melun',
      shopId: shop1.id,
    },
  });

  // Boutique 2
  const shop2 = await prisma.shop.create({
    data: {
      name: 'Maraîchage Dupuis',
      description: 'Légumes et fruits de saison cultivés en agriculture raisonnée.',
      address: '8 Chemin des Vignes, 91300 Massy',
      latitude: 48.7258,
      longitude: 2.2717,
      status: 'APPROVED',
      ownerId: seller2.id,
    },
  });

  // Point de retrait boutique 2
  const pickup2 = await prisma.pickupPoint.create({
    data: {
      name: 'Maraîchage Dupuis — Marché',
      address: '8 Chemin des Vignes, 91300 Massy',
      shopId: shop2.id,
    },
  });

  // Produits boutique 1
  const p1 = await prisma.product.create({
    data: {
      name: 'Fromage de chèvre frais',
      description: 'Fromage artisanal au lait cru, affiné 10 jours.',
      category: 'fromage',
      price: 4.50,
      unit: 'pièce',
      stock: 30,
      isPublished: true,
      shopId: shop1.id,
    },
  });

  const p2 = await prisma.product.create({
    data: {
      name: 'Saucisson sec fermier',
      description: 'Saucisson traditionnel au porc élevé en plein air.',
      category: 'charcuterie',
      price: 12.00,
      unit: 'pièce',
      stock: 20,
      isPublished: true,
      shopId: shop1.id,
    },
  });

  await prisma.product.create({
    data: {
      name: 'Œufs fermiers (boîte de 6)',
      description: 'Poules élevées en plein air, alimentation 100% naturelle.',
      category: 'œufs',
      price: 3.20,
      unit: 'barquette',
      stock: 50,
      isPublished: true,
      shopId: shop1.id,
    },
  });

  // Produits boutique 2
  const p4 = await prisma.product.create({
    data: {
      name: 'Tomates anciennes',
      description: 'Variétés anciennes : cœur de bœuf, noire de Crimée, ananas.',
      category: 'légumes',
      price: 5.50,
      unit: 'kg',
      stock: 40,
      isPublished: true,
      shopId: shop2.id,
    },
  });

  await prisma.product.create({
    data: {
      name: 'Courgettes bio',
      description: 'Courgettes vertes et jaunes récoltées le matin même.',
      category: 'légumes',
      price: 2.80,
      unit: 'kg',
      stock: 60,
      isPublished: true,
      shopId: shop2.id,
    },
  });

  await prisma.product.create({
    data: {
      name: 'Fraises Gariguette',
      description: 'Fraises sucrées et parfumées, récoltées à la main.',
      category: 'fruits',
      price: 6.00,
      unit: 'barquette',
      stock: 25,
      isPublished: true,
      shopId: shop2.id,
    },
  });

  // Commande de démonstration
  const order = await prisma.order.create({
    data: {
      buyerId: buyer.id,
      shopId: shop1.id,
      pickupPointId: pickup1.id,
      totalAmount: 16.50,
      status: 'DELIVERED',
      stripePaymentId: 'pi_demo_123456',
      items: {
        create: [
          { productId: p1.id, quantity: 2, unitPrice: 4.50 },
          { productId: p2.id, quantity: 1, unitPrice: 12.00 },
        ],
      },
    },
  });

  // Avis
  await prisma.review.create({
    data: {
      rating: 5,
      comment: 'Fromage excellent, très frais et savoureux !',
      authorId: buyer.id,
      productId: p1.id,
    },
  });

  await prisma.review.create({
    data: {
      rating: 4,
      comment: 'Très bonnes tomates, je reviendrai !',
      authorId: buyer.id,
      productId: p4.id,
    },
  });

  console.log('✅ Seed terminé !');
  console.log('📧 Comptes créés :');
  console.log('   Acheteur  : acheteur@ecomarket.fr / password123');
  console.log('   Vendeur 1 : ferme.martin@ecomarket.fr / password123');
  console.log('   Vendeur 2 : maraicher.dupuis@ecomarket.fr / password123');
  console.log('   Admin     : admin@ecomarket.fr / password123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
  