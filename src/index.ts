import mongoose from 'mongoose';
import http from 'http';

import app from './app';
import config from './config/config';
import logger from './config/logger';

let server: http.Server;

const startServer = async () => {
  try {
    await mongoose.connect(config.mongoose.url);
    logger.info('✅ Connected to MongoDB');

    server = app.listen(config.port, () => {
      logger.info(`🚀 Server running on port ${config.port}`);
    });

    // Handle graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('👋 SIGTERM received');
      if (server) {
        server.close(() => logger.info('🛑 Server closed'));
      }
    });
  } catch (error) {
    logger.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Global error handlers
const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info('🛑 Server closed due to error');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

process.on('uncaughtException', (error: Error) => {
  logger.error('❗ Uncaught Exception:', error);
  exitHandler();
});

process.on('unhandledRejection', (reason: unknown) => {
  logger.error('❗ Unhandled Rejection:', reason);
  exitHandler();
});

startServer();
