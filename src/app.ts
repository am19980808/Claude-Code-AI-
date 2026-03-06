import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';
import router from './routes/index.js';

const app = express();

// セキュリティヘッダー
app.use(helmet());

// CORS
app.use(
  cors({
    origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173',
    credentials: true,
  }),
);

// JSONボディパーサー
app.use(express.json());

// ルーティング
app.use('/api/v1', router);

// 404ハンドラー（ルーティングの後）
app.use(notFoundHandler);

// エラーハンドラー（最後）
app.use(errorHandler);

export default app;
