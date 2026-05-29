import type { Metadata } from "next";
import { AccessRequestForm } from "@/components/AccessRequestForm";
import { Badge, Panel } from "@/components/ui";
import { accessPolicy } from "@/lib/access/downloadPolicy";

export const metadata: Metadata = {
  title: "Dataset Access",
  description: "Request gated dataset access and review the DefendableDatasets download quota policy.",
};

export default function AccessPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-wrap gap-2">
        <Badge>Live access policy</Badge>
        <Badge>{accessPolicy.downloads_per_email} downloads per email</Badge>
        <Badge>{accessPolicy.window}</Badge>
      </div>
      <h1 className="mt-4 text-4xl font-semibold text-white">Dataset Access</h1>
      <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-300">
        Public metadata stays open. Large files and gated corpora move through controlled download links so builders can use the commons without letting bots drain storage.
      </p>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        <Panel className="rounded-md">
          <h2 className="font-semibold text-white">Request a Download Identity</h2>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            Use one email per builder or organization. The production gateway should issue signed, expiring URLs and increment the email quota before each file transfer.
          </p>
          <div className="mt-5">
            <AccessRequestForm />
          </div>
        </Panel>

        <Panel className="rounded-md">
          <h2 className="font-semibold text-white">Quota Rules</h2>
          <dl className="mt-4 grid gap-3 text-sm">
            <Row label="Limit" value={`${accessPolicy.downloads_per_email} downloads`} />
            <Row label="Identity" value="Email" />
            <Row label="Window" value={accessPolicy.window} />
            <Row label="Enforcement" value={accessPolicy.enforcement} />
          </dl>
        </Panel>
      </div>

      <Panel className="mt-6 rounded-md">
        <h2 className="font-semibold text-white">Gateway Requirements</h2>
        <div className="mt-4 grid gap-3 text-sm leading-6 text-slate-300 md:grid-cols-2">
          <p>Verify email or member identity before issuing file URLs.</p>
          <p>Use Turnstile and IP throttles to slow automated signup and scraping.</p>
          <p>Store counters in Cloudflare KV or D1 with a rolling-window reset.</p>
          <p>Sign object-storage URLs with short expirations and log receipt IDs.</p>
        </div>
      </Panel>
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-2">
      <dt className="text-slate-400">{label}</dt>
      <dd className="text-right text-white">{value}</dd>
    </div>
  );
}

