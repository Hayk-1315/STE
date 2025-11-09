// apps/api/src/zeroex/limit-order.types.ts
export type Address = `0x${string}`;
export type Bytes32 = `0x${string}`;

export interface LimitOrder {
  makerToken: Address;
  takerToken: Address;
  makerAmount: bigint; // uint128
  takerAmount: bigint; // uint128
  takerTokenFeeAmount: bigint; // uint128
  maker: Address;
  taker: Address; // zero = open
  sender: Address; // zero = any caller
  feeRecipient: Address; // zero = none
  pool: Bytes32;
  expiry: number; // uint64 (unix seconds)
  salt: bigint; // uint256
}

export enum SignatureType {
  ILLEGAL = 0,
  INVALID = 1,
  EIP712 = 2,
  ETHSIGN = 3,
}

export interface Signature {
  signatureType: SignatureType;
  v: number;
  r: Bytes32;
  s: Bytes32;
}

export const EIP712_LIMIT_ORDER_TYPES = {
  LimitOrder: [
    { name: 'makerToken', type: 'address' },
    { name: 'takerToken', type: 'address' },
    { name: 'makerAmount', type: 'uint128' },
    { name: 'takerAmount', type: 'uint128' },
    { name: 'takerTokenFeeAmount', type: 'uint128' },
    { name: 'maker', type: 'address' },
    { name: 'taker', type: 'address' },
    { name: 'sender', type: 'address' },
    { name: 'feeRecipient', type: 'address' },
    { name: 'pool', type: 'bytes32' },
    { name: 'expiry', type: 'uint64' },
    { name: 'salt', type: 'uint256' },
  ],
} as const;
