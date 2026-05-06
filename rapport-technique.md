# Rapport Technique — EcoMarket

**Projet :** Marketplace producteurs locaux / consommateurs  
**Durée :** 2 semaines  
**URL de production :** https://lorick-dev-taf-production.up.railway.app  
**GitHub :** https://github.com/koudousgtrez-eng/LORICK-DEV-TAF

---

## 1. Choix d'architecture et justifications

### Monorepo client/server
Le projet est organisé en monorepo avec deux packages distincts : `client` (React) et `server` (Node.js). Ce choix facilite le partage de types et simplifie la configuration de l'intégration continue.

### Backend : Node.js + Express + TypeScript
Express a été choisi pour sa légèreté et sa flexibilité. TypeScript apporte la sécurité des types et réduit les erreurs à l'exécution. L'architecture est organisée par domaine fonctionnel (routes → controllers → services).

### Base de données : PostgreSQL + Prisma
PostgreSQL garantit la robustesse des données relationnelles. Prisma assure la définition du schéma, les migrations et la sécurité des types. Les requêtes paramétrées de Prisma éliminent le risque d'injection SQL.

### Cache : Redis
Redis est utilisé pour stocker les refresh tokens JWT et les sessions. Cela permet de révoquer des tokens sans invalider toute l'authentification.

### Authentification : JWT (access + refresh token)
Le access token expire après 15 minutes pour limiter les risques. Le refresh token (7 jours) est stocké dans Redis, permettant une révocation immédiate en cas de compromission.

### Upload d'images : Cloudinary
Cloudinary gère le stockage et l'optimisation des images produits. L'upload passe par Multer côté serveur avant transfert vers Cloudinary, évitant de stocker des fichiers localement.

### Paiement : Stripe
L'intégration Stripe via Stripe Checkout garantit la conformité PCI DSS sans que les données bancaires ne transitent par nos serveurs.

### Déploiement : Railway
Railway a été choisi pour sa simplicité de déploiement depuis GitHub, son support natif de PostgreSQL et Redis, et son scaling automatique.

---

## 2. Difficultés rencontrées et solutions

### Prisma v7 incompatible
**Problème :** La version 7 de Prisma installée par défaut avait changé la syntaxe du datasource, rendant le schéma invalide.  
**Solution :** Rétrogradation vers Prisma v5 (`npm install prisma@5 @prisma/client@5`) qui est stable et compatible avec notre architecture.

### Erreurs de clés étrangères dans les tests
**Problème :** L'ordre de suppression dans `beforeAll`/`afterAll` violait les contraintes de clés étrangères (ex: supprimer un User avant sa Shop).  
**Solution :** Utilisation de `NODE_ENV=test` pour pointer vers une base de test isolée, et correction de l'ordre de suppression (OrderItem → Order → Product → Shop → User).

### Port 4000 déjà occupé (EADDRINUSE)
**Problème :** Nodemon relançait le serveur avant que l'ancien processus ne soit libéré.  
**Solution :** Commande `kill -9 $(lsof -ti:4000)` avant chaque démarrage.

### Déploiement Railway CLI timeout
**Problème :** Le CLI Railway ne trouvait pas le service car le `railway.json` était mal positionné.  
**Solution :** Déploiement via l'interface web Railway avec configuration du Root Directory à `/server`.

---

## 3. Couverture de tests

Les tests sont écrits avec **Jest** et **Supertest**.

| Module | Tests | Statut |
|--------|-------|--------|
| Authentification | 5 tests | ✅ PASS |
| Produits | 5 tests | ✅ PASS |
| Commandes | 4 tests | ✅ PASS |
| **Total** | **14 tests** | **✅ 14/14** |

Commande : `NODE_ENV=test npm test`

Couverture des modules critiques :
- Authentification (register, login, refresh token, verify email, reset password)
- Gestion des produits (CRUD, contrôle d'accès)
- Gestion des commandes (création, statut)

---

## 4. Fonctionnalités non implémentées

| Fonctionnalité | Raison | Estimation |
|----------------|--------|------------|
| Frontend React complet | Contrainte de temps sur les 2 semaines | 3-4 jours |
| Notifications temps réel (Socket.io) | Priorité donnée au backend | 1 jour |
| PWA (Progressive Web App) | Non critique pour la v1 | 1 jour |
| Back-office admin complet | Fonctionnalité complémentaire | 2 jours |
| Paiement Stripe en mode live | Clés de production non configurées | 2 heures |

---

## 5. Stack technique complète

| Couche | Technologie | Version |
|--------|-------------|---------|
| Runtime | Node.js | 18+ |
| Framework | Express | 4.18 |
| Langage | TypeScript | 5.3 |
| ORM | Prisma | 5.22 |
| Base de données | PostgreSQL | 15 |
| Cache | Redis | 7 |
| Auth | JWT | 9.0 |
| Upload | Cloudinary | 1.41 |
| Paiement | Stripe | 14.9 |
| Tests | Jest + Supertest | 29.7 |
| Déploiement | Railway | - |
| Documentation | Swagger (OpenAPI 3.0) | - |