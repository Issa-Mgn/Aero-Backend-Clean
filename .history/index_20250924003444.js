require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const callRoutes = require('./routes/calls');

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
    // Logique pour démarrer l'appel WebRTC
    socket.emit('call-started', { callId: data.callId });
  });

  // Événement envoi audio/vidéo
  socket.on('audio-data', (audioBlob) => {
    // Traiter l'audio avec STT, puis LLM, puis TTS
    // Pour l'instant, placeholder
    console.log('Received audio data');
    // Ici intégrer les services IA
  });

  // Fin d'appel
  socket.on('end-call', (data) => {
    socket.emit('call-ended', { callId: data.callId });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});