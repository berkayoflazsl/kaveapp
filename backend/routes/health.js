import express from 'express';

const router = express.Router();

// Health check endpoint
router.get('/', (req, res) => {
  res.json({ 
    status: 'OK',
    service: 'Kahve Falı API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Detailed health check
router.get('/detailed', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Kahve Falı API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV || 'development',
    openai: process.env.OPENAI_API_KEY ? 'configured' : 'not configured'
  });
});

export default router;
