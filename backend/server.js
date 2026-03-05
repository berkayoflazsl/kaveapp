import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fortuneRoutes from './routes/fortune.js';
import tarotRoutes from './routes/tarot.js';
import dreamRoutes from './routes/dream.js';
import astrologyRoutes from './routes/astrology.js';
import healthRoutes from './routes/health.js';

console.log('🚀 Server starting...');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

app.use('/health', healthRoutes);
app.use('/api/fortune', fortuneRoutes);
app.use('/api/tarot', tarotRoutes);
app.use('/api/dream', dreamRoutes);
app.use('/api/astrology', astrologyRoutes);

app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not Found',
    availableEndpoints: ['GET /health', 'POST /api/fortune']
  });
});

app.use((err, req, res, next) => {
  console.error('💥 Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

console.log('🎧 Starting to listen...');

app.listen(PORT, '0.0.0.0', () => {
  console.log('╔═══════════════════════════════════════╗');
  console.log('║   🔮 Kahve Falı Backend Server       ║');
  console.log('║   📡 http://0.0.0.0:' + PORT + '            ║');
  console.log('╚═══════════════════════════════════════╝');
});
