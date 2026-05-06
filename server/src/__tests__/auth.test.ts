import request from 'supertest';
import app from '../index';
import { prisma } from '../config/prisma';

const cleanup = async () => {
  await prisma.review.deleteMany({ where: { author: { email: { contains: 'jest_' } } } });
  await prisma.orderItem.deleteMany({ where: { order: { buyer: { email: { contains: 'jest_' } } } } });
  await prisma.order.deleteMany({ where: { buyer: { email: { contains: 'jest_' } } } });
  await prisma.product.deleteMany({ where: { shop: { owner: { email: { contains: 'jest_' } } } } });
  await prisma.shop.deleteMany({ where: { owner: { email: { contains: 'jest_' } } } });
  await prisma.user.deleteMany({ where: { email: { contains: 'jest_' } } });
};

beforeAll(async () => { await cleanup(); });
afterAll(async () => { await cleanup(); await prisma.$disconnect(); });

describe('Auth — Inscription', () => {
  it('POST /api/auth/register → pas 500', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'jest_user@test.com',
      password: 'Test1234!',
      firstName: 'Jest',
      lastName: 'User',
      role: 'BUYER',
    });
    expect(res.status).not.toBe(500);
  });

  it('POST /api/auth/register email existant → 409', async () => {
    const res = await request(app).post('/api/auth/register').send({
      email: 'jest_user@test.com',
      password: 'Test1234!',
      firstName: 'Jest',
      lastName: 'User',
      role: 'BUYER',
    });
    expect(res.status).toBe(409);
  });
});

describe('Auth — Connexion', () => {
  it('POST /api/auth/login mauvais mot de passe → 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'jest_user@test.com', password: 'wrongpassword' });
    expect(res.status).toBe(401);
  });

  it('POST /api/auth/login email inconnu → 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@test.com', password: 'Test1234!' });
    expect(res.status).toBe(401);
  });

  it('POST /api/auth/login compte vérifié → 200 avec accessToken', async () => {
    await prisma.user.updateMany({
      where: { email: 'jest_user@test.com' },
      data: { isEmailVerified: true },
    });
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'jest_user@test.com', password: 'Test1234!' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('accessToken');
  });
});