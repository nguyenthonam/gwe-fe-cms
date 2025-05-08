import { ILoginRequest } from "@/types/apis/typeAuthApi";
import AxiosAPI from "@/utils/configs/axiosClient";

export const signInApi = async ({ email, password }: ILoginRequest) => {
  try {
    const res = await AxiosAPI.post("/api/auth/sign-in", { username: email, pwd: password });
    return res;
  } catch (error) {
    console.error("Error login:", error);
  }
  return null;
};

export const signOutApi = async () => {
  try {
    const res = await AxiosAPI.post(
      "/api/auth/sign-out",
      {},
      {
        withCredentials: true, // Gửi cookie HttpOnly kèm request
      }
    );
    return res;
  } catch (error) {
    console.error("Error logout:", error);
    throw error;
  }
};

export const forgotPasswordApi = async ({ email }: { email: string }) => {
  const redirectUrl = process.env.NEXT_PUBLIC_BASE_URL + "/auth/new-password";
  console.log(redirectUrl);
  try {
    const res = await AxiosAPI.post(
      "/api/auth/forgot-password",
      { email: email, redirectUrl: redirectUrl },
      {
        withCredentials: true, // Gửi cookie HttpOnly kèm request
      }
    );
    return res;
  } catch (error) {
    console.error("Error logout:", error);
    throw error;
  }
};
export const resetPasswordApi = async ({ confirmKey, newPassword }: { confirmKey: string; newPassword: string }) => {
  try {
    const res = await AxiosAPI.put(
      "/api/auth/reset-password",
      { confirmKey, newPassword },
      {
        withCredentials: true, // Gửi cookie HttpOnly kèm request
      }
    );
    return res;
  } catch (error) {
    console.error("Error logout:", error);
    throw error;
  }
};

export const verifyTokenApi = async () => {
  try {
    const res = await AxiosAPI.get("/api/auth/verify-token", {
      withCredentials: true, // Gửi cookie HttpOnly kèm request
    });
    return res;
  } catch (error) {
    console.error("Error logout:", error);
    throw error;
  }
};
