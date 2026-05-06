# EcoMarket 🌱

Marketplace de mise en relation entre producteurs locaux et consommateurs.

## 🚀 URL de production

**Backend API :** https://lorick-dev-taf-production.up.railway.app

## 📋 Prérequis

- Node.js 18+
- PostgreSQL 15+
- Redis 7+

## ⚙️ Installation locale

```bash
git clone https://github.com/koudousgtrez-eng/LORICK-DEV-TAF.git
cd LORICK-DEV-TAF/server
npm install
cp .env.example .env
npx prisma migrate dev
npm run dev
```

## 🔐 Variables d'environnement

| Variable | Description |
|----------|-------------|
| DATABASE_URL | URL PostgreSQL |
| REDIS_URL | URL Redis |
| JWT_SECRET | Secret JWT access token |
| JWT_REFRESH_SECRET | Secret JWT refresh token |
| NODE_ENV | development / production |
| CLIENT_URL | URL du frontend |
| SMTP_HOST | Serveur SMTP |
| SMTP_USER | Email SMTP |
| SMTP_PASS | Mot de passe SMTP |
| CLOUDINARY_CLOUD_NAME | Cloudinary |
| CLOUDINARY_API_KEY | Cloudinary |
| CLOUDINARY_API_SECRET | Cloudinary |
| STRIPE_SECRET_KEY | Stripe |
| STRIPE_WEBHOOK_SECRET | Stripe |

## 🧪 Tests

```bash
cd server
NODE_ENV=test npm test
```

Résultat : **14/14 tests passants** ✅

## 👤 Comptes de démonstration

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| Acheteur | acheteur@ecomarket.fr | password123 |
| Vendeur 1 | ferme.martin@ecomarket.fr | password123 |
| Vendeur 2 | maraicher.dupuis@ecomarket.fr | password123 |
| Admin | admin@ecomarket.fr | password123 |

## 🛠️ Stack technique

| Couche | Technologie |
|--------|-------------|
| Backend | Node.js, Express, TypeScript |
| Base de données | PostgreSQL, Prisma ORM |
| Cache | Redis |
| Auth | JWT (access + refresh token) |
| Upload | Cloudinary |
| Paiement | Stripe |
| Tests | Jest, Supertest |
| Déploiement | Railway |