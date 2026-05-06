import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
dotenv.config();

import authRoutes from './routes/auth.routes';
import { errorHandler } from './middlewares/error.middleware';

const app = express();
const httpServer = createServer(app);

export const io = new Server(httpServer, {
  cors: { origin: process.env.CLIENT_URL || 'http://localhost:5173' },
});

io.on('connection', (socket) => {
  socket.on('join-seller-room', (shopId: string) => socket.join(`seller:${shopId}`));
  socket.on('join-buyer-room', (userId: string) => socket.join(`buyer:${userId}`));
});

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.get('/api/health', (_, res) => res.json({ status: 'ok', message: '🌱 EcoMarket fonctionne !' }));
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
httpServer.listen(PORT, () => console.log(`✅ Serveur démarré sur http://localhost:${PORT}`));

export default app;
import shopRoutes from './routes/shop.routes';
import productRoutes from './routes/product.routes';
app.use('/api/shops', shopRoutes);
app.use('/api/products', productRoutes);

