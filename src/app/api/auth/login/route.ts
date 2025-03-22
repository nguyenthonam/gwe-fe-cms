import { NextRequest, NextResponse } from "next/server";
import { generateAccessToken } from "@/utils/hooks/hookToken";

const SECRET_EMAIL_ADMIN = process.env.SECRET_EMAIL_ADMIN || "admin";
const SECRET_PWD_ADMIN = process.env.SECRET_PWD_ADMIN || "123@321!";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    // 🔹 Giả lập kiểm tra user từ database
    // Tìm User với email và password => Thông tin User
    if (email !== SECRET_EMAIL_ADMIN || password !== SECRET_PWD_ADMIN) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }
    const user = { email, phone: "012345678" };

    // 🔹 Tạo token
    const accessToken = generateAccessToken(user);

    // 🔹 Trả về token, lưu refresh token vào cookie
    const response = NextResponse.json({ accessToken, user });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error?.message }, { status: 500 });
  }
}
