"use client";

import { useEffect, useState } from "react";

type NavigatorWithStandalone = Navigator & { standalone?: boolean };

/**
 * Deteção real de app instalada no ecrã principal (iOS) ou instalada
 * como PWA (Android/Chrome/Edge/desktop).
 */
function detectInstalled(): boolean {
  if (typeof window === "undefined") return false;

  const nav = window.navigator as NavigatorWithStandalone;

  // iOS Safari: true quando aberta pelo ícone do ecrã principal
  if (nav.standalone === true) return true;

  // Android / desktop: modo standalone ou fullscreen declarado no manifest
  try {
    if (window.matchMedia("(display-mode: standalone)").matches) return true;
    if (window.matchMedia("(display-mode: fullscreen)").matches) return true;
  } catch {
    /* browsers antigos sem matchMedia */
  }

  return false;
}

export interface InstallState {
  /** true quando a app corre instalada (ecrã principal / PWA) */
  installed: boolean;
  /** true depois da primeira deteção no cliente — evita mostrar o estado errado */
  ready: boolean;
}

/** Estado de instalação + disponibilidade da deteção. */
export function useInstallState(): InstallState {
  const [installed, setInstalled] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const update = () => setInstalled(detectInstalled());
    update();
    setReady(true);

    let mq: MediaQueryList | null = null;
    try {
      mq = window.matchMedia("(display-mode: standalone)");
      mq.addEventListener?.("change", update);
    } catch {
      /* sem suporte */
    }
    window.addEventListener("appinstalled", update);
    // No iOS o estado só é reavaliado quando a página volta a ter foco
    window.addEventListener("focus", update);

    return () => {
      mq?.removeEventListener?.("change", update);
      window.removeEventListener("appinstalled", update);
      window.removeEventListener("focus", update);
    };
  }, []);

  return { installed, ready };
}

/** Atalho booleano para quem só precisa do estado instalado. */
export function useInstalled(): boolean {
  return useInstallState().installed;
}

/**
 * Deve mostrar-se um apelo à instalação?
 * Só depois da deteção estar pronta e se a app ainda não estiver instalada.
 */
export function useShowInstallCta(): boolean {
  const { installed, ready } = useInstallState();
  return ready && !installed;
}
