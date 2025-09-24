const io = require('socket.io-client');

const socket = io('http://localhost:3000');

socket.on('connect', function() {
  console.log('Connected to Socket.IO server');

  // Test start-call event
  socket.emit('start-call', { callId: 'test-123' });
});

socket.on('call-started', function(data) {
  console.log('Call started:', data);
});

socket.on('ai-response', function(data) {
  console.log('AI response:', data);
});

socket.on('call-ended', function(data) {
  console.log('Call ended:', data);
});

socket.on('error', function(err) {
  console.error('Socket error:', err);
});

socket.on('disconnect', function() {
  console.log('Disconnected from server');
});