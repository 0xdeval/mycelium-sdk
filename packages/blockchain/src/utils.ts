import dotenv from "dotenv";

dotenv.config();

if (!process.env.RPC_URL) {
  throw new Error("RPC_URL is not set");
}

const RPC_URL = process.env.RPC_URL;

export async function rpcCall(method: string, params = []) {
  const res = await fetch(RPC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method,
      params,
    }),
  });
  const json = await res.json();
  if (json.error) throw new Error(json.error.message);
  return json.result;
}
