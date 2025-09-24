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

// LLM avec OpenAI (réponses en anglais)
const generateResponse = async (text) => {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
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

// Text-to-Speech avec Google Cloud
const textToSpeechFunc = async (text) => {
  try {
    const request = {
      input: { text },
      voice: { languageCode: 'en-US', ssmlGender: 'NEUTRAL' },
      audioConfig: { audioEncoding: 'MP3' },
    };
    const [response] = await ttsClient.synthesizeSpeech(request);
    return response.audioContent;
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