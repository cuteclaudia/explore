# Subscription source evidence

Checked 29 October 2026 (Sydney). Official GitHub source was reachable. Direct access to `https://developer.paddle.com/webhooks/overview` failed at this execution environment’s CONNECT proxy with HTTP 403, so no live pricing, commercial eligibility, current documentation page or merchant checkout was independently verified. No sandbox/live provider call was made.

Official Paddle Node SDK: `https://github.com/PaddleHQ/paddle-node-sdk`, snapshot **`6a01ef4177ea8a3c1e1d24da8fb8486e280d7301`**. Read source only; no external scripts or SDK package were installed or run.

| Evidence | What it establishes | Limit |
| --- | --- | --- |
| [README](https://github.com/PaddleHQ/paddle-node-sdk/blob/6a01ef4177ea8a3c1e1d24da8fb8486e280d7301/README.md) | Paddle Billing SDK, sandbox/production environments and separate keys | Not merchant acceptance, policy approval, tax configuration or current fees |
| [Subscription states](https://github.com/PaddleHQ/paddle-node-sdk/blob/6a01ef4177ea8a3c1e1d24da8fb8486e280d7301/src/enums/subscription/subscription-status.ts) | `active`, `canceled`, `past_due`, `paused`, `trialing` types | State string alone is not payment proof or a safe grant interval |
| [Webhook validator](https://github.com/PaddleHQ/paddle-node-sdk/blob/6a01ef4177ea8a3c1e1d24da8fb8486e280d7301/src/notifications/helpers/webhooks-validator.ts) | Timestamp + raw payload HMAC; source uses five-second freshness constant | Reviewed helper compares age against the past and hash using ordinary equality; require explicit future-timestamp, multi-signature/key rotation and constant-time verification review before using it as a production boundary |
| [Discount request](https://github.com/PaddleHQ/paddle-node-sdk/blob/6a01ef4177ea8a3c1e1d24da8fb8486e280d7301/src/resources/discounts/operations/create-discount-request-body.ts) | `recur`, `maximumRecurringIntervals`, restrictions and expiry fields exist | Actual first-payment-only discount behaviour must pass sandbox renewal/upgrade tests |
| [Portal session request](https://github.com/PaddleHQ/paddle-node-sdk/blob/6a01ef4177ea8a3c1e1d24da8fb8486e280d7301/src/resources/customer-portal-sessions/operations/create-customer-portal-session-request-object.ts) | Server creates a portal session with subscription IDs | Application must authenticate and bind IDs to the correct account |
| [Cancel request](https://github.com/PaddleHQ/paddle-node-sdk/blob/6a01ef4177ea8a3c1e1d24da8fb8486e280d7301/src/resources/subscriptions/operations/cancel-subscription-request-object.ts) | Effective-time option exists | Confirm actual end-of-period behaviour, refunds and proration in sandbox |

The supplied Claude licensing draft was read from the uploaded `Pasted text.txt`. Its app/version availability, merchant terms, Microsoft Store fee claims and conversion benchmarks were not accepted as independently verified facts. This specification distinguishes the user’s explicit founding-discount decision from proposed prices and technical limits.

No claim is made that Paddle, Netlify or payment/customer metadata operates exclusively under European jurisdiction. A future regional hosting move requires a separate data-flow and contractual review.
