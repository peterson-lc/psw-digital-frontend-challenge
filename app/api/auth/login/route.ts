import { buildBackendUrl, proxyToBackend } from "@/lib/server-api";

export async function POST(request: Request) {
  const body = await request.text();

  return proxyToBackend(
    buildBackendUrl("/api/auth/login"),
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    },
    "Unable to reach authentication service.",
  );
}