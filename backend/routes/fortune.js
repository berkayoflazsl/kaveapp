import express from 'express';
import multer from 'multer';
import { analyzeFortuneImages, fortuneFollowUp } from '../services/openai.js';

const router = express.Router();

// Multer configuration
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { 
    fileSize: 10 * 1024 * 1024, // 10MB per file
    files: 5 // Max 5 files
  },
  fileFilter: (req, file, cb) => {
    // Only accept images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Sadece resim dosyaları kabul edilir'), false);
    }
  }
});

// POST /api/fortune - Analyze coffee fortune images
router.post('/', upload.array('images', 5), async (req, res) => {
  try {
    const startTime = Date.now();
    
    console.log(`📸 Received fortune request with ${req.files?.length || 0} images`);
    
    // Validation
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ 
        error: 'No images provided',
        message: 'Lütfen en az 1 kahve falı fotoğrafı yükleyin'
      });
    }

    // Persona (falcı profili) - FormData'dan
    let persona = null;
    if (req.body?.persona) {
      try { persona = typeof req.body.persona === 'string' ? JSON.parse(req.body.persona) : req.body.persona; } catch (_) {}
    }

    // Call OpenAI service
    const result = await analyzeFortuneImages(req.files, persona);
    
    const processingTime = Date.now() - startTime;
    
    console.log(`✅ Fortune generated in ${processingTime}ms`);
    
    res.json({
      success: true,
      fortune: result.fortune,
      metadata: {
        imagesAnalyzed: req.files.length,
        processingTimeMs: processingTime,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Fortune endpoint error:', error.message);
    
    // Handle specific errors
    if (error.type === 'openai_error') {
      return res.status(error.status || 500).json({
        error: error.code,
        message: error.message
      });
    }

    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File too large',
        message: 'Dosya boyutu çok büyük. Maksimum 10MB'
      });
    }

    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        error: 'Too many files',
        message: 'Maksimum 5 fotoğraf yükleyebilirsiniz'
      });
    }

    // Generic error
    res.status(500).json({
      error: 'Internal server error',
      message: 'Falcılık yapılırken bir hata oluştu. Lütfen tekrar deneyin.'
    });
  }
});

// POST /api/fortune/continue - Takip sorusu (mesaj geçmişi ile)
router.post('/continue', async (req, res) => {
  try {
    const { messages, persona } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Mesaj geçmişi gerekli' });
    }
    const valid = messages.every(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim().length > 0);
    if (!valid) {
      return res.status(400).json({ error: 'Geçersiz mesaj formatı', message: 'Her mesajda role (user/assistant) ve boş olmayan content gerekli' });
    }

    const answer = await fortuneFollowUp(messages, persona);

    res.json({ success: true, fortune: answer });
  } catch (error) {
    console.error('❌ Fortune continue error:', error.message);
    if (error.type === 'openai_error') {
      return res.status(error.status || 500).json({ error: error.code, message: error.message });
    }
    res.status(500).json({ error: 'Takip sorusu yanıtlanırken hata oluştu.' });
  }
});

// GET /api/fortune/stats - Get usage statistics (future feature)
router.get('/stats', (req, res) => {
  res.json({
    message: 'İstatistikler yakında eklenecek',
    totalFortunes: 0,
    todayFortunes: 0
  });
});

export default router;
