// apps/api/test/sea/delegated/delegated-live.gated.spec.ts
//
// GATED live smoke test for the real Biconomy provider. SKIPPED unless
// RUN_DELEGATED_LIVE=1 — so normal CI never makes a Biconomy/network call.
// Full on-chain E2E (real grant + real 0x fill) is exercised by the throwaway
// spike harness (ste-phase0-scratch/s4c-real0x.mjs), outside the repo.
//
// When enabled, this only verifies that the adapter can dynamic-import the SDK
// and report capabilities — a lightweight boundary check, not an on-chain fill.
import { BiconomyDelegationProvider } from '../../../src/sea/delegated/biconomy-delegation.provider';
import { resolveDelegationConfig } from '../../../src/sea/delegated/delegation.config';
import { SessionSignerProvider } from '../../../src/sea/delegated/session-signer.provider';

const RUN = process.env.RUN_DELEGATED_LIVE === '1';

(RUN ? describe : describe.skip)(
  'BiconomyDelegationProvider (gated live)',
  () => {
    it('reports capabilities and dynamic-imports the SDK', async () => {
      const cfg = resolveDelegationConfig({
        PROFILE: 'sepolia',
        SEA_DELEGATED_ENABLED: '1',
        SEA_DELEGATED_PROVIDER: 'biconomy',
        ZEROEX_EXCHANGE_PROXY: '0xdef1c0ded9bec7f1a1670819833240f027b25eff',
      } as unknown as NodeJS.ProcessEnv);
      const signer = new SessionSignerProvider(cfg);
      const provider = new BiconomyDelegationProvider(cfg, signer);
      const caps = await provider.capabilities({
        chainId: 11155111,
        profile: 'ethereum-sepolia',
      });
      expect(caps.accountModels).toContain('EIP7702');
    });
  },
);
