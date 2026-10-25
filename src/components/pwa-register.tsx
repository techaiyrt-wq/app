"use client";

import { useEffect } from "react";

/** Regista o service worker (necessário para a instalação como app em Android/desktop). */
export function PwaRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;
    if (window.location.protocol !== "https:" && window.location.hostname !== "localhost")
      return;
    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* silencioso: a app funciona mesmo sem service worker */
      });
    };
    if (document.readyState === "complete") register();
    else window.addEventListener("load", register, { once: true });
  }, []);

  return null;
}