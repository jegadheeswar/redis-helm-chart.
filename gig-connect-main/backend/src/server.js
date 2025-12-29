// backend/src/server.js (Mongoose version)
import app from './app.js';
import connectDB from './config/database.js';
import { PORT } from './utils/config.js';

const startServer = async () => {
  try {
    // Connect to MongoDB first
    await connectDB();

    // Start the Express server
    const server = app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
      console.log(`📡 Health check: http://localhost:${PORT}/health`);
    });

    // Graceful shutdown (optional)
    process.on('SIGTERM', () => {
      console.log('SIGTERM received. Shutting down gracefully...');
      server.close(() => {
        console.log('✅ Server closed.');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();