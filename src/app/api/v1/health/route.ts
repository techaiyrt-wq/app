export const dynamic = "force-dynamic";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
  "Access-Control-Max-Age": "86400",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

/** Handshake público: qualquer dashboard pode confirmar que o Nexo está vivo. */
export async function GET() {
  return Response.json(
    {
      ok: true,
      service: "nexo",
      version: 1,
      capabilities: ["tasks:read", "tasks:write", "webhook:out"],
      time: new Date().toISOString(),
    },
    { headers: CORS }
  );
}