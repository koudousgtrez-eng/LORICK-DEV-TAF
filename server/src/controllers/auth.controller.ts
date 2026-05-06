import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { prisma } from '../config/prisma';
import { redis } from '../config/redis';
import { sendEmail } from '../utils/mailer';
import {
  registerSchema, loginSchema,
  forgotPasswordSchema, resetPasswordSchema,
} from '../validators/auth.validator';

const generateTokens = (userId: string, role: string) => {
  const accessToken = jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET!,
    { expiresIn: '15m' }
  );
  const refreshToken = jwt.sign(
    { id: userId, role },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: '7d' }
  );
  return { accessToken, refreshToken };
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = registerSchema.parse(req.body);
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) { res.status(409).json({ message: 'Email déjà utilisé' }); return; }

    const hashedPassword = await bcrypt.hash(data.password, 12);
    const verifyToken = crypto.randomBytes(32).toString('hex');

    const user = await prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role || 'BUYER',
        emailVerifyToken: verifyToken,
      },
    });

    await sendEmail({
      to: user.email,
      subject: 'Confirmez votre compte EcoMarket',
      html: `<h2>Bienvenue ${user.firstName} !</h2>
             <a href="${process.env.CLIENT_URL}/verify-email?token=${verifyToken}">
               Activer mon compte
             </a>`,
    });

    res.status(201).json({ message: 'Compte créé. Vérifiez votre email.' });
  } catch (err: any) {
    if (err.name === 'ZodError') { res.status(400).json({ errors: err.errors }); return; }
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: data.email } });
    if (!user) { res.status(401).json({ message: 'Identifiants incorrects' }); return; }

    const valid = await bcrypt.compare(data.password, user.password);
    if (!valid) { res.status(401).json({ message: 'Identifiants incorrects' }); return; }

    if (!user.isEmailVerified) {
      res.status(403).json({ message: 'Vérifiez votre email avant de vous connecter' });
      return;
    }

    const { accessToken, refreshToken } = generateTokens(user.id, user.role);
    await redis.setex(`refresh:${user.id}`, 7 * 24 * 3600, refreshToken);

    res.json({
      accessToken, refreshToken,
      user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role },
    });
  } catch (err: any) {
    if (err.name === 'ZodError') { res.status(400).json({ errors: err.errors }); return; }
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  const { refreshToken: token } = req.body;
  if (!token) { res.status(401).json({ message: 'Refresh token manquant' }); return; }

  try {
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as { id: string; role: string };
    const stored = await redis.get(`refresh:${decoded.id}`);
    if (!stored || stored !== token) { res.status(401).json({ message: 'Token invalide' }); return; }

    const { accessToken, refreshToken: newRefresh } = generateTokens(decoded.id, decoded.role);
    await redis.setex(`refresh:${decoded.id}`, 7 * 24 * 3600, newRefresh);
    res.json({ accessToken, refreshToken: newRefresh });
  } catch {
    res.status(401).json({ message: 'Token invalide ou expiré' });
  }
};

export const verifyEmail = async (req: Request, res: Response): Promise<void> => {
  const { token } = req.query as { token: string };
  const user = await prisma.user.findFirst({ where: { emailVerifyToken: token } });
  if (!user) { res.status(400).json({ message: 'Lien invalide ou expiré' }); return; }

  await prisma.user.update({
    where: { id: user.id },
    data: { isEmailVerified: true, emailVerifyToken: null },
  });
  res.json({ message: 'Email confirmé ✅' });
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = forgotPasswordSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      const token = crypto.randomBytes(32).toString('hex');
      await prisma.user.update({
        where: { id: user.id },
        data: { resetToken: token, resetTokenExpiry: new Date(Date.now() + 3600000) },
      });
      await sendEmail({
        to: user.email,
        subject: 'Réinitialisation de mot de passe — EcoMarket',
        html: `<a href="${process.env.CLIENT_URL}/reset-password?token=${token}">Réinitialiser</a>`,
      });
    }
    res.json({ message: 'Si ce compte existe, un email a été envoyé.' });
  } catch (err: any) {
    if (err.name === 'ZodError') { res.status(400).json({ errors: err.errors }); return; }
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token, newPassword } = resetPasswordSchema.parse(req.body);
    const user = await prisma.user.findFirst({
      where: { resetToken: token, resetTokenExpiry: { gte: new Date() } },
    });
    if (!user) { res.status(400).json({ message: 'Lien invalide ou expiré' }); return; }

    const hashed = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashed, resetToken: null, resetTokenExpiry: null },
    });
    await redis.del(`refresh:${user.id}`);
    res.json({ message: 'Mot de passe réinitialisé ✅' });
  } catch (err: any) {
    if (err.name === 'ZodError') { res.status(400).json({ errors: err.errors }); return; }
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
