import { HederaAgentKit } from 'hedera-agent-kit';
import * as dotenv from 'dotenv';

dotenv.config();

const accountId = process.env.HEDERA_ACCOUNT_ID || "";
const privateKey = process.env.HEDERA_PRIVATE_KEY || "";
const network = process.env.HEDERA_NETWORK || "testnet";

if (!accountId || !privateKey) {
    throw new Error("Missing Hedera credentials in environment variables.");
}

export const agentKit = new HederaAgentKit(
    accountId,
    privateKey,
    network
);
