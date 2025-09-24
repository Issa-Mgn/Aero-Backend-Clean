const io = require('socket.io-client');

console.log('🔄 Test des WebSockets...');

const socket = io('http://localhost:3000');

socket.on('connect', function() {
  console.log('✅ Connecté au serveur Socket.IO');

  // Test start-call event
  console.log('📤 Envoi de start-call...');
  socket.emit('start-call', { callId: 'test-123' });

  // Après 2 secondes, test audio-data
  setTimeout(() => {
    console.log('📤 Envoi de audio-data...');
    socket.emit('audio-data', 'Hello, how are you today?'); // Texte simulé
  }, 2000);

  // Après 5 secondes, test end-call
  setTimeout(() => {
    console.log('📤 Envoi de end-call...');
    socket.emit('end-call', { callId: 'test-123' });
  }, 5000);
});

socket.on('call-started', function(data) {
  console.log('✅ Call started reçu:', data);
});

socket.on('ai-response', function(data) {
  console.log('✅ AI response reçu:', data);
});

socket.on('call-ended', function(data) {
  console.log('✅ Call ended reçu:', data);
});

socket.on('error', function(err) {
  console.error('❌ Erreur Socket:', err);
});

socket.on('disconnect', function() {
  console.log('🔌 Déconnecté du serveur');
});

// Timeout après 10 secondes
setTimeout(() => {
  console.log('⏰ Test terminé');
  socket.disconnect();
  process.exit(0);
}, 10000);