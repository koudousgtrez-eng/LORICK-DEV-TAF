import request from 'supertest';
import app from '../index';
import { prisma } from '../config/prisma';
import bcrypt from 'bcrypt';

let buyerToken = '';

const cleanup = async () => {
  await prisma.orderItem.deleteMany({ where: { order: { buyer: { email: 'jest_buyer2@test.com' } } } });
  await prisma.order.deleteMany({ where: { buyer: { email: 'jest_buyer2@test.com' } } });
  await prisma.user.deleteMany({ where: { email: 'jest_buyer2@test.com' } });
};

beforeAll(async () => {
  await cleanup();
  const hashed = await bcrypt.hash('Test1234!', 10);
  await prisma.user.create({
    data: {
      email: 'jest_buyer2@test.com',
      password: hashed,
      firstName: 'Jest',
      lastName: 'Buyer',
      role: 'BUYER',
      isEmailVerified: true,
    },
  });
  const login = await request(app)
    .post('/api/auth/login')
    .send({ email: 'jest_buyer2@test.com', password: 'Test1234!' });
  buyerToken = login.body.accessToken;
});

afterAll(async () => {
  await cleanup();
  await prisma.$disconnect();
});

describe('Commandes', () => {
  it('GET /api/orders/my-orders sans token → 401', async () => {
    const res = await request(app).get('/api/orders/my-orders');
    expect(res.status).toBe(401);
  });

  it('GET /api/orders/my-orders avec token → 200', async () => {
    const res = await request(app)
      .get('/api/orders/my-orders')
      .set('Authorization', `Bearer ${buyerToken}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /api/orders/checkout avec panier vide → 400', async () => {
    const res = await request(app)
      .post('/api/orders/checkout')
      .set('Authorization', `Bearer ${buyerToken}`)
      .send({ items: [] });
    expect(res.status).toBe(400);
  });

  it('POST /api/orders/checkout sans token → 401', async () => {
    const res = await request(app)
      .post('/api/orders/checkout')
      .send({ items: [{ productId: 'abc', quantity: 1 }] });
    expect(res.status).toBe(401);
  });
});