import { Client, PrivateKey } from '@hashgraph/sdk';
import * as dotenv from 'dotenv';

dotenv.config();

const accountId = process.env.HEDERA_ACCOUNT_ID || "";
const privateKey = process.env.HEDERA_PRIVATE_KEY || "";
const network = process.env.HEDERA_NETWORK || "testnet";

let hederaClient: Client | null = null;

try {
    if (accountId && privateKey) {
        hederaClient = network === "mainnet" ? Client.forMainnet() : Client.forTestnet();
        hederaClient.setOperator(accountId, PrivateKey.fromStringECDSA(privateKey));
        console.log("Hedera client initialized successfully.");
    } else {
        console.warn("Missing Hedera credentials — HCS logging and NFT minting will be disabled.");
    }
} catch (err) {
    console.error("Failed to initialize Hedera client (key format issue?) — HCS logging and NFT minting will be disabled.", err);
    hederaClient = null;
}

export const agentKit = {
    client: hederaClient
};
