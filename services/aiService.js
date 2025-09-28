const OpenAI = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Prompt système par défaut
let systemPrompt = "You are an English-speaking AI teacher and your name is Aero. You are a friendly female teacher. Speak only in English, be friendly and patient. Understand and respond to users even if their English is broken or incorrect. First, gently correct any grammar or vocabulary mistakes in what the user just said, then continue the conversation naturally. For example: 'You said \"I go store\", but the correct way is \"I went to the store\". Now, what did you buy?'. Encourage the user to talk more and answer in short, clear sentences. Respond quickly and naturally, like in a real conversation.";

// Fonction pour changer le prompt système
const setSystemPrompt = (newPrompt) => {
  systemPrompt = newPrompt;
};

// Fonction pour obtenir le prompt système
const getSystemPrompt = () => systemPrompt;

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
      voice: 'nova', // Voix féminine pour Aero
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
  textToSpeech: textToSpeechFunc,
  setSystemPrompt,
  getSystemPrompt
};