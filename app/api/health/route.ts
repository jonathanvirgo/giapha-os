import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const startedAt = Date.now();

  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    // Lightweight ping: query one row from a core table.
    const { error } = await supabase.from("profiles").select("id").limit(1);

    if (error) {
      return NextResponse.json(
        {
          status: "error",
          database: "disconnected",
          message: error.message,
          latencyMs: Date.now() - startedAt,
          timestamp: new Date().toISOString(),
        },
        { status: 503 },
      );
    }

    return NextResponse.json(
      {
        status: "ok",
        database: "connected",
        latencyMs: Date.now() - startedAt,
        timestamp: new Date().toISOString(),
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: "error",
        database: "unknown",
        message: error instanceof Error ? error.message : "Unexpected error",
        latencyMs: Date.now() - startedAt,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
