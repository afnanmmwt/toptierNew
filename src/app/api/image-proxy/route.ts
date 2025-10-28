// app/api/image-proxy/route.ts
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) return new Response("Missing url", { status: 400 });

  try {
    const upstream = await fetch(url, { cache: "no-store" });
    if (!upstream.ok) return new Response(`Upstream ${upstream.status}`, { status: 502 });

    const type = upstream.headers.get("content-type") ?? "image/jpeg";
    const buf = await upstream.arrayBuffer();

    return new Response(buf, {
      status: 200,
      headers: {
        "Content-Type": type,
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch {
    return new Response("Proxy error", { status: 500 });
  }
}