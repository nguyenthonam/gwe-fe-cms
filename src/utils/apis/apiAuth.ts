import { ILoginRequest } from "@/types";
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
