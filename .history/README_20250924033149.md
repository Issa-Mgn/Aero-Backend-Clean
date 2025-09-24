# Aero Backend

Backend pour l'application Aero, permettant des appels vidéo avec IA pour pratiquer l'anglais.

## Fonctionnalités

- Communication temps réel via WebSockets (Socket.IO)
- Appels vidéo peer-to-peer avec WebRTC
- IA conversationnelle : Speech-to-Text (OpenAI Whisper), LLM (OpenAI GPT-4o-mini), Text-to-Speech (OpenAI TTS)
- Routes REST pour gestion des appels
- Architecture MVC propre

## Installation

1. Cloner le repo
2. `npm install`
3. Configurer les variables d'environnement dans `.env` :
   - `OPENAI_API_KEY` : Clé API OpenAI (déjà configurée)
   - `PORT` : Port du serveur (3000 par défaut)
4. `npm start` ou `npm run dev`

## Endpoints REST

- `POST /api/calls/start` : Démarrer un appel
  - Body: `{ "userId": "string" }`
  - Response: `{ "callId": "string", "message": "Call started" }`

- `POST /api/calls/end/:callId` : Terminer un appel
  - Response: `{ "message": "Call ended" }`

- `GET /api/calls/history/:userId` : Récupérer l'historique
  - Response: Array des appels

## Événements WebSocket

- `start-call` : Démarrer l'appel WebRTC
- `webrtc-signal` : Échange de signaux WebRTC
- `audio-data` : Envoi d'audio utilisateur
- `ai-response` : Réponse audio/texte de l'IA
- `end-call` : Fin d'appel
- `error` : Gestion d'erreurs

## Déploiement

### Render
1. Connecte-toi à [Render](https://render.com)
2. Clique "New" → "Web Service"
3. Connecte ton repo GitHub
4. Configure :
   - **Runtime** : Node
   - **Build Command** : `npm install`
   - **Start Command** : `npm start`
5. Ajoute la variable d'environnement :
   - `OPENAI_API_KEY` : Ta clé OpenAI
6. Déploie !

Le fichier `render.yaml` est inclus pour automatiser la configuration.