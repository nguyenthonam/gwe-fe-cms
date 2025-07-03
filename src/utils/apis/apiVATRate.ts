import { IVATRate } from "@/types/typeVATRate";
import { ISearchQuery } from "@/types/typeGlobals";
import AxiosAPI from "@/utils/configs/axiosClient";

export const getVATRatesApi = async () => {
  try {
    const res = await AxiosAPI.get("/api/vat-rates");
    return res;
  } catch (error: any) {
    console.error("Error:", error);
    throw new Error(error.response.data.message);
  }
};

export const searchVATRatesApi = async ({
  keyword,
  page = 1,
  perPage = 10,
  status = "all",
  carrierId,
  serviceId,
  supplierId,
}: ISearchQuery & { carrierId?: string; serviceId?: string; supplierId?: string }) => {
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

    const res = await AxiosAPI.get(`/api/vat-rates/search`, {
      params: query,
    });

    return res;
  } catch (error: any) {
    console.error("Error:", error);
    throw new Error(error.response.data.message);
  }
};

export const createVATRateApi = async (payload: IVATRate) => {
  try {
    const res = await AxiosAPI.post("/api/vat-rates", payload);
    return res;
  } catch (error: any) {
    console.error("Error login:", error);
    throw new Error(error.response.data.message);
  }
};

export const updateVATRateApi = async (id: string, payload: Partial<IVATRate>) => {
  try {
    const res = await AxiosAPI.put(`/api/vat-rates/${id}`, payload);
    return res;
  } catch (error: any) {
    console.error("Error login:", error);
    throw new Error(error.response.data.message);
  }
};
export const lockVATRateApi = async (id: string) => {
  try {
    const res = await AxiosAPI.put(`/api/vat-rates/${id}/lock`);
    return res;
  } catch (error: any) {
    console.error("Error login:", error);
    throw new Error(error.response.data.message);
  }
};
export const unlockVATRateApi = async (id: string) => {
  try {
    const res = await AxiosAPI.put(`/api/vat-rates/${id}/unlock`);
    return res;
  } catch (error: any) {
    console.error("Error login:", error);
    throw new Error(error.response.data.message);
  }
};
export const deleteVATRateApi = async (id: string) => {
  try {
    const res = await AxiosAPI.delete(`/api/vat-rates/${id}`);
    return res;
  } catch (error: any) {
    console.error("Error login:", error);
    throw new Error(error.response.data.message);
  }
};
