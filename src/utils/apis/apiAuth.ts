import { ILoginRequest } from "@/types/apis/typeAuthApi";
import AxiosAPI from "@/utils/configs/axiosClient";

export const signInApi = async ({ email, password }: ILoginRequest) => {
  const res = await AxiosAPI.post("/api/auth/sign-in", { username: email, pwd: password });
  return res;
};

export const signOutApi = async () => {
  const res = await AxiosAPI.post("/api/auth/sign-out", {}, { withCredentials: true });
  return res;
};

export const forgotPasswordApi = async ({ email }: { email: string }) => {
  const redirectUrl = process.env.NEXT_PUBLIC_BASE_URL + "/auth/new-password";
  const res = await AxiosAPI.post("/api/auth/forgot-password", { email, redirectUrl }, { withCredentials: true });
  return res;
};

export const resetPasswordApi = async ({ confirmKey, newPassword }: { confirmKey: string; newPassword: string }) => {
  const res = await AxiosAPI.put("/api/auth/reset-password", { confirmKey, newPassword }, { withCredentials: true });
  return res;
};

export const verifyTokenApi = async () => {
  const res = await AxiosAPI.get("/api/auth/verify-token", { withCredentials: true });
  return res;
};
