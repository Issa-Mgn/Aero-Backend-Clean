require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const callRoutes = require('./routes/calls');
const aiService = require('./services/aiService');
const OpenAI = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());
app.use('/api/calls', callRoutes);

// Sessions pour les appels en cours
let sessions = {};

// Fonction pour détecter le sujet de conversation
function detectTopic(transcription) {
  // Simulation simple de détection de sujet
  const text = transcription.map(t => t.text).join(' ').toLowerCase();

  if (text.includes('work') || text.includes('job')) return 'work';
  if (text.includes('family') || text.includes('home')) return 'family';
  if (text.includes('hobby') || text.includes('sport')) return 'hobbies';
  if (text.includes('travel') || text.includes('trip')) return 'travel';
  if (text.includes('food') || text.includes('eat')) return 'food';

  // Sujet par défaut
  return 'daily life';
}

// Route de test pour vérifier que l'app fonctionne
app.get('/', (req, res) => {
  res.json({
    message: 'Aero est lancé et prêt à vous aider en Anglais !',
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Gestion des connexions Socket.IO
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Événement début d'appel
  socket.on('start-call', async (data) => {
    try {
      const startTime = Date.now();
      // Simulation d'un client Realtime pour les tests
      sessions[socket.id] = {
        transcription: [],
        connected: true,
        startTime,
        callId: data.callId
      };

      console.log('Mock Realtime client "connected" for socket:', socket.id);

      // Timer pour avertissement à 15 secondes avant la fin
      const warningTime = 4 * 60 * 1000 + 45 * 1000; // 4:45 pour avertissement
      sessions[socket.id].warningTimer = setTimeout(async () => {
        if (sessions[socket.id]) {
          // Détecter le sujet (simulation)
          const topic = detectTopic(sessions[socket.id].transcription);
          const warningMessage = `I need to go now but it's good to talk about ${topic} with you. See you soon.`;

          socket.emit('ai-text-delta', { delta: warningMessage });
          sessions[socket.id].transcription.push({ role: 'assistant', text: warningMessage });
          console.log('Warning message sent:', warningMessage);

          // Audio géré côté client
        }
      }, warningTime);

      // Timer pour fin automatique
      const endTime = 5 * 60 * 1000; // 5 minutes
      sessions[socket.id].endTimer = setTimeout(() => {
        if (sessions[socket.id]) {
          const transcription = sessions[socket.id].transcription;
          console.log('Auto-ending call for socket:', socket.id);
          socket.emit('call-ended', { callId: sessions[socket.id].callId, transcription, autoEnd: true });
          clearTimeout(sessions[socket.id].warningTimer);
          delete sessions[socket.id];
        }
      }, endTime);

      socket.emit('call-started', { callId: data.callId });

      // Message d'accueil de l'IA
      setTimeout(async () => {
        if (sessions[socket.id]) {
          const greeting = "Hello I'm Aero your English Teacher and I'm here to help you improve yourself in this language. Tell me how can I help you today? You want to talk about something or a topic?";
          socket.emit('ai-text-delta', { delta: greeting });
          sessions[socket.id].transcription.push({ role: 'assistant', text: greeting });
          console.log('Greeting message sent:', greeting);

          // Audio géré côté client avec ResponsiveVoice (gratuit)
        }
      }, 1000); // Petit délai pour que call-started soit traité
    } catch (error) {
      console.error('Error starting call:', error);
      socket.emit('error', { message: 'Failed to start call' });
    }
  });

  // Événement envoi audio (streaming)
  socket.on('audio-data', async (data) => {
    if (sessions[socket.id]) {
      // Support pour texte personnalisé depuis le test
      const userText = data.text || "Hello, how are you today?";
      sessions[socket.id].transcription.push({ role: 'user', text: userText });
      console.log('User transcription:', userText);

      try {
        // Préparer les messages pour l'API OpenAI avec historique complet
        const messages = [
          { role: 'system', content: aiService.getSystemPrompt() },
          ...sessions[socket.id].transcription.slice(0, -1).map(t => ({ role: t.role, content: t.text })) // Historique sans le dernier message utilisateur
        ];

        // Ajouter le message actuel de l'utilisateur
        messages.push({ role: 'user', content: userText });

        // Appel à l'API OpenAI Chat Completions
        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: messages,
          max_tokens: 150,
          temperature: 0.8
        });

        const aiText = completion.choices[0].message.content;

        socket.emit('ai-text-delta', { delta: aiText });
        sessions[socket.id].transcription.push({ role: 'assistant', text: aiText });
        console.log('AI response:', aiText);

        // Audio géré côté client avec ResponsiveVoice (gratuit)

      } catch (error) {
        console.error('OpenAI API error:', error);

        // Fallback vers réponses mock si API échoue
        let fallbackText = "I'm sorry, I couldn't process that right now. Can you try again?";

        // Essayer de donner une réponse mock basée sur le message
        const lowerText = userText.toLowerCase();
        if (lowerText.includes('hello') || lowerText.includes('hi')) {
          fallbackText = "Hello! How are you doing today? What would you like to talk about?";
        } else if (lowerText.includes('work') || lowerText.includes('job')) {
          fallbackText = "You mentioned work! That's interesting. What do you do for work?";
        } else if (lowerText.includes('family')) {
          fallbackText = "Family is very important! Do you have a big family?";
        } else {
          fallbackText = "That's interesting! Can you tell me more about that?";
        }

        socket.emit('ai-text-delta', { delta: fallbackText });
        sessions[socket.id].transcription.push({ role: 'assistant', text: fallbackText });
        console.log('Fallback response:', fallbackText);

        // Audio géré côté client
      }
    }
  });

  // Fin d'appel
  socket.on('end-call', (data) => {
    if (sessions[socket.id]) {
      const transcription = sessions[socket.id].transcription;
      // Annuler les timers
      clearTimeout(sessions[socket.id].warningTimer);
      clearTimeout(sessions[socket.id].endTimer);
      // Simulation de déconnexion
      console.log('Mock client "disconnected" for socket:', socket.id);
      delete sessions[socket.id];
      socket.emit('call-ended', { callId: data.callId, transcription });
    }
  });

  socket.on('disconnect', () => {
    if (sessions[socket.id]) {
      // Annuler les timers
      clearTimeout(sessions[socket.id].warningTimer);
      clearTimeout(sessions[socket.id].endTimer);
      console.log('Mock client "disconnected" for socket:', socket.id);
      delete sessions[socket.id];
    }
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;

// Gestion d'erreur au démarrage
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});

server.listen(PORT, () => {
  console.log(`🚀 Aero Backend est lancé sur le port ${PORT}`);
  console.log(`📡 WebSocket server ready`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});