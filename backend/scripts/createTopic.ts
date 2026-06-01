import { Client, TopicCreateTransaction, PrivateKey } from "@hashgraph/sdk";
import * as dotenv from "dotenv";

dotenv.config();

async function main() {
    const accountId = process.env.HEDERA_ACCOUNT_ID || "";
    const privateKey = process.env.HEDERA_PRIVATE_KEY || "";

    if (!accountId || !privateKey) {
        throw new Error("Missing Hedera credentials in environment variables.");
    }

    // Initialize the Hedera Testnet client
    const client = Client.forTestnet();
    client.setOperator(accountId, PrivateKey.fromStringECDSA(privateKey));

    console.log("Creating new HCS Topic on Hedera Testnet...");

    // Create the transaction to generate a new topic
    const transaction = new TopicCreateTransaction();
    
    // Execute the transaction
    const txResponse = await transaction.execute(client);
    
    // Get the receipt to obtain the newly generated topic ID
    const receipt = await txResponse.getReceipt(client);
    
    console.log(`\n✅ Topic successfully created!`);
    console.log(`📌 Your HCS Topic ID: ${receipt.topicId}`);
    console.log(`\n(Please copy this ID and add it to your .env file as HEDERA_HCS_TOPIC_ID)`);
    
    process.exit(0);
}

main().catch((error) => {
    console.error("Failed to create topic:", error);
    process.exit(1);
});
