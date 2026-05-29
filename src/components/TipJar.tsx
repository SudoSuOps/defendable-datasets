import { CopyButton } from "@/components/CopyButton";
import { tipJar } from "@/lib/support/tipJar";

export function TipJar({ compact = false }: { compact?: boolean }) {
  return (
    <div className="rounded-md border border-amber-300/20 bg-amber-300/10 p-4">
      <div className="text-sm font-semibold text-amber-100">Tip jar</div>
      <p className="mt-2 text-sm leading-6 text-slate-300">
        Thank you. Tips help support the compute to cook, hash, verify, and publish more datasets for the community.
      </p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
        <code className="min-w-0 flex-1 break-all rounded-md border border-white/10 bg-black/30 px-3 py-2 text-xs text-amber-100">
          {tipJar.btc}
        </code>
        <CopyButton label={compact ? "Copy BTC" : `Copy ${tipJar.label}`} value={tipJar.btc} />
      </div>
    </div>
  );
}

