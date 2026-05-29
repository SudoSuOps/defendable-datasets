import Link from "next/link";
import Image from "next/image";
import { Database, ExternalLink, GitBranch, Mail, MessageSquare, Package, ScrollText, ShieldCheck } from "lucide-react";
import { PackProvider } from "./PackProvider";
import { TipJar } from "./TipJar";
import { HelpAgentWidget } from "./HelpAgentWidget";

const nav = [
  { href: "/graph", label: "Graph", icon: GitBranch },
  { href: "/registry", label: "Registry", icon: Database },
  { href: "/pack", label: "Pack", icon: Package },
  { href: "/access", label: "Access", icon: ShieldCheck },
  { href: "/docs", label: "Docs", icon: ScrollText },
];

const ecosystem = [
  { label: "DefendableOS", href: "https://defendableos.com" },
  { label: "DefendableCloud", href: "https://defendablecloud.com" },
  { label: "DefendableDatasets", href: "https://defendabledatasets.com" },
  { label: "Defendable Router", href: "https://defendablerouter.com" },
  { label: "Defendable GRO Ops", href: "https://defendableos.com" },
];

export function Shell({ children }: { children: React.ReactNode }) {
  return (
    <PackProvider>
      <div className="min-h-screen bg-[#080b0f] text-slate-100">
        <div className="fixed inset-0 -z-10 bg-[linear-gradient(rgba(255,255,255,.035)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.035)_1px,transparent_1px)] bg-[size:44px_44px]" />
        <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_18%_12%,rgba(245,158,11,.18),transparent_28%),radial-gradient(circle_at_82%_10%,rgba(20,184,166,.16),transparent_26%),radial-gradient(circle_at_50%_90%,rgba(56,189,248,.12),transparent_30%)]" />
        <header className="sticky top-0 z-40 border-b border-white/10 bg-[#080b0f]/86 backdrop-blur-xl">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/defendable-icon.png"
                alt=""
                width={34}
                height={34}
                className="hidden size-8 object-contain md:block"
                priority
              />
              <div className="grid size-9 place-items-center rounded-md border border-amber-300/30 bg-amber-300/10 text-amber-200 md:hidden">
                DD
              </div>
              <div>
                <div className="font-semibold tracking-wide">DefendableDatasets</div>
                <div className="text-xs text-slate-400">Open datasets with receipts</div>
              </div>
            </Link>
            <nav className="hidden items-center gap-1 md:flex">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white"
                >
                  <item.icon className="size-4" />
                  {item.label}
                </Link>
              ))}
            </nav>
            <Link
              href="/contribute"
              className="rounded-md border border-teal-300/30 px-3 py-2 text-sm text-teal-100 transition hover:bg-teal-300/10"
            >
              Contribute
            </Link>
          </div>
        </header>
        {children}
        <footer className="border-t border-white/10 bg-[#070a0f]/92">
          <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.2fr_1fr_1fr] lg:px-8">
            <div>
              <div className="flex items-center gap-3">
                <Image
                  src="/defendable-icon.png"
                  alt=""
                  width={36}
                  height={36}
                  className="hidden size-9 object-contain md:block"
                />
                <div className="grid size-9 place-items-center rounded-md border border-amber-300/30 bg-amber-300/10 text-amber-200 md:hidden">
                  DD
                </div>
                <div>
                  <div className="font-semibold text-white">DefendableDatasets</div>
                  <div className="text-xs text-slate-500">Part of the Defendable ecosystem</div>
                </div>
              </div>
              <p className="mt-4 max-w-md text-sm leading-6 text-slate-400">
                Open dataset graph infrastructure for builders, labs, and fine-tune teams. Receipts over vibes.
              </p>
            </div>

            <div>
              <div className="text-sm font-semibold text-white">Defendable Ecosystem</div>
              <div className="mt-4 grid gap-2">
                {ecosystem.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex w-fit items-center gap-2 text-sm text-slate-400 transition hover:text-amber-200"
                  >
                    {item.label}
                    <ExternalLink className="size-3" />
                  </a>
                ))}
              </div>
            </div>

            <div>
              <div className="text-sm font-semibold text-white">Contact and Feedback</div>
              <div className="mt-4 grid gap-3">
                <a
                  href="mailto:build@defendableos.com"
                  className="inline-flex w-fit items-center gap-2 text-sm text-slate-400 transition hover:text-amber-200"
                >
                  <Mail className="size-4" />
                  build@defendableos.com
                </a>
                <a
                  href="https://x.com/mrdefendable"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex w-fit items-center gap-2 text-sm text-slate-400 transition hover:text-amber-200"
                >
                  <ExternalLink className="size-4" />
                  @mrdefendable
                </a>
                <a
                  href="mailto:build@defendableos.com?subject=DefendableDatasets%20feedback&body=Page%20or%20dataset%3A%0A%0AFeedback%3A%0A"
                  className="inline-flex w-fit items-center gap-2 rounded-md border border-teal-300/25 bg-teal-300/10 px-3 py-2 text-sm font-medium text-teal-100 transition hover:bg-teal-300/15"
                >
                  <MessageSquare className="size-4" />
                  Send feedback
                </a>
              </div>
            </div>
          </div>
          <div className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
            <TipJar compact />
          </div>
          <div className="border-t border-white/10 px-4 py-4 text-center text-xs text-slate-500">
            No proof, no honey. Datasets are the asset.
          </div>
        </footer>
        <HelpAgentWidget />
      </div>
    </PackProvider>
  );
}
