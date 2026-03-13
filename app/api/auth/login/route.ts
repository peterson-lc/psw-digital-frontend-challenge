import { NextResponse } from "next/server";
import { buildBackendUrl, backendFetch } from "@/lib/server-api";

export async function POST(request: Request) {
  try {
    const body = await request.text();

    const response = await backendFetch(buildBackendUrl("/api/auth/login"), {
       method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body,
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
      error instanceof Error ? error.message : "Unable to reach authentication service.";

    return NextResponse.json(
      {
        succeeded: false,
        messages: [message],
      },
      { status: 500 },
    );
  }
}