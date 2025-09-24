const express = require('express');
const router = express.Router();
const callController = require('../controllers/callController');

// Démarrer un appel
router.post('/start', callController.startCall);

// Terminer un appel
router.post('/end/:callId', callController.endCall);

// Récupérer l'historique des conversations
router.get('/history/:userId', callController.getHistory);

module.exports = router;