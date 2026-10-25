"use client";

import { useEffect, useState } from "react";
import { QrCode } from "lucide-react";

/**
 * Mostra o QR code do URL atual.
 * O SVG é gerado no servidor (/api/qr) com largura/altura explícitas e
 * apresentado como <img> de tamanho fixo — nunca colapsa no layout.
 */
export function QrCodeView({
  url,
  size = 168,
}: {
  url: string;
  size?: number;
}) {
  const [src, setSrc] = useState("");
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!url) {
      setSrc("");
      return;
    }
    setFailed(false);
    setSrc(`/api/qr?size=${size * 2}&data=${encodeURIComponent(url)}`);
  }, [url, size]);

  if (!src || failed) {
    return (
      <div
        className="flex shrink-0 flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-line bg-white text-ink-faint"
        style={{ width: size, height: size }}
      >
        <QrCode className="h-6 w-6" />
        <span className="px-2 text-center text-[10px] leading-tight">
          {failed ? "Abre o link abaixo no iPhone" : "A gerar QR…"}
        </span>
      </div>
    );
  }

  return (
    <div
      className="shrink-0 overflow-hidden rounded-lg border border-line bg-white p-1.5 shadow-sm"
      style={{ width: size + 12, height: size + 12 }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        key={src}
        src={src}
        alt={`Código QR para abrir ${url} no iPhone`}
        width={size}
        height={size}
        onError={() => setFailed(true)}
        className="block h-full w-full"
        style={{ imageRendering: "pixelated" }}
      />
    </div>
  );
}
