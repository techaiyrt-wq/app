"use client";

import { useEffect } from "react";
import { X, Smartphone } from "lucide-react";
import { GuidePanel } from "./guide-panel";
import { useInstallState } from "./use-installed";

export function InstallModal({
  onClose,
  productionUrl = "",
  onSaveProductionUrl,
  savingProductionUrl = false,
}: {
  onClose: () => void;
  productionUrl?: string;
  onSaveProductionUrl?: (url: string) => Promise<void>;
  savingProductionUrl?: boolean;
}) {
  const { installed, ready } = useInstallState();
  const isInstalled = ready && installed;
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[90] flex items-end justify-center sm:items-center sm:p-4">
      <button
        aria-label="Fechar"
        onClick={onClose}
        className="sheet-backdrop absolute inset-0"
      />
      <div className="sheet-panel safe-bottom relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-[1.6rem] bg-paper shadow-2xl sm:max-w-2xl sm:rounded-[1.6rem]">
        {/* Header do modal */}
        <div className="flex items-center justify-between border-b border-line bg-white px-5 py-3.5">
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-teal-soft text-teal-deep">
              <Smartphone className="h-4 w-4" />
            </span>
            <div>
              <h2 className="font-display text-[15px] font-bold text-ink">
                {isInstalled ? "App instalada" : "Instalar no iPhone"}
              </h2>
              <p className="text-[11px] text-ink-faint">
                {isInstalled
                  ? "Partilha o link ou o QR para instalar noutro dispositivo"
                  : "Funciona em ecrã inteiro como um app nativo · Gratuito (PWA)"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="press grid h-8 w-8 place-items-center rounded-lg bg-paper text-ink-soft hover:bg-line"
            aria-label="Fechar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Conteúdo com scroll */}
        <div className="scroll-slim flex-1 overflow-y-auto p-4 sm:p-6">
          <GuidePanel
            isModal={true}
            onClose={onClose}
            productionUrl={productionUrl}
            onSaveProductionUrl={onSaveProductionUrl}
            savingProductionUrl={savingProductionUrl}
          />
        </div>
      </div>
    </div>
  );
}
