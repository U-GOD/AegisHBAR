import { Client, PrivateKey } from '@hashgraph/sdk';
import { AgentMode, coreConsensusPlugin, coreTokenPlugin } from 'hedera-agent-kit';
import * as dotenv from 'dotenv';

dotenv.config();

const accountId = process.env.HEDERA_ACCOUNT_ID || "";
const privateKey = process.env.HEDERA_PRIVATE_KEY || "";
const network = process.env.HEDERA_NETWORK || "testnet";

let hederaClient: Client | null = null;
let agentContext = { mode: AgentMode.AUTONOMOUS };

try {
    if (accountId && privateKey) {
        hederaClient = network === "mainnet" ? Client.forMainnet() : Client.forTestnet();
        hederaClient.setOperator(accountId, PrivateKey.fromStringECDSA(privateKey));
        console.log("Hedera Agent Kit initialized successfully.");
    } else {
        console.warn("Missing Hedera credentials — Agent Kit operations will be disabled.");
    }
} catch (err) {
    console.error("Failed to initialize Hedera Agent Kit.", err);
    hederaClient = null;
}

export const agentKit = {
    client: hederaClient,
    context: agentContext,
    consensus: coreConsensusPlugin,
    token: coreTokenPlugin
};
