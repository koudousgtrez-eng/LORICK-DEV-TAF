cat > /Users/king/LORICK-DEV-TAF/server/prisma/seed.ts << 'SEEDEOF'
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

  const shop1 = await prisma.shop.create({ data: { name: 'Ferme Martin', description: 'Élevage bio, fromages et charcuteries artisanales depuis 3 générations.', address: '12 Route des Champs, 77000 Melun', latitude: 48.5397, longitude: 2.6539, status: 'APPROVED', ownerId: seller1.id, photos: ['https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800'] } });
  const pickup1 = await prisma.pickupPoint.create({ data: { name: 'Ferme Martin — Sur place', address: '12 Route des Champs, 77000 Melun', shopId: shop1.id } });

  const shop2 = await prisma.shop.create({ data: { name: 'Maraîchage Dupuis', description: 'Légumes et fruits de saison cultivés en agriculture raisonnée.', address: '8 Chemin des Vignes, 91300 Massy', latitude: 48.7258, longitude: 2.2717, status: 'APPROVED', ownerId: seller2.id, photos: ['https://images.unsplash.com/photo-1464226184884-fa280b87c399?w=800'] } });
  const pickup2 = await prisma.pickupPoint.create({ data: { name: 'Maraîchage Dupuis — Marché', address: '8 Chemin des Vignes, 91300 Massy', shopId: shop2.id } });

  const p1 = await prisma.product.create({ data: { name: 'Fromage de chèvre frais', description: 'Fromage artisanal au lait cru, affiné 10 jours. Texture crémeuse, goût délicat.', category: 'fromage', price: 4.50, unit: 'pièce', stock: 30, isPublished: true, shopId: shop1.id, photos: ['https://images.unsplash.com/photo-1486297678162-eb2a19b0a318?w=800'] } });
  const p2 = await prisma.product.create({ data: { name: 'Saucisson sec fermier', description: 'Saucisson traditionnel au porc élevé en plein air. Séché 6 semaines en cave.', category: 'charcuterie', price: 12.00, unit: 'pièce', stock: 20, isPublished: true, shopId: shop1.id, photos: ['https://images.unsplash.com/photo-1544025162-d76538897a07?w=800'] } });
  await prisma.product.create({ data: { name: 'Oeufs fermiers (boîte de 6)', description: 'Poules élevées en plein air, alimentation 100% naturelle sans OGM.', category: 'oeufs', price: 3.20, unit: 'barquette', stock: 50, isPublished: true, shopId: shop1.id, photos: ['https://images.unsplash.com/photo-1569288052389-dac9b0ac9eac?w=800'] } });
  await prisma.product.create({ data: { name: 'Miel de fleurs sauvages', description: 'Miel récolté en juin, ruches installées en bordure de forêt.', category: 'epicerie', price: 8.50, unit: 'pot', stock: 15, isPublished: true, shopId: shop1.id, photos: ['https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800'] } });

  const p4 = await prisma.product.create({ data: { name: 'Tomates anciennes', description: 'Variétés anciennes : coeur de boeuf, noire de Crimée, ananas. Récoltées à maturité.', category: 'légumes', price: 5.50, unit: 'kg', stock: 40, isPublished: true, shopId: shop2.id, photos: ['https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800'] } });
  await prisma.product.create({ data: { name: 'Courgettes bio', description: 'Courgettes vertes et jaunes récoltées le matin même. Certifiées bio AB.', category: 'légumes', price: 2.80, unit: 'kg', stock: 60, isPublished: true, shopId: shop2.id, photos: ['https://images.unsplash.com/photo-1596881639540-e4bcd9e11b4e?w=800'] } });
  await prisma.product.create({ data: { name: 'Fraises Gariguette', description: 'Fraises sucrées et parfumées, récoltées à la main chaque matin.', category: 'fruits', price: 6.00, unit: 'barquette', stock: 25, isPublished: true, shopId: shop2.id, photos: ['https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=800'] } });
  await prisma.product.create({ data: { name: 'Carottes fanes', description: 'Carottes primeurs avec fanes fraîches. Idéales crues ou en soupe.', category: 'légumes', price: 3.00, unit: 'botte', stock: 35, isPublished: true, shopId: shop2.id, photos: ['https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=800'] } });
  await prisma.product.create({ data: { name: 'Pommes Golden', description: 'Pommes croquantes et sucrées, verger familial sans pesticides.', category: 'fruits', price: 4.00, unit: 'kg', stock: 80, isPublished: true, shopId: shop2.id, photos: ['https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=800'] } });

  await prisma.order.create({ data: { buyerId: buyer.id, shopId: shop1.id, pickupPointId: pickup1.id, totalAmount: 16.50, status: 'DELIVERED', stripePaymentId: 'pi_demo_123456', items: { create: [{ productId: p1.id, quantity: 2, unitPrice: 4.50 }, { productId: p2.id, quantity: 1, unitPrice: 12.00 }] } } });
  await prisma.review.create({ data: { rating: 5, comment: 'Fromage excellent, très frais et savoureux !', authorId: buyer.id, productId: p1.id } });
  await prisma.review.create({ data: { rating: 4, comment: 'Très bonnes tomates, je reviendrai !', authorId: buyer.id, productId: p4.id } });

  console.log('Seed termine !');
  console.log('Acheteur  : acheteur@ecomarket.fr / password123');
  console.log('Vendeur 1 : ferme.martin@ecomarket.fr / password123');
  console.log('Vendeur 2 : maraicher.dupuis@ecomarket.fr / password123');
  console.log('Admin     : admin@ecomarket.fr / password123');
}

main().catch(console.error).finally(() => prisma.$disconnect());
SEEDEOF