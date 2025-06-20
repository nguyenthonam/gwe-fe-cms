import { IVolWeightRate } from "@/types/typeVolWeightRate";
import { ISearchQuery } from "@/types/typeGlobals";
import AxiosAPI from "@/utils/configs/axiosClient";

export const getVolWeightRatesApi = async () => {
  try {
    const res = await AxiosAPI.get("/api/vol-weight-rates");
    return res;
  } catch (error: any) {
    console.error("Error:", error);
    throw new Error(error.response.data.message);
  }
};

export const searchVolWeightRatesApi = async ({ keyword, page = 1, perPage = 10, status = "all", carrierId, supplierId }: ISearchQuery & { carrierId?: string; supplierId?: string }) => {
  try {
    const query = {
      page,
      perPage,
      keyword,
      status,
    } as any;
    if (supplierId) query.supplierId = supplierId;
    if (carrierId) query.carrierId = carrierId;

    const res = await AxiosAPI.get(`/api/vol-weight-rates/search`, {
      params: query,
    });

    return res;
  } catch (error: any) {
    console.error("Error:", error);
    throw new Error(error.response.data.message);
  }
};

export const createVolWeightRateApi = async (payload: IVolWeightRate) => {
  try {
    const res = await AxiosAPI.post("/api/vol-weight-rates", payload);
    return res;
  } catch (error: any) {
    console.error("Error login:", error);
    throw new Error(error.response.data.message);
  }
};

export const updateVolWeightRateApi = async (id: string, company: IVolWeightRate) => {
  try {
    const res = await AxiosAPI.put(`/api/vol-weight-rates/${id}`, company);
    return res;
  } catch (error: any) {
    console.error("Error login:", error);
    throw new Error(error.response.data.message);
  }
};
export const lockVolWeightRateApi = async (id: string) => {
  try {
    const res = await AxiosAPI.put(`/api/vol-weight-rates/${id}/lock`);
    return res;
  } catch (error: any) {
    console.error("Error login:", error);
    throw new Error(error.response.data.message);
  }
};
export const unlockVolWeightRateApi = async (id: string) => {
  try {
    const res = await AxiosAPI.put(`/api/vol-weight-rates/${id}/unlock`);
    return res;
  } catch (error: any) {
    console.error("Error login:", error);
    throw new Error(error.response.data.message);
  }
};
export const deleteVolWeightRateApi = async (id: string) => {
  try {
    const res = await AxiosAPI.delete(`/api/vol-weight-rates/${id}`);
    return res;
  } catch (error: any) {
    console.error("Error login:", error);
    throw new Error(error.response.data.message);
  }
};
