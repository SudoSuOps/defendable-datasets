import Link from "next/link";
import { clsx } from "clsx";

export function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-md border border-white/10 bg-white/[.06] px-2 py-1 text-xs font-medium text-slate-200",
        className,
      )}
    >
      {children}
    </span>
  );
}

export function Panel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <section className={clsx("border border-white/10 bg-white/[.045] p-5 shadow-2xl shadow-black/20", className)}>{children}</section>;
}

export function ButtonLink({
  href,
  children,
  variant = "primary",
}: {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary";
}) {
  return (
    <Link
      href={href}
      className={clsx(
        "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold transition",
        variant === "primary"
          ? "bg-amber-300 text-slate-950 hover:bg-amber-200"
          : "border border-white/15 bg-white/[.06] text-white hover:bg-white/10",
      )}
    >
      {children}
    </Link>
  );
}

export function statusClass(status: string) {
  if (status === "verified") return "border-emerald-300/30 bg-emerald-300/10 text-emerald-100";
  if (status === "draft") return "border-amber-300/30 bg-amber-300/10 text-amber-100";
  if (status === "deprecated") return "border-red-300/30 bg-red-300/10 text-red-100";
  return "border-slate-300/30 bg-slate-300/10 text-slate-100";
}
