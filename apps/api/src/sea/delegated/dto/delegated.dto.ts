// apps/api/src/sea/delegated/dto/delegated.dto.ts
// Zod schemas for the delegated CMR endpoints (mirrors dto/intent.dto.ts style).
import { z } from 'zod';

const address = z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'invalid address');
const accountModel = z.enum(['EIP7702', 'NEXUS_SA']).optional();

export const prepareGrantBodySchema = z
  .object({
    intentId: z.string().min(1),
    owner: address,
    accountModel,
  })
  .strict();

export const finalizeGrantBodySchema = z
  .object({
    intentId: z.string().min(1),
    owner: address,
    accountModel,
    accountAddress: address,
    sessionBlob: z.string().min(1),
    ownerSignature: z.string().min(1),
  })
  .strict();

export const revokeGrantBodySchema = z
  .object({
    intentId: z.string().min(1),
    owner: address,
  })
  .strict();

// Read-only Nexus SA setup facts (query params).
export const saStatusQuerySchema = z
  .object({
    intentId: z.string().min(1),
    owner: address,
    accountModel,
  })
  .strict();

// Read-only: an owner's delegated grants (row-branching + status UI).
export const grantsQuerySchema = z
  .object({
    owner: address,
  })
  .strict();

// Read-only: delegated execution attempts for one intent (owner-scoped).
export const attemptsQuerySchema = z
  .object({
    owner: address,
    intentId: z.string().min(1),
  })
  .strict();
