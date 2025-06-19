import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { initializeDatabase } from './db';

// Import routes
import authRoutes from './routes/auth.routes';
import profileRoutes from './routes/profile.routes';
import workflowRoutes from './routes/workflow.routes';
import proxyRoutes from './routes/proxy.routes';
import storeRoutes from './routes/store.routes';
import balanceRoutes from './routes/balance.routes';
import upgradeRoutes from './routes/upgrade.routes';
import depositRoutes from './routes/deposit.routes';

const app = express();
const PORT = process.env.BACKEND_PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? false : true,
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    mode: 'electron-backend',
    version: '1.0.0'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/workflows', workflowRoutes);
app.use('/api/proxies', proxyRoutes);
app.use('/api/store', storeRoutes);
app.use('/api/balance', balanceRoutes);
app.use('/api/upgrade', upgradeRoutes);
app.use('/api/deposit', depositRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Backend Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint not found',
    path: req.originalUrl
  });
});

async function startServer() {
  try {
    // Initialize database
    await initializeDatabase();
    console.log('✅ Database initialized');

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Electron Backend running on port ${PORT}`);
      console.log(`📡 Mode: ${process.env.NODE_ENV || 'development'}`);
      
      // Notify Electron main process that backend is ready
      if (process.send) {
        process.send('backend-ready');
      }
    });
  } catch (error) {
    console.error('❌ Failed to start backend:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Backend shutting down...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Backend shutting down...');
  process.exit(0);
});

startServer();