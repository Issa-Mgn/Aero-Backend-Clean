const SimplePeer = require('simple-peer');

// Stockage des peers actifs
let peers = {};

const createPeer = (socketId, initiator = false) => {
  const peer = new SimplePeer({ initiator, trickle: false });

  peer.on('signal', (data) => {
    // Envoyer le signal au client
    io.to(socketId).emit('webrtc-signal', data);
  });

  peer.on('connect', () => {
    console.log('Peer connected');
  });

  peer.on('data', (data) => {
    // Recevoir des données (audio, etc.)
    console.log('Received data:', data);
  });

  peer.on('close', () => {
    delete peers[socketId];
  });

  peers[socketId] = peer;
  return peer;
};

const handleSignal = (socketId, signal) => {
  if (peers[socketId]) {
    peers[socketId].signal(signal);
  }
};

const destroyPeer = (socketId) => {
  if (peers[socketId]) {
    peers[socketId].destroy();
    delete peers[socketId];
  }
};

module.exports = {
  createPeer,
  handleSignal,
  destroyPeer
};