import { NextResponse } from "next/server";
import { buildBackendUrl, backendFetch } from "@/lib/server-api";

type RouteContext = {
  params: Promise<{
    year: string;
  }>;
};

export async function GET(request: Request, context: RouteContext) {
  try {
    const { year } = await context.params;
    const requestUrl = new URL(request.url);
    const backendUrl = new URL(buildBackendUrl(`/api/holidays/${year}`));

    requestUrl.searchParams.forEach((value, key) => {
      backendUrl.searchParams.set(key, value);
    });

    const authorization = request.headers.get("authorization");
    const response = await backendFetch(backendUrl.toString(), {
      method: "GET",
      headers: authorization
        ? {
            Authorization: authorization,
          }
        : undefined,
      cache: "no-store",
    });

    const contentType = response.headers.get("content-type") ?? "application/json";
    const payload = await response.text();

    return new Response(payload, {
      status: response.status,
      headers: {
        "Content-Type": contentType,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to reach holidays service.";

    return NextResponse.json(
      {
        succeeded: false,
        messages: [message],
      },
      { status: 500 },
    );
  }
}