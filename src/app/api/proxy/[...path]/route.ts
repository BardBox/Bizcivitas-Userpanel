// Proxy route to forward API requests to the backend, avoiding browser CORS issues
// This route only forwards to the configured BACKEND base URL from env

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ path: string[] }> };

const getBackendBase = () => {
  // Prefer server-side env; fallback to public var
  const base = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
  // Final fallback to production backend if not set
  return (base || "https://backend.bizcivitas.com/api/v1").replace(/\/$/, "");
};

const buildTargetUrl = (req: Request, pathParts: string[]) => {
  const base = getBackendBase();
  const url = new URL(req.url);
  const search = url.search || "";
  const path = pathParts.join("/");
  return `${base}/${path}${search}`;
};

const buildForwardHeaders = (req: Request) => {
  const headers = new Headers();
  const incoming = req.headers;

  // Whitelist specific headers to forward
  const allowedHeaderNames = ["content-type", "authorization", "cookie"];

  for (const name of allowedHeaderNames) {
    const value = incoming.get(name);
    if (value) headers.set(name, value);
  }

  // Helpful hint header for backend visibility
  headers.set("X-Requested-With", "XMLHttpRequest");
  return headers;
};

async function forward(req: Request, paramsPromise: Params) {
  const { path } = await paramsPromise.params;
  const method = req.method.toUpperCase();
  const targetUrl = buildTargetUrl(req, path || []);

  // Only allow relative path segments (avoid open proxy)
  if ((path || []).some((p) => p === "..")) {
    return new Response(
      JSON.stringify({ success: false, message: "Invalid path" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const headers = buildForwardHeaders(req);

  // Pass through body for methods that support it
  let body: BodyInit | undefined;
  if (!["GET", "HEAD"].includes(method)) {
    // If content-type is JSON, pass text; otherwise pass raw stream
    const ct = headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      body = await req.text();
    } else {
      // Convert to ArrayBuffer to satisfy BodyInit and avoid null
      const ab = await req.arrayBuffer();
      body = ab;
    }
  }

  try {
    const resp = await fetch(targetUrl, {
      method,
      headers,
      body,
      redirect: "manual",
    });

    // Build response headers - pass through content-type only
    const resHeaders = new Headers();
    const contentType = resp.headers.get("content-type");
    if (contentType) resHeaders.set("content-type", contentType);

    return new Response(resp.body, {
      status: resp.status,
      headers: resHeaders,
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        success: false,
        message: "Proxy error",
        error: String(error),
      }),
      { status: 502, headers: { "Content-Type": "application/json" } }
    );
  }
}

export async function GET(req: Request, ctx: Params) {
  return forward(req, ctx);
}
export async function POST(req: Request, ctx: Params) {
  return forward(req, ctx);
}
export async function PUT(req: Request, ctx: Params) {
  return forward(req, ctx);
}
export async function PATCH(req: Request, ctx: Params) {
  return forward(req, ctx);
}
export async function DELETE(req: Request, ctx: Params) {
  return forward(req, ctx);
}
export async function OPTIONS(req: Request, ctx: Params) {
  return forward(req, ctx);
}
