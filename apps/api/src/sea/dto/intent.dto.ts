// apps/api/src/sea/dto/intent.dto.ts
// SEA v1 Phase 1 DTOs.
// Schema validates request shape only. Cross-field invariants (BUY/BEST_ASK,
// CL requires pre-signed payload, etc.) are checked in the service layer
// via `validateCreateIntentBodyInvariants` so they remain unit-testable
// without a Nest container or DB.
import { z } from 'zod';

const HEX_ADDR_RE = /^0x[a-fA-F0-9]{40}$/;
const HEX_BYTES_RE = /^0x[a-fA-F0-9]+$/;
const NON_NEG_INT_RE = /^[0-9]+$/;

const sideSchema = z.enum(['BUY', 'SELL']);
const triggerTypeSchema = z.enum(['PRICE_BELOW', 'PRICE_ABOVE']);
// MID intentionally excluded in v1.
const referenceSchema = z.enum(['BEST_BID', 'BEST_ASK']);

const triggerSchema = z.object({
  type: triggerTypeSchema,
  reference: referenceSchema,
  priceTicks: z.string().regex(NON_NEG_INT_RE),
});

const expirySchema = z.union([
  z.object({
    secsFromActivation: z
      .number()
      .int()
      .min(60)
      .max(60 * 60 * 24 * 30),
  }),
  z.object({ atUnix: z.number().int().positive() }),
]);

const conditionalLimitSchema = z.object({
  version: z.literal(1),
  type: z.literal('CONDITIONAL_LIMIT'),
  marketId: z.string().min(1),
  side: sideSchema,
  sizeBase: z.string().regex(NON_NEG_INT_RE),
  limitPriceTicks: z.string().regex(NON_NEG_INT_RE),
  trigger: triggerSchema,
  expiry: expirySchema,
  executionAuthority: z.literal('PRE_SIGNED_LIMIT_ORDER'),
  // Required constant for CL v1 — see SEA v1 plan, "passive-only" correction.
  enforcement: z.literal('PASSIVE_ONLY'),
});

const conditionalMarketReadySchema = z.object({
  version: z.literal(1),
  type: z.literal('CONDITIONAL_MARKET_READY'),
  marketId: z.string().min(1),
  side: sideSchema,
  sizeBase: z.string().regex(NON_NEG_INT_RE),
  tif: z.enum(['IOC', 'FOK']).optional(),
  trigger: triggerSchema,
  expiry: expirySchema,
  executionAuthority: z.literal('USER_CONFIRMATION_REQUIRED'),
});

export const structuredIntentSchema = z.discriminatedUnion('type', [
  conditionalLimitSchema,
  conditionalMarketReadySchema,
]);

export type StructuredIntent = z.infer<typeof structuredIntentSchema>;

// CMR has no pre-signed 0x order, so ownership is proven by an EIP-191
// personal_sign over a deterministic canonical message (see
// `buildCmrOwnerAuthMessage` in the validator). Required for CMR; forbidden
// on CL (where the 0x signature already authenticates the maker).
const ownerAuthSchema = z.object({
  signature: z.string().regex(HEX_BYTES_RE),
});

export const createIntentBodySchema = z.object({
  owner: z.string().regex(HEX_ADDR_RE),
  structuredIntent: structuredIntentSchema,
  // Pre-signed 0x payload — required for CL, forbidden for CMR.
  // Verified at fire time in Phase 3; not verified here.
  zeroExOrder: z.unknown().optional(),
  signature: z.string().regex(HEX_BYTES_RE).optional(),
  preSignedOrderHash: z.string().regex(HEX_BYTES_RE).optional(),
  ownerAuth: ownerAuthSchema.optional(),
  rawText: z.string().max(2000).optional(),
  parserMeta: z.record(z.string(), z.unknown()).optional(),
});

export type CreateIntentBody = z.infer<typeof createIntentBodySchema>;

// Phase 2.1: cancel is authorized by an EIP-191 personal_sign over a
// canonical message bound to chainId/owner/intentId. The intent's own
// `owner` field is the source of truth — there is no `owner` field in
// the body. Recovered signer must equal `intent.owner`.
//   canonical: SEA-CANCEL-INTENT|v=1|chainId=<n>|owner=<lower>|intentId=<id>
// DEV_SKIP_SIGS=1 still requires the field but skips recovery (mirrors
// OrdersController.cancel).
export const cancelIntentBodySchema = z.object({
  signature: z.string().regex(HEX_BYTES_RE),
});
export type CancelIntentBody = z.infer<typeof cancelIntentBodySchema>;

