import QRCode from "qrcode";

export const dynamic = "force-dynamic";

/**
 * Gera um QR code como SVG (com largura/altura explícitas).
 * Correr no servidor evita dependências de canvas e garante dimensões válidas.
 * Ex.: /api/qr?data=https%3A%2F%2Fexemplo.com
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const data = (searchParams.get("data") ?? "").slice(0, 1024);
  const requested = Number(searchParams.get("size") ?? "240");
  const size = Number.isFinite(requested) ? Math.min(512, Math.max(120, requested)) : 240;

  if (!data) {
    return new Response("Parâmetro 'data' em falta.", { status: 400 });
  }

  try {
    const svg = await QRCode.toString(data, {
      type: "svg",
      margin: 1,
      width: size,
      errorCorrectionLevel: "M",
      color: { dark: "#16191c", light: "#ffffff" },
    });

    return new Response(svg, {
      headers: {
        "Content-Type": "image/svg+xml; charset=utf-8",
        "Cache-Control": "public, max-age=86400",
      },
    });
  } catch {
    return new Response("Não foi possível gerar o QR code.", { status: 500 });
  }
}
