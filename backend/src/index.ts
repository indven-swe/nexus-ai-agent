import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { resolve } from 'node:path';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';

import { NexusAgent } from './agent/NexusAgent.js';

dotenv.config({ path: resolve(process.cwd(), '.env') });
const fallbackEnvPath = resolve(process.cwd(), '../.env');
if (!process.env.PORT) {
  dotenv.config({ path: fallbackEnvPath });
}

const app = express();
const port = Number(process.env.PORT ?? '3001');
const serverAgent = new NexusAgent();
const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? 'http://localhost:5173,http://127.0.0.1:5173')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);

const chatSchema = z.object({
  message: z.string().trim().min(1).max(2000),
  conversationId: z.string().trim().min(1).max(200).optional(),
});

const historyStore = new Map<string, { role: 'user' | 'assistant'; content: string; timestamp: number }[]>();

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error('Origin not allowed by CORS'));
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'nexus-backend' });
});

app.get('/api/conversations/:conversationId', (req, res) => {
  const conversationId = req.params.conversationId;
  const history = historyStore.get(conversationId) ?? [];
  res.json({ conversationId, history });
});

app.post('/api/chat', async (req, res) => {
  try {
    const parsed = chatSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        error: 'Invalid payload',
        details: parsed.error.flatten(),
      });
    }

    const { message, conversationId } = parsed.data;
    const id = conversationId ?? randomUUID();
    const conversationHistory = historyStore.get(id) ?? [];

    conversationHistory.push({
      role: 'user',
      content: message,
      timestamp: Date.now(),
    });

    const result = await serverAgent.process({
      message,
      history: conversationHistory,
      conversationId: id,
    });

    conversationHistory.push({
      role: 'assistant',
      content: result.response,
      timestamp: Date.now(),
    });

    historyStore.set(id, conversationHistory);

    return res.json({
      conversationId: id,
      status: 'completed',
      activity: result.activity,
      response: result.response,
      steps: result.steps,
      providers: result.providers,
      history: conversationHistory,
    });
  } catch (error) {
    console.error('Chat request failed:', error);
    return res.status(500).json({
      error: 'Unable to complete the request.',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.originalUrl}` });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Nexus backend listening on http://localhost:${port}`);
});
