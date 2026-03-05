import express from 'express';
import { OpenAI } from 'openai';
import dotenv from 'dotenv';
import { calculateNatalChart } from '../services/astrology.js';

dotenv.config();

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.LLM_SERVICE_URL || 'https://api.openai.com/v1',
});

const MODEL = process.env.LLM_MODEL || 'gpt-4o-mini';

function formatChartForPrompt(chart) {
  const lines = ['YILDIZ HARİTASI (Natal Chart)'];
  lines.push(`\nGüneş: ${chart.planets.sun.degree}° ${chart.planets.sun.sign} (${chart.planets.sun.signSymbol}) - ${chart.planets.sun.house}. ev`);
  lines.push(`Ay: ${chart.planets.moon.degree}° ${chart.planets.moon.sign} (${chart.planets.moon.signSymbol}) - ${chart.planets.moon.house}. ev`);
  lines.push(`Merkür: ${chart.planets.mercury.degree}° ${chart.planets.mercury.sign} - ${chart.planets.mercury.house}. ev`);
  lines.push(`Venüs: ${chart.planets.venus.degree}° ${chart.planets.venus.sign} - ${chart.planets.venus.house}. ev`);
  lines.push(`Mars: ${chart.planets.mars.degree}° ${chart.planets.mars.sign} - ${chart.planets.mars.house}. ev`);
  lines.push(`Jüpiter: ${chart.planets.jupiter.degree}° ${chart.planets.jupiter.sign} - ${chart.planets.jupiter.house}. ev`);
  lines.push(`Satürn: ${chart.planets.saturn.degree}° ${chart.planets.saturn.sign} - ${chart.planets.saturn.house}. ev`);
  lines.push(`Uranüs: ${chart.planets.uranus.degree}° ${chart.planets.uranus.sign} - ${chart.planets.uranus.house}. ev`);
  lines.push(`Neptün: ${chart.planets.neptune.degree}° ${chart.planets.neptune.sign} - ${chart.planets.neptune.house}. ev`);
  lines.push(`Plüton: ${chart.planets.pluto.degree}° ${chart.planets.pluto.sign} - ${chart.planets.pluto.house}. ev`);
  lines.push(`Kuzey Düğüm: ${chart.planets.northNode.degree}° ${chart.planets.northNode.sign} - ${chart.planets.northNode.house}. ev`);
  lines.push(`\nYükselen (Ascendant): ${chart.houses.ascendant.degree}° ${chart.houses.ascendant.sign} (${chart.houses.ascendant.symbol})`);
  lines.push(`Tepe Noktası (MC): ${chart.houses.mc.degree}° ${chart.houses.mc.sign}`);
  return lines.join('\n');
}

router.post('/', async (req, res) => {
  try {
    const { datetime, latitude, longitude, timezone } = req.body;

    if (!datetime || latitude == null || longitude == null) {
      return res.status(400).json({
        error: 'Eksik veri',
        message: 'Doğum tarihi, saati, enlem ve boylam zorunludur.',
      });
    }

    const chart = calculateNatalChart({ datetime, latitude, longitude, timezone });
    const chartText = formatChartForPrompt(chart);

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: `Sen Batı astrolojisi uzmanısın. Hellenistik geleneğe ve modern psikolojik astrolojiye hakimsin. Yıldız haritalarını yorumlarken hem klasik anlamları hem de kişilik, kader ve yaşam yoluna dair içgörüler verirsin.

Türkçe konuşursun — samimi, anlaşılır, şiirsel olabilirsin ama anlaşılmaz değil. Teknik terimleri açıklarsın.
Yorumun kişiselleştirilmiş olsun: Güneş-Ay-Yükselen üçlüsüne mutlaka değin, dominant elementlere dikkat et, önemli ev yerleşimlerini vurgula.
Uzun ve dağınık yazma; 4-5 odaklı paragraf yeter. Umut verici ama gerçekçi ol.`
        },
        {
          role: 'user',
          content: `Bu kişinin yıldız haritasını yorumla:\n\n${chartText}\n\nYorumuna "Haritana baktım..." diye başla. Güneş, Ay ve Yükselen'in birlikte anlamını açıkla. Sonra diğer gezegenlerin öne çıkan yönlerini ve bu kişinin yaşamında hangi alanlara odaklanması gerektiğini söyle. 4-5 paragraf, samimi ve kişisel.`
        }
      ],
      max_tokens: 1200,
      temperature: 0.75,
    });

    const interpretation = response.choices[0].message.content;

    res.json({
      success: true,
      chart,
      interpretation,
    });
  } catch (error) {
    console.error('❌ Astrology error:', error.message);
    res.status(500).json({
      error: 'Yıldız haritası hesaplanırken hata oluştu.',
      message: error.message,
    });
  }
});

export default router;
