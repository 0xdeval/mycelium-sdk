// import { sepolia } from "viem/chains";
// import MyceliumSDK from "@mycelium-sdk/core/index";
// import dotenv from "dotenv";
// import { PrivyClient } from "@privy-io/server-auth";

// dotenv.config();

// if (
//   !process.env.PRIVY_APP_ID ||
//   !process.env.PRIVY_APP_SECRET ||
//   !process.env.BUNDLER_URL
// ) {
//   throw new Error("Missing environment variables");
// }

// const PRIVY_APP_ID = process.env.PRIVY_APP_ID;
// const PRIVY_APP_SECRET = process.env.PRIVY_APP_SECRET;
// const BUNDLER_URL = process.env.BUNDLER_URL;

// const USER_BASED_DATA = "mikekrupin";

// /**
//  * Simple example of creating an AA (Account Abstraction) wallet using the Mycelium SDK
//  */
// async function createAAWallet() {
//   try {
//     console.log("🚀 Creating AA Wallet Example");
//     console.log("================================");

//     // 1. Initialize the SDK
//     console.log("1️⃣ Initializing SDK...");
//     const sdk = new MyceliumSDK({
//       walletsConfig: {
//         embeddedWalletConfig: {
//           provider: {
//             type: "privy",
//             privyClient: new PrivyClient(PRIVY_APP_ID, PRIVY_APP_SECRET),
//           },
//         },
//         smartWalletConfig: {
//           provider: {
//             type: "default",
//           },
//         },
//       },
//       chains: [
//         {
//           chainId: sepolia.id,
//           rpcUrl: sepolia.rpcUrls.default.http[0],
//           bundlerUrl: BUNDLER_URL,
//         },
//       ],
//     });
//     console.log("✅ SDK initialized");

//     // 2. Get or create wallet with embedded signer (deterministic for same userId)
//     console.log("2️⃣ Getting or creating wallet with embedded signer...");

//     let wallet;
//     try {
//       // Try to get existing wallet first
//       wallet = await sdk.wallet.getSmartWalletWithEmbeddedSigner({
//         walletId: USER_BASED_DATA, // This creates/retrieves both embedded and smart wallet
//       });
//       console.log("✅ Existing wallet retrieved");
//     } catch (error) {
//       console.error(
//         "❌ Error getting smart wallet with embedded signer:",
//         error
//       );
//       console.log("📝 Creating new wallet...");
//       // Create new wallet if it doesn't exist
//       //   wallet = await sdk.wallet.createWalletWithEmbeddedSigner();
//       console.log("✅ New wallet created");
//     }

//     // // 3. Get wallet addresses
//     // console.log("3️⃣ Getting wallet addresses...");
//     // const smartWalletAddress = await wallet.getAddress();
//     // const privyAddress = wallet.signer.address;
//     // console.log(`🏦 Smart Wallet Address: ${smartWalletAddress}`);
//     // console.log(`📝 Privy Address: ${privyAddress}`);

//     // // 4. Get wallet balance
//     // console.log("4️⃣ Checking wallet balance...");
//     // const balance = await wallet.getBalance();
//     // console.log("💰 Wallet balance:", balance);

//     // // 5. Show wallet capabilities
//     // console.log("5️⃣ Wallet capabilities:");
//     // console.log("   • ERC-4337 compatible");
//     // console.log("   • Gasless transactions via bundler");
//     // console.log("   • Multi-chain support");
//     // console.log("   • Deterministic address generation");

//     // console.log("\n🎉 Wallet creation completed successfully!");
//     // console.log("===============================================");
//   } catch (error) {
//     console.error("❌ Error creating AA wallet:", error);
//     process.exit(1);
//   }
// }

// // Run the example
// if (require.main === module) {
//   createAAWallet().catch((error) => {
//     console.error("❌ Unhandled error:", error);
//     process.exit(1);
//   });
// }

// export { createAAWallet };
