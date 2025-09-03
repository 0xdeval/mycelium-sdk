import express from "express";
import { localFaucet } from "@/controllers/faucet";
import { usdcFaucetImpersonate } from "@/controllers/faucetUSDC";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.EXPRESS_PORT || 3001;

app.use(express.json());

// Faucet routes
app.post("/faucet", localFaucet);
app.post("/faucet-usdc", usdcFaucetImpersonate);

app.listen(port, () => {
  console.log(`🚀 Express server running on port ${port}`);
  console.log(`💰 ETH Faucet: POST /faucet`);
  console.log(`💵 USDC Faucet: POST /faucet-usdc`);
});
