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

const buildDreamSystem = (persona) => {
  const base = `Sen hem geleneksel Türk-İslam rüya tabirine (İbn-i Sirin geleneğine) hem de modern psikolojik rüya analizine hakim bir yorumcusun. Rüyadaki sembollerin kültürel ve arketipsel anlamlarını bilirsin. Yorumun iki katmanlıdır: birincisi rüyanın bilinçdışındaki duygusal mesajı, ikincisi ise günlük hayata yönelik pratik işareti. Türkçe konuşursun, empatik ve sıcak bir üslupla — sanki rüyayı anlatan kişinin yanında oturuyorsun.`;
  const personaBlock = persona?.name && persona?.trait
    ? `\n\nSenin adın ${persona.name}. ${persona.trait} Tüm yorumlarını kendi sesinle, bu kimlikle ver. "Ben" dediğinde kendinden (${persona.name}) bahsettiğini hissettir.`
    : '';
  return base + personaBlock + `

ÖNEMLİ: Takip sorularında da önceki rüyayı ve verdiğin yorumu asla unutma. Sadece bu rüya bağlamında cevap ver, başka konuya geçme. Hep aynı kişi (${persona?.name || 'yorumcu'}) olarak cevap ver.`;
};

const buildDreamMessages = (dream, messages, persona) => {
  const system = buildDreamSystem(persona);
  if (messages && Array.isArray(messages) && messages.length > 0) {
    return [{ role: 'system', content: system }, ...messages];
  }
  return [
    { role: 'system', content: system },
    {
      role: 'user',
      content: `Biri sana şu rüyayı anlattı:\n\n"${dream}"\n\nBu rüyayı yorumla:

- Rüyadaki ana sembol ve figürleri tespit et (su, ateş, uçmak, kovalanmak, ev, ölmek gibi arketipsel unsurlar varsa özellikle belirt)
- Her sembolün hem geleneksel Türk rüya tabiri hem de psikolojik anlamını kısaca ver
- Rüyanın genel mesajını çıkar: bu kişi hayatında ne yaşıyor olabilir, ruhu ne söylemeye çalışıyor?
- Son paragrafta bu rüyanın o kişiye verdiği somut bir mesaj veya uyarı yaz
- "Rüyanı dinledim..." diye başla, samimi ve anlayışlı konuş
- 4 paragraf, açık ve akıcı Türkçe`
    }
  ];
};

router.post('/', async (req, res) => {
  try {
    const { dream, messages, persona } = req.body;

    const isFollowUp = messages && Array.isArray(messages) && messages.length > 0;
    if (!isFollowUp && (!dream || dream.trim().length === 0)) {
      return res.status(400).json({ error: 'Rüya metni boş olamaz' });
    }
    if (isFollowUp) {
      const valid = messages.every(m => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string' && m.content.trim().length > 0);
      if (!valid) {
        return res.status(400).json({ error: 'Geçersiz mesaj formatı', message: 'Her mesajda role (user/assistant) ve boş olmayan content gerekli' });
      }
    }

    const apiMessages = buildDreamMessages(dream || '', messages, persona);

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: apiMessages,
      max_tokens: 1200,
      temperature: 0.78,
    });

    const interpretation = response.choices[0].message.content;

    res.json({ success: true, interpretation });
  } catch (error) {
    console.error('❌ Dream error:', error.message);
    res.status(500).json({ error: 'Rüya yorumu yapılırken hata oluştu.' });
  }
});

export default router;
