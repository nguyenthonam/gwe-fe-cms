import { ILoginRequest } from "@/types/apis/typeAuthApi";
import AxiosAPI from "@/utils/configs/axiosClient";

export const loginApi = async ({ email, password }: ILoginRequest) => {
  try {
    const res = await AxiosAPI.post("/api/sign-in", { username: email, pwd: password });
    return res;
  } catch (error) {
    console.error("Error login:", error);
  }
  return null;
};

export const logoutApi = async () => {
  try {
    const res = await AxiosAPI.post(
      "/api/sign-out",
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

export const verifyTokenApi = async () => {
  try {
    const res = await AxiosAPI.get("/api/verify-token", {
      withCredentials: true, // Gửi cookie HttpOnly kèm request
    });
    return res;
  } catch (error) {
    console.error("Error logout:", error);
    throw error;
  }
};
