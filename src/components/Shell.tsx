import Link from "next/link";
import { Database, GitBranch, Package, ScrollText } from "lucide-react";
import { PackProvider } from "./PackProvider";

const nav = [
  { href: "/graph", label: "Graph", icon: GitBranch },
  { href: "/registry", label: "Registry", icon: Database },
  { href: "/pack", label: "Pack", icon: Package },
  { href: "/docs", label: "Docs", icon: ScrollText },
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
              <div className="grid size-9 place-items-center rounded-md border border-amber-300/30 bg-amber-300/10 text-amber-200">
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
      </div>
    </PackProvider>
  );
}
