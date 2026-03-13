import https from "node:https";

const API_BASE_URL = (
  process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? ""
).replace(/\/$/, "");

/**
 * In development, allow self-signed certificates so the Next.js proxy
 * can reach a local backend served over HTTPS with a dev certificate.
 */
const devAgent =
  process.env.NODE_ENV !== "production"
    ? new https.Agent({ rejectUnauthorized: false })
    : undefined;

export function buildBackendUrl(path: string) {
  if (!API_BASE_URL) {
    throw new Error("API_BASE_URL is not configured.");
  }

  return `${API_BASE_URL}${path}`;
}

/**
 * A wrapper around `fetch` that disables TLS verification in development
 * so self-signed backend certificates don't block the proxy.
 */
export async function backendFetch(
  url: string | URL,
  init?: RequestInit,
): Promise<Response> {
  // Node 18+ undici-based fetch accepts a custom dispatcher,
  // but the simplest cross-version approach is the env flag.
  // We set it only for this call's duration.
  if (devAgent) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (init as any) = { ...init, agent: devAgent } as any;
  }

  // For Node 18+ built-in fetch, the `agent` option is not supported.
  // The reliable way is to set NODE_TLS_REJECT_UNAUTHORIZED for the process.
  const prevTls = process.env.NODE_TLS_REJECT_UNAUTHORIZED;
  if (devAgent) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  }

  try {
    return await fetch(url, init);
  } finally {
    if (devAgent) {
      if (prevTls === undefined) {
        delete process.env.NODE_TLS_REJECT_UNAUTHORIZED;
      } else {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = prevTls;
      }
    }
  }
}