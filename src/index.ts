import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import upscalerRoutes from './routes/upscaler.routes';
import { warmupModels } from './controllers/upscaler.controller';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
// Log memory configuration on startup
const maxOldSpaceSize = process.env.NODE_OPTIONS?.match(/--max-old-space-size=(\d+)/)?.[1];
console.log('💾 Memory Configuration:');
console.log(`   Max Old Space Size: ${maxOldSpaceSize ? maxOldSpaceSize + 'MB' : 'Default (~2GB)'}`);
console.log(`   Current Heap Limit: ${(require('v8').getHeapStatistics().heap_size_limit / (1024 * 1024)).toFixed(0)} MB`);

// Middleware to handle JSON with larger payload (for base64 images)
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// CORS middleware (optional, for frontend access)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// CORS middleware (optional, for frontend access)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Health check endpoint with detailed memory info
app.get('/health', (req: Request, res: Response) => {
  const memoryUsage = process.memoryUsage();
  const v8Stats = require('v8').getHeapStatistics();

  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    memoryUsage: {
      heapUsed: `${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
      heapTotal: `${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
      heapLimit: `${(v8Stats.heap_size_limit / 1024 / 1024).toFixed(0)} MB`,
      external: `${(memoryUsage.external / 1024 / 1024).toFixed(2)} MB`,
      rss: `${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB`,
      usagePercentage: `${((memoryUsage.heapUsed / v8Stats.heap_size_limit) * 100).toFixed(2)}%`,
    },
  });
});

// Root endpoint with API documentation
app.get('/', (req: Request, res: Response) => {
  const v8Stats = require('v8').getHeapStatistics();

  res.json({
    message: 'Image Upscaler API - Dynamic Model Selection',
    version: '2.0.0',
    author: 'CodingMantra',
    endpoints: {
      health: 'GET /health',
      upscale: 'POST /api/upscale',
    },
    systemInfo: {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      heapLimit: `${(v8Stats.heap_size_limit / 1024 / 1024).toFixed(0)} MB`,
    },
    usage: {
      method: 'POST',
      endpoint: '/api/upscale',
      contentType: 'application/json',
      body: {
        image: 'base64 string (required, with or without image prefix)',
        model: 'number (optional: 2, 3, 4, or 8 - default: 4)',
      },
      example: {
        image: 'image/png;base64,iVBORw0KGgo...',
        model: 4,
      },
    },
    models: {
      2: { scale: '2x', recommended: 'Fast processing, good for large images' },
      3: { scale: '3x', recommended: 'Balanced quality and speed' },
      4: { scale: '4x', recommended: 'Default - Best balance (recommended)' },
      8: { scale: '8x', recommended: 'Highest quality, slower, small images only' },
    },
    limits: {
      maxPayloadSize: '100MB',
      maxImageDimensions: {
        '2x': '2048x2048',
        '3x': '1536x1536',
        '4x': '1024x1024',
        '8x': '512x512',
      },
    },
    timestamp: new Date().toISOString(),
  });
});

app.use('/api', upscalerRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Endpoint not found',
    availableEndpoints: ['GET /', 'GET /health', 'POST /upscale'],
  });
});

// Global error handler
app.use((err: Error, req: Request, res: Response, next: Function) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    message: err.message,
  });
});


// Start server
const server = app.listen(PORT, () => {
  console.log('🚀 ================================================');
  console.log(`🚀 Image Upscaler API v2.0 - CodingMantra`);
  console.log(`🚀 Server: http://localhost:${PORT}`);
  console.log(`🚀 ================================================`);
  console.log(`📊 Health: http://localhost:${PORT}/health`);
  console.log(`🖼️  Upscale: http://localhost:${PORT}/api/upscale`);
  console.log(`📝 Models: 2x, 3x, 4x (default), 8x`);
  console.log(`📦 Max Payload: 100MB`);
  console.log(`💾 Heap Limit: ${(require('v8').getHeapStatistics().heap_size_limit / 1024 / 1024).toFixed(0)} MB`);
  console.log('🚀 ================================================');
});


// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('⚠️  SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('⚠️  SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

warmupModels()


export default app;
