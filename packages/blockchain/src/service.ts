import express from 'express';
import { faucetEth } from './controllers/faucetEth';
import { usdcFaucetImpersonate } from './controllers/faucetUSDC';
import cors from 'cors';
import dotenv from 'dotenv';
import { dropFunds } from './controllers/dropFunds';
import { health } from './controllers/health';

dotenv.config();

const app = express();
const port = process.env.EXPRESS_PORT || 3001;

app.use(express.json());
app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

app.post('/faucet', faucetEth);
app.post('/faucet-usdc', usdcFaucetImpersonate);
app.post('/drop-funds', dropFunds);
app.get('/health', health);

if (!process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`🚀 Express server running on port ${port}`);
    console.log(`💰 ETH Faucet: POST /faucet`);
    console.log(`💵 USDC Faucet: POST /faucet-usdc`);
  });
}

export default app;
