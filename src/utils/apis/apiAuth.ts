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
    const res = await AxiosAPI.post("/api/sign-out");
    return res;
  } catch (error) {
    console.error("Error logout:", error);
    throw error;
  }
};
