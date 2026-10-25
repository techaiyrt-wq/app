import Link from "next/link";
import { Hexagon, LayoutDashboard, FileText } from "lucide-react";
import { InstallNavLink } from "@/components/site-nav-install";

export function SiteNav({ active }: { active: "spec" | "app" | "install" }) {
  const items = [
    { id: "app" as const, href: "/", label: "App", icon: LayoutDashboard },
    { id: "spec" as const, href: "/spec", label: "Especificação", icon: FileText },
  ];
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-paper/90 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="relative grid h-8 w-8 place-items-center rounded-lg bg-ink text-teal-soft">
            <Hexagon className="h-4 w-4" strokeWidth={2.2} />
            <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-teal pulse-dot" />
          </span>
          <span className="font-display text-lg font-bold tracking-tight">Nexo</span>
          <span className="hidden rounded-full border border-line bg-card px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-ink-faint sm:inline">
            v1.1
          </span>
        </Link>
        <nav className="flex items-center gap-1.5">
          {items.map((i) => (
            <Link
              key={i.id}
              href={i.href}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                active === i.id
                  ? "bg-ink text-white"
                  : "text-ink-soft hover:bg-line/60"
              }`}
            >
              <i.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{i.label}</span>
            </Link>
          ))}
          {/* some quando a app já está instalada */}
          <InstallNavLink active={active === "install"} />
        </nav>
      </div>
    </header>
  );
}
