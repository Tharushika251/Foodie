import app from './app';
import http from 'http';
import dotenv from 'dotenv';
import connectDB from './config/db';
import { DeliveryService } from './services/impl/DeliveryServiceImpl';
import logger from './config/logger';
import { Server } from 'socket.io';

dotenv.config();

const PORT = process.env.PORT || 5005;
const MONGO_URI = process.env.MONGO_URI || "";

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  },
  path: '/socket.io/',
  transports: ['websocket', 'polling']
});

app.set('io', io);

io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);

  socket.on('rider:location', async (data) => {
    try {
      if (!data.deliveryId || !data.latitude || !data.longitude) {
        logger.warn('Invalid location data received');
        return;
      }

      io.to(`delivery:${data.deliveryId}`).emit('delivery:location', {
        deliveryId: data.deliveryId,
        location: {
          latitude: data.latitude,
          longitude: data.longitude
        },
        timestamp: new Date()
      });

      logger.info({
        deliveryId: data.deliveryId,
        location: { lat: data.latitude, lng: data.longitude }
      }, 'Rider location updated');
    } catch (error) {
      logger.error({ error, data }, 'Error processing rider location update');
    }
  });

  socket.on('join:delivery', (deliveryId) => {
    socket.join(`delivery:${deliveryId}`);
    logger.info(`Client ${socket.id} joined tracking for delivery ${deliveryId}`);
  });

  socket.on('leave:delivery', (deliveryId) => {
    socket.leave(`delivery:${deliveryId}`);
    logger.info(`Client ${socket.id} left tracking for delivery ${deliveryId}`);
  });

  // Add this event handler in the io.on('connection', (socket) => { ... }) block
  socket.on('delivery:status_update', async (data) => {
    try {
      if (!data.deliveryId || !data.status) {
        logger.warn('Invalid status update data received');
        return;
      }

      // Broadcast the status update to all clients in the delivery room
      io.to(`delivery:${data.deliveryId}`).emit('delivery:status_updated', {
        deliveryId: data.deliveryId,
        status: data.status,
        timestamp: new Date()
      });

      logger.info({
        deliveryId: data.deliveryId,
        status: data.status
      }, 'Delivery status updated via socket');
    } catch (error) {
      logger.error({ error, data }, 'Error processing delivery status update');
    }
  });

  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

process.on('SIGINT', async () => {
  logger.info('Received SIGINT. Shutting down gracefully...');

  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM. Shutting down gracefully...');

  server.close(() => {
    logger.info('HTTP server closed');
    process.exit(0);
  });
});

connectDB(MONGO_URI).then(() => {
  // IMPORTANT CHANGE: Listen on 'server' instead of 'app'
  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});
