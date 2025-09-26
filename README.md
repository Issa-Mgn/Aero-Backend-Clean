# Aero Backend

Backend pour l'application Aero, permettant des appels vocaux en temps réel avec IA pour pratiquer l'anglais.

## Fonctionnalités

- Communication temps réel via WebSockets (Socket.IO)
- Appels vocaux avec OpenAI Realtime API pour latence minimale
- IA conversationnelle : Transcription automatique, réponses en anglais avec correction douce
- Enregistrement des conversations (utilisateur et IA) en mémoire
- Transcription complète disponible à la fin de l'appel
- Routes REST pour gestion des appels et changement de langue/prompt
- Gestion de sessions multiples pour utilisateurs simultanés
- Logging détaillé pour connexions, messages et erreurs
- Architecture MVC propre

## Installation

1. Cloner le repo
2. `npm install`
3. Copier `.env.example` vers `.env` et configurer les variables d'environnement :
   - `OPENAI_API_KEY` : Votre clé API OpenAI
   - `PORT` : Port du serveur (3000 par défaut)
4. `npm start` ou `npm run dev`

## Endpoints REST

- `POST /api/calls/start` : Démarrer un appel
  - Body: `{ "userId": "string" }`
  - Response: `{ "callId": "string", "message": "Call started" }`

- `POST /api/calls/end/:callId` : Terminer un appel
  - Response: `{ "message": "Call ended", "transcription": [...] }`

- `GET /api/calls/history/:userId` : Récupérer l'historique
  - Response: Array des appels

- `POST /api/calls/language` : Changer le prompt système
  - Body: `{ "prompt": "string" }`
  - Response: `{ "message": "System prompt updated" }`

## Événements WebSocket

- `start-call` : Démarrer l'appel avec OpenAI Realtime
- `audio-data` : Envoi d'audio utilisateur (streaming)
- `ai-text-delta` : Delta de texte IA en temps réel
- `ai-audio-delta` : Delta d'audio IA en streaming
- `call-ended` : Fin d'appel avec transcription
- `call-started` : Confirmation de démarrage d'appel
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