// backend/src/app.js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
// Fix for CommonJS module import in ES Module environment
import bodyParser from 'body-parser';
import { FRONTEND_URL } from './utils/config.js'; // Import FRONTEND_URL from config
import routes from './routes/index.js';

const app = express();

const { json } = bodyParser;

// Security & Middleware
app.use(helmet());

// CORS Configuration: Allow requests from the specified FRONTEND_URL
app.use(
  cors({
    origin: FRONTEND_URL, // Use the URL from config (should be http://localhost:8080)
    credentials: true,    // Important if sending cookies/tokens
  })
);

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(json({ limit: '10mb' }));
app.use('/uploads', express.static('uploads'));

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/v1', routes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

export default app;