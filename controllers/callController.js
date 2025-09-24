const Call = require('../models/Call');

// Liste des appels actifs (en mémoire pour simplicité)
let activeCalls = {};
let callHistory = [];

const startCall = (req, res) => {
  const { userId } = req.body;
  const callId = Date.now().toString(); // ID simple basé sur timestamp

  activeCalls[callId] = {
    id: callId,
    userId,
    startTime: new Date(),
    status: 'active'
  };

  res.status(200).json({ callId, message: 'Call started' });
};

const endCall = (req, res) => {
  const { callId } = req.params;

  if (activeCalls[callId]) {
    activeCalls[callId].endTime = new Date();
    activeCalls[callId].status = 'ended';
    callHistory.push(activeCalls[callId]);
    delete activeCalls[callId];
    res.status(200).json({ message: 'Call ended' });
  } else {
    res.status(404).json({ message: 'Call not found' });
  }
};

const getHistory = (req, res) => {
  const { userId } = req.params;
  const userHistory = callHistory.filter(call => call.userId === userId);
  res.status(200).json(userHistory);
};

module.exports = {
  startCall,
  endCall,
  getHistory
};