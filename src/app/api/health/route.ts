import { NextResponse } from "next/server";
import { db } from "@/server/db";

export const dynamic = "force-dynamic";

/** Liveness + database check. Returns counts only – never connection details. */
export async function GET() {
  try {
    const [workshops, services] = await Promise.all([db.workshop.count(), db.standardService.count()]);
    return NextResponse.json({ ok: true, db: "up", workshops, services });
  } catch (err) {
    console.error("[health] database check failed", err);
    const message = err instanceof Error ? err.message.split("\n")[0]?.slice(0, 200) : "unknown";
    return NextResponse.json({ ok: false, db: "down", error: message }, { status: 503 });
  }
}
