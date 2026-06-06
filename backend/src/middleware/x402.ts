import { paymentMiddleware, x402ResourceServer } from "@x402/express";
import { ExactHederaScheme } from "@x402/hedera/exact/server";
import { HTTPFacilitatorClient } from "@x402/core/server";

const FACILITATOR_URL = process.env.X402_FACILITATOR_URL || "https://api.testnet.blocky402.com";
const AGENT_WALLET_ADDRESS = process.env.HEDERA_ACCOUNT_ID || "";
const HEDERA_NETWORK = process.env.HEDERA_NETWORK || "testnet";

/**
 * Initializes the x402 payment middleware for Express.
 * Protected routes will return HTTP 402 until the client submits a valid payment.
 * The facilitator verifies and settles the HBAR transfer on the Hedera ledger.
 */
export function createX402Middleware() {
    const facilitatorClient = new HTTPFacilitatorClient({ url: FACILITATOR_URL });
    const hederaScheme = new ExactHederaScheme();

    const resourceServer = new x402ResourceServer(facilitatorClient)
        .register(`hedera:${HEDERA_NETWORK}`, hederaScheme);

    const routeConfig: Record<string, any> = {
        "POST /api/audit": {
            accepts: {
                scheme: "exact",
                price: "0.5",
                network: `hedera:${HEDERA_NETWORK}`,
                asset: "0.0.0", // Native HBAR
                payTo: AGENT_WALLET_ADDRESS,
                extra: { feePayer: "0.0.7162784" } // Blocky402 Testnet Fee Payer
            },
            description: "Smart contract security audit",
        },
    };

    return paymentMiddleware(routeConfig, resourceServer);
}
