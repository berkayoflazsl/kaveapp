import express from 'express';
import { OpenAI } from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.LLM_SERVICE_URL || 'https://api.openai.com/v1',
});

const MODEL = process.env.LLM_MODEL || 'gpt-4o-mini';

const buildTarotSystem = (persona) => {
  const base = `Sen Rider-Waite geleneğinde yetişmiş, tarot okuyan bir yorumcusun. Kartların arketipsel enerjilerini ve birbiriyle ilişkisini derin biçimde anlarsın. Yorumların hem spiritüel hem psikolojik boyut taşır — Jung'un kolektif bilinçdışı kavramından beslenirsin. Türkçe konuşursun, samimi ve doğrudan bir üslupla. Kartları bir hikaye gibi birbirine bağlarsın.`;
  const personaBlock = persona?.name && persona?.trait
    ? `\n\nSenin adın ${persona.name}. ${persona.trait} Tüm yorumlarını kendi sesinle, bu kimlikle ver. "Ben" dediğinde kendinden (${persona.name}) bahsettiğini hissettir.`
    : '';
  return base + personaBlock + `

ÖNEMLİ: Takip sorularında da önceki kartları ve verdiğin yorumu asla unutma. Sadece bu fal bağlamında cevap ver, başka konuya geçme. Hep aynı kişi (${persona?.name || 'yorumcu'}) olarak cevap ver.`;
};

const buildTarotMessages = (cards, messages, persona) => {
  const system = buildTarotSystem(persona);
  if (messages && Array.isArray(messages) && messages.length > 0) {
    return [{ role: 'system', content: system }, ...messages];
  }
  const cardList = cards.map((c, i) => `${i + 1}. ${c.nameTr} (${c.name})`).join('\n');
  return [
    { role: 'system', content: system },
    {
      role: 'user',
      content: `Bu kartlar önüme geldi:\n\n${cardList}\n\nŞimdi bu kartları bütünsel olarak yorumla:

- Her kartın kendi enerjisini ve mesajını açıkla (kısaca ama özlü)
- Kartların birbirleriyle nasıl konuştuğunu göster — zıtlık mı, uyum mu, süreç mi?
- Geçmiş-şimdi-gelecek akışını bu kartların içinde hisset ve aktar
- "Bu kartlar sana şunu söylüyor..." diye başlayan güçlü bir mesajla bitir
- Samimi ol, şiirsel olabilirsin ama boş vaatlerde bulunma
- 4 paragraf, akıcı Türkçe`
    }
  ];
};

// Streaming endpoint - metni parça parça gönderir
router.post('/stream', async (req, res) => {
  try {
    const { cards, messages, persona } = req.body;

    const isFollowUp = messages && Array.isArray(messages) && messages.length > 0;
    if (!isFollowUp && (!cards || cards.length === 0)) {
      return res.status(400).json({ error: 'Kart seçilmedi' });
    }
    if (isFollowUp) {
      const valid = messages.every(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim().length > 0);
      if (!valid) {
        return res.status(400).json({ error: 'Geçersiz mesaj formatı', message: 'Her mesajda role (user/assistant) ve boş olmayan content gerekli' });
      }
    }

    const apiMessages = buildTarotMessages(cards || [], messages, persona);

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    const stream = await openai.chat.completions.create({
      model: MODEL,
      messages: apiMessages,
      max_tokens: 1200,
      temperature: 0.8,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }
    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error('❌ Tarot stream error:', error.message);
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
});

router.post('/', async (req, res) => {
  try {
    const { cards, messages, persona } = req.body;

    const isFollowUp = messages && Array.isArray(messages) && messages.length > 0;
    if (!isFollowUp && (!cards || cards.length === 0)) {
      return res.status(400).json({ error: 'Kart seçilmedi' });
    }
    if (isFollowUp) {
      const valid = messages.every(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim().length > 0);
      if (!valid) {
        return res.status(400).json({ error: 'Geçersiz mesaj formatı', message: 'Her mesajda role (user/assistant) ve boş olmayan content gerekli' });
      }
    }

    const apiMessages = buildTarotMessages(cards || [], messages, persona);

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: apiMessages,
      max_tokens: 1200,
      temperature: 0.8,
    });

    const reading = response.choices[0].message.content;

    res.json({ success: true, reading });
  } catch (error) {
    console.error('❌ Tarot error:', error.message);
    res.status(500).json({ error: 'Tarot yorumu yapılırken hata oluştu.' });
  }
});

export default router;
