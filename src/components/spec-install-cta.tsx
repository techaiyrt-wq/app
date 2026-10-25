"use client";

import Link from "next/link";
import { Smartphone } from "lucide-react";
import { useInstallState } from "@/components/app/use-installed";

/**
 * CTA de instalação na página de especificação.
 * Desaparece quando a app já está instalada no ecrã principal.
 */
export function SpecInstallCta() {
  const { installed, ready } = useInstallState();
  if (!ready || installed) return null;

  return (
    <Link
      href="/?tab=install"
      className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-5 py-3 font-display text-sm font-semibold text-white/90 transition-colors hover:bg-white/10"
    >
      <Smartphone className="h-4 w-4 text-teal-soft" /> Instalar no iPhone
    </Link>
  );
}
