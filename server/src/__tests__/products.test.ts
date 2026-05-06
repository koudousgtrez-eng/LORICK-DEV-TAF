import request from 'supertest';
import app from '../index';
import { prisma } from '../config/prisma';
import bcrypt from 'bcrypt';

let sellerToken = '';
let productId = '';

const cleanup = async () => {
  await prisma.review.deleteMany({ where: { product: { shop: { owner: { email: 'jest_seller2@test.com' } } } } });
  await prisma.orderItem.deleteMany({ where: { product: { shop: { owner: { email: 'jest_seller2@test.com' } } } } });
  await prisma.order.deleteMany({ where: { shop: { owner: { email: 'jest_seller2@test.com' } } } });
  await prisma.product.deleteMany({ where: { shop: { owner: { email: 'jest_seller2@test.com' } } } });
  await prisma.shop.deleteMany({ where: { owner: { email: 'jest_seller2@test.com' } } });
  await prisma.user.deleteMany({ where: { email: 'jest_seller2@test.com' } });
};

beforeAll(async () => {
  await cleanup();
  const hashed = await bcrypt.hash('Test1234!', 10);
  await prisma.user.create({
    data: {
      email: 'jest_seller2@test.com',
      password: hashed,
      firstName: 'Jest',
      lastName: 'Seller',
      role: 'SELLER',
      isEmailVerified: true,
    },
  });
  const login = await request(app)
    .post('/api/auth/login')
    .send({ email: 'jest_seller2@test.com', password: 'Test1234!' });
  sellerToken = login.body.accessToken;

  await request(app)
    .post('/api/shops')
    .set('Authorization', `Bearer ${sellerToken}`)
    .send({ name: 'Boutique Jest', description: 'Test', latitude: 48.8, longitude: 2.3, address: '1 rue Test' });
});

afterAll(async () => {
  await cleanup();
  await prisma.$disconnect();
});

describe('Produits', () => {
  it('GET /api/products → 200', async () => {
    const res = await request(app).get('/api/products');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('products');
  });

  it('POST /api/products (authentifié) → 201', async () => {
    const res = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${sellerToken}`)
      .send({ name: 'Tomate Jest', description: 'Bio', category: 'Légumes', price: 3.5, unit: 'kg', stock: 100 });
    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    productId = res.body.id;
  });

  it('POST /api/products sans token → 401', async () => {
    const res = await request(app).post('/api/products').send({ name: 'Tomate', price: 3.5 });
    expect(res.status).toBe(401);
  });

  it('GET /api/products/:id → 200', async () => {
    if (!productId) return;
    const res = await request(app).get(`/api/products/${productId}`);
    expect(res.status).toBe(200);
  });

  it('GET /api/products/:id inconnu → 404', async () => {
    const res = await request(app).get('/api/products/id-inexistant-000');
    expect(res.status).toBe(404);
  });
});