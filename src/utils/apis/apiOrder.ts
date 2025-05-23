import { ISearchQuery } from "@/types/typeGlobals";
import { ICreateOrderRequest, IOrder } from "@/types/typeOrder";
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

export const searchOrdersApi = async ({
  keyword,
  page = 1,
  perPage = 10,
  status = "all",
  carrierId,
  serviceId,
  supplierId,
  partnerId,
}: ISearchQuery & { carrierId?: string; serviceId?: string; supplierId?: string; partnerId?: string }) => {
  try {
    const query = {
      page,
      perPage,
      keyword,
      status,
    } as any;
    if (carrierId) query.carrierId = carrierId;
    if (serviceId) query.serviceId = serviceId;
    if (supplierId) query.supplierId = supplierId;
    if (partnerId) query.partnerId = partnerId;

    const res = await AxiosAPI.get(`/api/orders/search`, {
      params: query,
    });

    return res;
  } catch (error: any) {
    console.error("Error:", error);
    throw new Error(error.response.data.message);
  }
};

export const createOrderApi = async (payload: ICreateOrderRequest) => {
  try {
    const res = await AxiosAPI.post("/api/orders", payload);
    return res;
  } catch (error: any) {
    console.error("Error login:", error);
    throw new Error(error.response.data.message);
  }
};

export const updateOrderApi = async (id: string, payload: IOrder) => {
  try {
    const res = await AxiosAPI.put(`/api/orders/${id}`, payload);
    return res;
  } catch (error: any) {
    console.error("Error login:", error);
    throw new Error(error.response.data.message);
  }
};

export const calculateOrderTotalApi = async (id: string) => {
  try {
    const res = await AxiosAPI.get(`/api/orders/${id}/calculate-total-price`);
    return res;
  } catch (error: any) {
    console.error("Error login:", error);
    throw new Error(error.response.data.message);
  }
};

export const lockOrderApi = async (id: string) => {
  try {
    const res = await AxiosAPI.put(`/api/orders/${id}/lock`);
    return res;
  } catch (error: any) {
    console.error("Error login:", error);
    throw new Error(error.response.data.message);
  }
};
export const unlockOrderApi = async (id: string) => {
  try {
    const res = await AxiosAPI.put(`/api/orders/${id}/unlock`);
    return res;
  } catch (error: any) {
    console.error("Error login:", error);
    throw new Error(error.response.data.message);
  }
};
export const deleteOrderApi = async (id: string) => {
  try {
    const res = await AxiosAPI.delete(`/api/orders/${id}`);
    return res;
  } catch (error: any) {
    console.error("Error login:", error);
    throw new Error(error.response.data.message);
  }
};
