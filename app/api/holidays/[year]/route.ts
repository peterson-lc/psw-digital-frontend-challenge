import { buildBackendUrl, proxyToBackend } from "@/lib/server-api";

type RouteContext = {
  params: Promise<{
    year: string;
  }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { year } = await context.params;
  const requestUrl = new URL(request.url);
  const backendUrl = new URL(buildBackendUrl(`/api/holidays/${year}`));

  requestUrl.searchParams.forEach((value, key) => {
    backendUrl.searchParams.set(key, value);
  });

  const authorization = request.headers.get("authorization");

  return proxyToBackend(
    backendUrl.toString(),
    {
      method: "GET",
      headers: authorization ? { Authorization: authorization } : undefined,
    },
    "Unable to reach holidays service.",
  );
}