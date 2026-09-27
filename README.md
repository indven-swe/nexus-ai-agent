# Nexus AI Agent

Nexus is a unified AI agent that combines ZeroScript and Nilo strategies behind a single user-facing assistant. It exposes a modern chat interface with conversation memory, tool status indicators, and clean local mock adapters so the project runs without external credentials.

## Features
- Unified chat experience with a single agent identity
- Automatic routing between ZeroScript and Nilo capabilities
- Local mock adapter layer for real integrations
- Conversation memory and status updates
- TypeScript frontend and backend
- Error handling and input validation
- Docker-friendly local development setup

## Tech stack
- React + TypeScript + Vite frontend
- Express + TypeScript backend
- Environment-based secrets configured in `.env`
- Modular adapter architecture

## Project structure

- `frontend/` — React app
- `backend/` — Express API and orchestration logic
- `.env.example` — sample environment variables

## Quick start

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create environment file:

   ```bash
   cp .env.example .env
   ```

3. Start both services:

   ```bash
   npm run dev
   ```

4. Open the app in a browser:

   - Frontend: http://localhost:5173
   - Backend: http://localhost:3001

## API

### POST /api/chat
Request body:

```json
{
  "message": "Help me design a clean user onboarding flow",
  "conversationId": "optional-custom-id"
}
```

Example response:

```json
{
  "conversationId": "abc123",
  "status": "completed",
  "activity": "Finished",
  "response": "Here is a concise plan...",
  "steps": [
    { "name": "Thinking", "detail": "Reviewing the user goal" },
    { "name": "Using ZeroScript", "detail": "Assessing the task structure" },
    { "name": "Using Nilo", "detail": "Refining the final answer" }
  ],
  "providers": {
    "zeroScript": "Planning and structure support",
    "nilo": "Response refinement and clarity"
  }
}
```

## Replacing mock adapters with real services

The app intentionally includes mock implementations in:

- `backend/src/adapters/ZeroScriptAdapter.ts`
- `backend/src/adapters/NiloAdapter.ts`

These are the integration points to replace with your real APIs or SDKs while preserving the same interface.

## Notes
- Secrets should remain server-side via environment variables.
- Frontend code never stores secrets or API keys.
- The app is designed for local development and can be extended with persistent storage or real external providers.
