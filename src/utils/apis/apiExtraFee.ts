import { IExtraFee } from "@/types/typeExtraFee";
import { ECURRENCY, ISearchQuery } from "@/types/typeGlobals";
import AxiosAPI from "@/utils/configs/axiosClient";

export const getExtraFeesApi = async () => {
  try {
    const res = await AxiosAPI.get("/api/extra-fees");
    return res;
  } catch (error: any) {
    console.error("Error:", error);
    throw new Error(error.response.data.message);
  }
};

export const searchExtraFeesApi = async ({ keyword, page = 1, perPage = 10, status = "all", carrierId, serviceId }: ISearchQuery & { carrierId?: string; serviceId?: string }) => {
  try {
    const query = {
      page,
      perPage,
      keyword,
      status,
    } as any;
    if (carrierId) query.carrierId = carrierId;
    if (serviceId) query.serviceId = serviceId;

    const res = await AxiosAPI.get(`/api/extra-fees/search`, {
      params: query,
    });

    return res;
  } catch (error: any) {
    console.error("Error:", error);
    throw new Error(error.response.data.message);
  }
};

export const createExtraFeeApi = async (payload: IExtraFee) => {
  try {
    const res = await AxiosAPI.post("/api/extra-fees", payload);
    return res;
  } catch (error: any) {
    console.error("Error login:", error);
    throw new Error(error.response.data.message);
  }
};

export const updateExtraFeeApi = async (id: string, payload: Partial<IExtraFee>) => {
  try {
    const res = await AxiosAPI.put(`/api/extra-fees/${id}`, payload);
    return res;
  } catch (error: any) {
    console.error("Error login:", error);
    throw new Error(error.response.data.message);
  }
};
export const lockExtraFeeApi = async (id: string) => {
  try {
    const res = await AxiosAPI.put(`/api/extra-fees/${id}/lock`);
    return res;
  } catch (error: any) {
    console.error("Error login:", error);
    throw new Error(error.response.data.message);
  }
};
export const unlockExtraFeeApi = async (id: string) => {
  try {
    const res = await AxiosAPI.put(`/api/extra-fees/${id}/unlock`);
    return res;
  } catch (error: any) {
    console.error("Error login:", error);
    throw new Error(error.response.data.message);
  }
};
export const deleteExtraFeeApi = async (id: string) => {
  try {
    const res = await AxiosAPI.delete(`/api/extra-fees/${id}`);
    return res;
  } catch (error: any) {
    console.error("Error login:", error);
    throw new Error(error.response.data.message);
  }
};
