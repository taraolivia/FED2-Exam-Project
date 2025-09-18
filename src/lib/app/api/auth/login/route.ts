import { NextResponse } from "next/server";
import { auth as ep } from "@/lib/api/endpoints";
import { fetchJSON } from "@/lib/api/http";

export async function POST(req: Request) {
  const body = await req.json(); // { email, password }
  
  // Validate required fields
  if (!body.email || !body.password) {
    return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
  }
  
  try {
    // Hit Noroff login directly (no API key needed for auth endpoints)
    const json = await fetchJSON<{ data: { accessToken: string } }>(ep.login(), {
      method: "POST",
      body: JSON.stringify(body),
    });

    const accessToken = json?.data?.accessToken;
    const res = NextResponse.json(json);

    // Store token in an httpOnly cookie for later protected calls
    if (accessToken) {
      res.cookies.set("accessToken", accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        // expires left out so it becomes a session cookie; add maxAge if preferred
      });
    }
    return res;
  } catch (err: any) {
    const status = err?.status ?? 401;
    const message = err?.message ?? "Login failed";
    return NextResponse.json({ error: message }, { status });
  }
}
