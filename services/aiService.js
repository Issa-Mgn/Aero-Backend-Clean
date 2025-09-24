const OpenAI = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Speech-to-Text avec Whisper (OpenAI)
const speechToText = async (audioBuffer) => {
  try {
    const transcription = await openai.audio.transcriptions.create({
      file: audioBuffer,
      model: 'whisper-1',
    });
    return transcription.text;
  } catch (error) {
    console.error('STT Error:', error);
    return null;
  }
};

// LLM avec OpenAI GPT-4o-mini (réponses en anglais)
const generateResponse = async (text) => {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'You are Aero, an AI for practicing English. Respond in English only, help with conversation.' },
        { role: 'user', content: text }
      ],
      max_tokens: 150
    });
    return response.choices[0].message.content;
  } catch (error) {
    console.error('LLM Error:', error);
    return 'Sorry, I couldn\'t process that.';
  }
};

// Text-to-Speech avec OpenAI
const textToSpeechFunc = async (text) => {
  try {
    const mp3 = await openai.audio.speech.create({
      model: 'tts-1',
      voice: 'alloy',
      input: text,
    });
    const buffer = Buffer.from(await mp3.arrayBuffer());
    return buffer;
  } catch (error) {
    console.error('TTS Error:', error);
    return null;
  }
};

module.exports = {
  speechToText,
  generateResponse,
  textToSpeech: textToSpeechFunc
};