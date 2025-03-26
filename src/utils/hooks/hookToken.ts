import jwt from "jsonwebtoken";

const SECRET_TOKEN_KEY = process.env.SECRET_TOKEN_KEY || "admin";
// const SECRET_REFRESH_TOKEN = process.env.SECRET_REFRESH_TOKEN || "admin_refresh";

/**
 * Tạo Access Token (Hết hạn sau 15 phút)
 */
export const generateAccessToken = (payload: any) => {
  return jwt.sign(payload, SECRET_TOKEN_KEY, { algorithm: "HS256", expiresIn: "1h" });
};

/**
 * Xác minh Access Token
 */
export const verifyAccessToken = (token: string) => {
  try {
    return jwt.verify(token, SECRET_TOKEN_KEY);
  } catch (error: any) {
    return error;
  }
};
