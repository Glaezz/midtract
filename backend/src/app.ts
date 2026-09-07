import express from 'express';
import cors from 'cors';
import { ordersRouter } from './modules/orders/orders.routes.js';
import { paymentsRouter } from './modules/payments/payments.routes.js';
import { onboardingRouter } from './modules/onboarding/onboarding.routes.js';
import { usersRouter } from './modules/users/users.routes.js';
import { disputesRouter } from './modules/disputes/disputes.routes.js';
import { env } from './config/env.js';

export const app = express();

app.use(cors({
  origin: env.VITE_FRONTEND_URL,
  credentials: true
}));
app.use(express.json());

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use('/api/orders', ordersRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/onboarding', onboardingRouter);
app.use('/api/users', usersRouter);
app.use('/api/disputes', disputesRouter);
