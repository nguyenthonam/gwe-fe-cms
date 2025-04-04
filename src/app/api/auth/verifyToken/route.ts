import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/utils/hooks/hookToken";

export async function GET(req: NextRequest) {
  const { token } = await req.json();

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const decoded = verifyAccessToken(token);
  if (!decoded) {
    return NextResponse.json({ error: "Invalid token" }, { status: 403 });
  }

  return NextResponse.json({ message: "Token is valid", user: decoded });
}
