import { IUpdatePasswordRequest, IUpdateProfileRequest } from "@/types/apis/typeProfileApi";
import AxiosAPI from "@/utils/configs/axiosClient";

export const getProfileApi = async () => {
  try {
    const res = await AxiosAPI.get("/api/profile");
    return res;
  } catch (error: any) {
    console.error("Error login:", error);
    throw new Error(error.response.data.message);
  }
};

export const updateProfileApi = async (payload: IUpdateProfileRequest) => {
  try {
    const res = await AxiosAPI.put("/api/profile", payload);
    return res;
  } catch (error: any) {
    console.error("Error login:", error);
    throw new Error(error.response.data.message);
  }
};

export const updatePasswordProfileApi = async (payload: IUpdatePasswordRequest) => {
  try {
    const res = await AxiosAPI.put("/api/profile/update-password", payload);
    return res;
  } catch (error: any) {
    console.error("Error login:", error);
    throw new Error(error.response.data.message);
  }
};
