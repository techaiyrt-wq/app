"use client";

import Link from "next/link";
import { Smartphone } from "lucide-react";
import { useInstallState } from "@/components/app/use-installed";

/**
 * Link de instalação na navegação. Desaparece automaticamente quando a app
 * já está instalada no ecrã principal do iPhone (ou como PWA noutro dispositivo).
 */
export function InstallNavLink({ active }: { active: boolean }) {
  const { installed, ready } = useInstallState();
  // só aparece depois da deteção e enquanto a app não estiver instalada
  if (!ready || installed) return null;

  return (
    <Link
      href="/?tab=install"
      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
        active ? "bg-ink text-white" : "text-ink-soft hover:bg-line/60"
      }`}
    >
      <Smartphone className="h-4 w-4" />
      <span className="hidden sm:inline">Instalar</span>
    </Link>
  );
}
