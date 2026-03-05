import { OpenAI } from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.LLM_SERVICE_URL || 'https://api.openai.com/v1',
});

const MODEL = process.env.LLM_MODEL || 'gpt-4o';

/**
 * Analyze coffee fortune images using GPT-4o
 * @param {Array} files - Array of multer file objects
 * @param {Object} persona - { name, trait } falcı profili
 * @returns {Promise<Object>} - Fortune analysis result
 */
export async function analyzeFortuneImages(files, persona) {
  try {
    console.log('🤖 Preparing GPT-4o request...');

    // Convert images to base64
    const imageMessages = files.map(file => ({
      type: 'image_url',
      image_url: {
        url: `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
        detail: 'high' // High detail for better symbol recognition
      }
    }));

    const prompt = {
      type: 'text',
      text: `Önümde ${files.length} adet kahve fincanı fotoğrafı var. Lütfen bunları dikkatlice incele.

Fincanın içindeki kahve tortusu, yüzyıllardır kaderin haritasını çizer. Her şekil, her çizgi, her küme — hayatının bir parçasına işaret eder.

Şimdi senden istediğim:
- Fotoğraflardaki tortu şekillerini tek tek gör: hayvan mı, insan mı, nesne mi, doğa unsuru mu?
- Fincanın kenarına yakın şekiller yakın geleceği, dibe yakın olanlar uzak geleceği gösterir.
- Fincanın kulpuna bakan taraf ev ve aile hayatını, karşı taraf dış dünyayı temsil eder.
- Şekillerin büyüklüğü olayların önemini belirtir.

Yorumunu yaz:
- "Fincanına baktım..." diye başla, sıcak ve samimi bir ses tonu kullan
- Gördüğün her sembolü ismiyle say ve ne anlama geldiğini açıkla
- Aşk, iş, sağlık ve ruhsal durum hakkında içgörüler ver
- 4 paragraf yaz, her biri ayrı bir tema taşısın
- Son paragrafta genel bir mesaj ve yakın gelecek için bir işaret ver
- Umut verici ama gerçekçi ol — süslü değil, samimi konuş`
    };

    const messageContent = [prompt, ...imageMessages];

    const systemBase = 'Sen İstanbul\'da deneyimli bir Türk falcısısın. Fincanı elinde tutmuş gibi konuşursun — sıcak, samimi, doğrudan. Süslü kelimeler kullanmazsın ama her sözün ağırlığı vardır. Gördüğün sembolleri somut olarak adlandırırsın ve anlamlarını kültürel bilginle açıklarsın.';
    const systemPersona = persona?.name && persona?.trait
      ? `\n\nSenin adın ${persona.name}. ${persona.trait} Tüm yorumlarını kendi sesinle, bu kimlikle ver. "Ben" dediğinde kendinden (${persona.name}) bahsettiğini hissettir.`
      : '';
    const systemContent = systemBase + systemPersona;

    const response = await openai.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: 'system',
          content: systemContent
        },
        {
          role: 'user',
          content: messageContent
        }
      ],
      max_tokens: 1500,
      temperature: 0.75,
    });

    const fortune = response.choices[0].message.content;

    console.log(`✅ GPT-4o response received (${fortune.length} chars)`);

    return {
      fortune,
      model: 'gpt-4o',
      tokensUsed: response.usage?.total_tokens || 0
    };

  } catch (error) {
    console.error('❌ OpenAI API error:', error.message);

    // Format error for client
    const formattedError = new Error(error.message);
    formattedError.type = 'openai_error';

    // Handle specific OpenAI errors
    if (error.code === 'insufficient_quota') {
      formattedError.status = 402;
      formattedError.code = 'quota_exceeded';
      formattedError.message = 'OpenAI API kotası doldu. Lütfen daha sonra tekrar deneyin.';
    } else if (error.code === 'invalid_api_key') {
      formattedError.status = 401;
      formattedError.code = 'invalid_api_key';
      formattedError.message = 'OpenAI API anahtarı geçersiz.';
    } else if (error.code === 'model_not_found') {
      formattedError.status = 400;
      formattedError.code = 'model_not_found';
      formattedError.message = 'GPT-4o modeli bulunamadı. API erişiminizi kontrol edin.';
    } else if (error.code === 'rate_limit_exceeded') {
      formattedError.status = 429;
      formattedError.code = 'rate_limit';
      formattedError.message = 'Çok fazla istek gönderildi. Lütfen biraz bekleyin.';
    } else {
      formattedError.status = 500;
      formattedError.code = 'api_error';
      formattedError.message = 'OpenAI API ile iletişim kurarken bir hata oluştu.';
    }

    throw formattedError;
  }
}

/**
 * Kahve falı takip sorusu - metin geçmişi ile (görsel yok)
 * @param {Array} messages - [{role, content}, ...] OpenAI formatında
 * @param {Object} persona - { name, trait } falcı profili
 */
export async function fortuneFollowUp(messages, persona) {
  const MODEL_CHAT = process.env.LLM_MODEL || 'gpt-4o-mini';

  const systemBase = `Sen İstanbul'da deneyimli bir Türk falcısısın. Sıcak, samimi, doğrudan konuşursun.`;
  const systemPersona = persona?.name && persona?.trait
    ? `\n\nSenin adın ${persona.name}. ${persona.trait} Tüm yorumlarını kendi sesinle, bu kimlikle ver. Hep aynı kişi (${persona.name}) olarak cevap ver.`
    : '';
  const systemContent = systemBase + systemPersona + `

ÖNEMLİ: Takip sorularında da önceki fincan yorumunu asla unutma. Sadece bu kahve falı bağlamında cevap ver, başka konuya geçme.`;

  const response = await openai.chat.completions.create({
    model: MODEL_CHAT,
    messages: [{ role: 'system', content: systemContent }, ...messages],
    max_tokens: 1000,
    temperature: 0.75,
  });

  return response.choices[0].message.content;
}

export default {
  analyzeFortuneImages,
  fortuneFollowUp
};
