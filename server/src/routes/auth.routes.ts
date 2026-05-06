import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  register, login, refreshToken,
  verifyEmail, forgotPassword, resetPassword,
} from '../controllers/auth.controller';

const router = Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: 'Trop de tentatives, réessayez dans 15 minutes' },
});

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Inscription d'un nouvel utilisateur
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, firstName, lastName]
 *             properties:
 *               email: { type: string, example: user@example.com }
 *               password: { type: string, example: password123 }
 *               firstName: { type: string, example: Jean }
 *               lastName: { type: string, example: Dupont }
 *               role: { type: string, enum: [BUYER, SELLER] }
 *     responses:
 *       201: { description: Compte créé, vérifier email }
 *       409: { description: Email déjà utilisé }
 *       400: { description: Données invalides }
 */
router.post('/register', authLimiter, register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Connexion utilisateur
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, example: acheteur@ecomarket.fr }
 *               password: { type: string, example: password123 }
 *     responses:
 *       200: { description: Connexion réussie avec accessToken et refreshToken }
 *       401: { description: Identifiants incorrects }
 *       403: { description: Email non vérifié }
 */
router.post('/login', authLimiter, login);

/**
 * @swagger
 * /auth/refresh-token:
 *   post:
 *     summary: Renouveler le token d'accès
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken: { type: string }
 *     responses:
 *       200: { description: Nouveaux tokens générés }
 *       401: { description: Refresh token invalide }
 */
router.post('/refresh-token', refreshToken);

/**
 * @swagger
 * /auth/verify-email:
 *   get:
 *     summary: Vérifier l'email via token
 *     tags: [Auth]
 *     parameters:
 *       - in: query
 *         name: token
 *         schema: { type: string }
 *         required: true
 *     responses:
 *       200: { description: Email confirmé }
 *       400: { description: Lien invalide }
 */
router.get('/verify-email', verifyEmail);

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Demande de réinitialisation de mot de passe
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email: { type: string }
 *     responses:
 *       200: { description: Email envoyé si le compte existe }
 */
router.post('/forgot-password', authLimiter, forgotPassword);

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Réinitialiser le mot de passe
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token: { type: string }
 *               newPassword: { type: string }
 *     responses:
 *       200: { description: Mot de passe réinitialisé }
 *       400: { description: Lien invalide ou expiré }
 */
router.post('/reset-password', resetPassword);

export default router;