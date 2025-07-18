import { IExtraFee, ISearchExtraFeeQuery } from "@/types/typeExtraFee";
import AxiosAPI from "@/utils/configs/axiosClient";

// Get list
export const getExtraFeesApi = async () => {
  try {
    const res = await AxiosAPI.get("/api/extra-fees/list");
    return res;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const getExtraFeesByCarrierServiceApi = async (carrierId: string, serviceId: string) => {
  try {
    const res = await AxiosAPI.get("/api/extra-fees/list", {
      params: {
        carrierId,
        serviceId,
      },
    });
    return res;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

// Search
export const searchExtraFeesApi = async (params: Partial<ISearchExtraFeeQuery>) => {
  try {
    const res = await AxiosAPI.get(`/api/extra-fees/search`, { params });
    return res;
  } catch (error: any) {
    console.error("Error:", error);
    throw new Error(error.response?.data?.message || "Cannot search extra fees");
  }
};

// Create
export const createExtraFeeApi = async (payload: IExtraFee) => {
  try {
    const res = await AxiosAPI.post("/api/extra-fees", payload);
    return res;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

// Update
export const updateExtraFeeApi = async (id: string, payload: Partial<IExtraFee>) => {
  try {
    const res = await AxiosAPI.put(`/api/extra-fees/update/${id}`, payload);
    return res;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

// Lock
export const lockExtraFeeApi = async (id: string) => {
  try {
    const res = await AxiosAPI.put(`/api/extra-fees/lock/${id}`);
    return res;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};
// Unlock
export const unlockExtraFeeApi = async (id: string) => {
  try {
    const res = await AxiosAPI.put(`/api/extra-fees/unlock/${id}`);
    return res;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};
// Delete
export const deleteExtraFeeApi = async (id: string) => {
  try {
    const res = await AxiosAPI.delete(`/api/extra-fees/delete/${id}`);
    return res;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};
