require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const callRoutes = require('./routes/calls');
const webrtcService = require('./services/webrtcService');
const aiService = require('./services/aiService');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*", // À configurer pour la sécurité
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());
app.use('/api/calls', callRoutes);

// Gestion des connexions Socket.IO
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Événement début d'appel
  socket.on('start-call', (data) => {
    webrtcService.createPeer(socket.id, true); // Initiator pour l'IA
    socket.emit('call-started', { callId: data.callId });
  });

  // Signal WebRTC
  socket.on('webrtc-signal', (signal) => {
    webrtcService.handleSignal(socket.id, signal);
  });

  // Événement envoi audio
  socket.on('audio-data', async (audioBlob) => {
    try {
      // STT
      const text = await aiService.speechToText(audioBlob);
      if (text) {
        // LLM
        const response = await aiService.generateResponse(text);
        // TTS
        const audioResponse = await aiService.textToSpeech(response);
        // Envoyer l'audio réponse et avatar (placeholder pour flux vidéo)
        socket.emit('ai-response', { audio: audioResponse, text: response, avatarStream: 'placeholder' });
      }
    } catch (error) {
      console.error('AI processing error:', error);
      socket.emit('error', { message: 'AI processing failed' });
      // Tentative de reconnexion automatique
      setTimeout(() => {
        socket.emit('reconnect-attempt');
      }, 5000);
    }
  });

  // Fin d'appel
  socket.on('end-call', (data) => {
    webrtcService.destroyPeer(socket.id);
    socket.emit('call-ended', { callId: data.callId });
  });

  socket.on('disconnect', () => {
    webrtcService.destroyPeer(socket.id);
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server lancé sur le port ${PORT}`);
});