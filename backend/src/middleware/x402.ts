import { paymentMiddleware, x402ResourceServer } from "@x402/express";
import { ExactEvmScheme } from "@x402/evm/exact/server";
import { HTTPFacilitatorClient } from "@x402/core/server";

const FACILITATOR_URL = process.env.X402_FACILITATOR_URL || "https://x402.org/facilitator";
const AGENT_WALLET_ADDRESS = process.env.HEDERA_ACCOUNT_ID || "";
const HEDERA_NETWORK = process.env.HEDERA_NETWORK || "testnet";

/**
 * Initializes the x402 payment middleware for Express.
 * Protected routes will return HTTP 402 until the client submits a valid payment.
 * The facilitator verifies and settles the HBAR transfer on the Hedera ledger.
 */
export function createX402Middleware() {
    const facilitatorClient = new HTTPFacilitatorClient({
        url: FACILITATOR_URL,
    });

    const evmScheme = new ExactEvmScheme();

    const resourceServer = new x402ResourceServer(facilitatorClient)
        .register(`eip155:296`, evmScheme); // 296 is Hedera Testnet EVM Chain ID

    const routeConfig: Record<string, any> = {
        "POST /api/audit": {
            accepts: {
                scheme: "exact",
                price: "0.5",
                network: `eip155:296`,
                asset: "0x0000000000000000000000000000000000000000", // Native HBAR on EVM
                payTo: AGENT_WALLET_ADDRESS,
            },
            description: "Smart contract security audit",
        },
    };

    return paymentMiddleware(routeConfig, resourceServer);
}
