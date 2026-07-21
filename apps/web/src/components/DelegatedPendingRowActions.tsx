// apps/web/src/components/DelegatedPendingRowActions.tsx
// Phase 3b: row actions for a DELEGATED-PENDING intent — one created via the
// delegated flow whose grant never reached ACTIVE (the prepare -> sign ->
// finalize round-trip was interrupted: tab closed, reload, or API down before
// finalize). IntentsPanel renders this INSTEAD of ReadyIntentRowActions so the
// intent never silently offers the manual "Execute now". The user explicitly
// chooses: resume the authorization, or return to manual (which clears the
// persisted marker and lets the normal manual row take over). This component
// does NOT touch ReadyIntentRowActions or the manual CMR/CL flow.
"use client";

import { useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useDelegatedGrant } from "@/hooks/useDelegatedGrant";
import { useDelegationCapability } from "@/hooks/useDelegationCapability";
import { clearDelegatedPending, type DelegatedPendingEntry } from "@/lib/delegatedPending";
import { friendlyDelegatedError } from "@/lib/delegatedErrors";
import type { IntentDto } from "@/lib/sea";

export default function DelegatedPendingRowActions({
  intent,
  entry,
  onAfterAction,
}: {
  intent: IntentDto;
  entry: DelegatedPendingEntry;
  onAfterAction: () => void;
}) {
  const cap = useDelegationCapability();
  const { state: grant, createGrant, reset } = useDelegatedGrant();

  // When a resumed authorization finalizes, drop the pending marker — the grants
  // map then drives the delegated row on the next poll.
  useEffect(() => {
    if (grant.status === "active") {
      clearDelegatedPending(intent.id);
      onAfterAction();
    }
  }, [grant.status, intent.id, onAfterAction]);

  const busy =
    grant.status === "preparing" ||
    grant.status === "awaiting_signature" ||
    grant.status === "finalizing";

  const resume = useCallback(() => {
    void createGrant(intent.id);
  }, [createGrant, intent.id]);

  // Explicit user action ONLY: clear the marker so the intent may render as a
  // normal manual row (and then use manual Execute now).
  const returnToManual = useCallback(() => {
    clearDelegatedPending(intent.id);
    reset();
    onAfterAction();
  }, [intent.id, reset, onAfterAction]);

  const errored = grant.status === "error" || entry.status === "error";

  return (
    <div className="mt-2 space-y-2 rounded-md border border-amber-500/30 bg-amber-500/5 p-2 text-xs">
      <div className="flex items-center justify-between">
        <span className="font-medium text-amber-200">Delegated authorization incomplete</span>
        <span className="text-amber-300">PENDING</span>
      </div>
      <p className="text-neutral-400">
        This intent was created for delegated execution but its authorization wasn&apos;t finished.
        It won&apos;t execute automatically, and it won&apos;t use manual confirmation, until you
        choose below.
      </p>
      {grant.error && <p className="text-red-400">{friendlyDelegatedError(grant.error)}</p>}

      <div className="flex flex-wrap items-center gap-2">
        {cap.available ? (
          <Button type="button" size="sm" disabled={busy} onClick={resume}>
            {busy ? "Resuming…" : errored ? "Retry authorization" : "Resume authorization"}
          </Button>
        ) : (
          <span className="text-neutral-500">{cap.reason}</span>
        )}
        <Button type="button" size="sm" variant="outline" disabled={busy} onClick={returnToManual}>
          Return to manual
        </Button>
      </div>
    </div>
  );
}
