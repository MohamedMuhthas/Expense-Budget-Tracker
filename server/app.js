import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import authRoutes from './src/routes/authRoutes.js';
import transactionRoutes from './src/routes/transactionRoutes.js';
import budgetRoutes from './src/routes/budgetRoutes.js';
import dashboardRoutes from './src/routes/dashboardRoutes.js';
import { getCategories } from './src/controllers/transactionController.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json({ limit: '10kb' }));

app.get('/api/health', (req, res) => res.status(200).json({ status: 'ok' }));
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.get('/api/categories', getCategories);

app.use((req, res) => res.status(404).json({ message: 'Route not found' }));
app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  const status = error.status || (error.name === 'ValidationError' || error.name === 'CastError' || error.type === 'entity.parse.failed' ? 400 : error.code === 11000 ? 409 : 500);
  if (status >= 500) console.error(error);
  const response = { message: status >= 500 ? 'Internal server error' : error.message };
  if (error.name === 'ValidationError') {
    response.errors = Object.values(error.errors).map(({ path, message }) => ({ field: path, message }));
  }
  return res.status(status).json(response);
});

export default app;
