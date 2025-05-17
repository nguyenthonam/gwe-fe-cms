import { ICreateOrderRequest, IUpdateOrderRequest } from "@/types/apis/typeOrder.Api";
import { IUpdatePasswordRequest } from "@/types/apis/typeProfileApi";
import AxiosAPI from "@/utils/configs/axiosClient";

export const getOrderApi = async () => {
  try {
    const res = await AxiosAPI.get("/api/orders");
    return res;
  } catch (error: any) {
    console.error("Error:", error);
    throw new Error(error.response.data.message);
  }
};

export const createUserApi = async (payload: ICreateOrderRequest) => {
  try {
    const res = await AxiosAPI.post("/api/orders", payload);
    return res;
  } catch (error: any) {
    console.error("Error login:", error);
    throw new Error(error.response.data.message);
  }
};

export const updateOrdersApi = async (payload: IUpdateOrderRequest) => {
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
