import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    
    console.log("=== DEBUG SESSION ===");
    console.log(JSON.stringify(session, null, 2));

    return NextResponse.json({ session });
  } catch (err: any) {
    console.error("Debug error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