// Phase 4.x-b: wallet-lock body.
// The FE echoes back the lockNonce + walletLockUntilAt it received in the
// fresh-quote response, along with the EIP-191 signature over the
// canonical message. `.strict()` rejects any extra fields with 400
// invalid_payload so a stray `txHash` cannot smuggle through.
//   canonical: sea:wallet-lock|<intentId>|<owner-lower>|<chainId>|<lockNonce>|<walletLockUntilAt-iso>
export const walletLockBodySchema = z
  .object({
    ownerAuth: z
      .object({
        signature: z.string().regex(HEX_BYTES_RE),
        lockNonce: z.string().min(1),
        walletLockUntilAt: z.string().min(1), // ISO 8601 string
      })
      .strict(),
  })
  .strict();
export type WalletLockBody = z.infer<typeof walletLockBodySchema>;

// Phase 4.x-b: /executing body.
// Bearer-token only. `signature` / `ownerAuth` are explicitly disallowed
// at the schema layer (Blocker 5). `.strict()` is load-bearing here.
export const executingBodySchema = z
  .object({
    txHash: z.string().regex(/^0x[0-9a-fA-F]{64}$/),
    executionToken: z.string().min(1),
  })
  .strict();
export type ExecutingBody = z.infer<typeof executingBodySchema>;

export type IntentInvariantViolation = { path: string; message: string };

export function validateStructuredIntentInvariants(
  si: StructuredIntent,
): IntentInvariantViolation[] {
  const issues: IntentInvariantViolation[] = [];
  // BUY → BEST_ASK, SELL → BEST_BID. Documented v1 rule.
  if (si.side === 'BUY' && si.trigger.reference !== 'BEST_ASK') {
    issues.push({
      path: 'structuredIntent.trigger.reference',
      message: 'BUY intents must reference BEST_ASK in v1',
    });
  }
  if (si.side === 'SELL' && si.trigger.reference !== 'BEST_BID') {
    issues.push({
      path: 'structuredIntent.trigger.reference',
      message: 'SELL intents must reference BEST_BID in v1',
    });
  }
  return issues;
}

export function validateCreateIntentBodyInvariants(
  body: CreateIntentBody,
): IntentInvariantViolation[] {
  const issues = validateStructuredIntentInvariants(body.structuredIntent);
  const si = body.structuredIntent;
  if (si.type === 'CONDITIONAL_LIMIT') {
    if (body.zeroExOrder == null) {
      issues.push({
        path: 'zeroExOrder',
        message: 'CONDITIONAL_LIMIT requires zeroExOrder',
      });
    }
    if (!body.signature) {
      issues.push({
        path: 'signature',
        message: 'CONDITIONAL_LIMIT requires signature',
      });
    }
    if (!body.preSignedOrderHash) {
      issues.push({
        path: 'preSignedOrderHash',
        message: 'CONDITIONAL_LIMIT requires preSignedOrderHash',
      });
    }
    if (body.ownerAuth) {
      issues.push({
        path: 'ownerAuth',
        message:
          'CONDITIONAL_LIMIT must not include ownerAuth (the 0x signature authenticates the maker)',
      });
    }
  } else {
    if (body.zeroExOrder != null) {
      issues.push({
        path: 'zeroExOrder',
        message: 'CONDITIONAL_MARKET_READY must not include zeroExOrder',
      });
    }
    if (body.signature) {
      issues.push({
        path: 'signature',
        message: 'CONDITIONAL_MARKET_READY must not include signature',
      });
    }
    if (body.preSignedOrderHash) {
      issues.push({
        path: 'preSignedOrderHash',
        message: 'CONDITIONAL_MARKET_READY must not include preSignedOrderHash',
      });
    }
    if (!body.ownerAuth?.signature) {
      issues.push({
        path: 'ownerAuth.signature',
        message: 'CONDITIONAL_MARKET_READY requires ownerAuth.signature',
      });
    }
    // CMR ownerAuth canonical message binds an absolute expiresAtUnix.
    // Restrict CMR expiry to the {atUnix} form so FE and BE deterministically
    // agree on the value being signed (no clock-drift between sign and receive).
    if (!('atUnix' in si.expiry)) {
      issues.push({
        path: 'structuredIntent.expiry',
        message:
          'CONDITIONAL_MARKET_READY requires expiry.atUnix (secsFromActivation is not supported because it does not produce a deterministic value to sign)',
      });
    }
  }
  return issues;
}

export function computeExpiresAt(
  expiry: StructuredIntent['expiry'],
  now: Date = new Date(),
): Date {
  if ('atUnix' in expiry) return new Date(expiry.atUnix * 1000);
  return new Date(now.getTime() + expiry.secsFromActivation * 1000);
}
