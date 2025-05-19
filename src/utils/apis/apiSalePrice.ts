import { ISalePrice } from "@/types/typeSalePrice";
import { EPRODUCT_TYPE, ISearchQuery } from "@/types/typeGlobals";
import AxiosAPI from "@/utils/configs/axiosClient";

export const getSalePricesApi = async () => {
  try {
    const res = await AxiosAPI.get("/api/sale-prices");
    return res;
  } catch (error: any) {
    console.error("Error:", error);
    throw new Error(error.response.data.message);
  }
};

export const searchSalePricesApi = async ({
  keyword,
  page = 1,
  perPage = 10,
  status = "all",
  partnerId,
  carrierId,
  serviceId,
  productType,
}: ISearchQuery & { partnerId?: string; carrierId?: string; serviceId?: string; productType?: EPRODUCT_TYPE }) => {
  try {
    const query = {
      page,
      perPage,
      keyword,
      status,
    } as any;
    if (partnerId) query.partnerId = partnerId;
    if (carrierId) query.carrierId = carrierId;
    if (serviceId) query.serviceId = serviceId;
    if (productType) query.productType = productType;

    const res = await AxiosAPI.get(`/api/sale-prices/search`, {
      params: query,
    });

    return res;
  } catch (error: any) {
    console.error("Error:", error);
    throw new Error(error.response.data.message);
  }
};

export const createSalePriceApi = async (payload: ISalePrice) => {
  try {
    const res = await AxiosAPI.post("/api/sale-prices", payload);
    return res;
  } catch (error: any) {
    console.error("Error login:", error);
    throw new Error(error.response.data.message);
  }
};

export const updateSalePriceApi = async (id: string, payload: Partial<ISalePrice>) => {
  try {
    const res = await AxiosAPI.put(`/api/sale-prices/${id}`, payload);
    return res;
  } catch (error: any) {
    console.error("Error login:", error);
    throw new Error(error.response.data.message);
  }
};
export const lockSalePriceApi = async (id: string) => {
  try {
    const res = await AxiosAPI.put(`/api/sale-prices/${id}/lock`);
    return res;
  } catch (error: any) {
    console.error("Error login:", error);
    throw new Error(error.response.data.message);
  }
};
export const unlockSalePriceApi = async (id: string) => {
  try {
    const res = await AxiosAPI.put(`/api/sale-prices/${id}/unlock`);
    return res;
  } catch (error: any) {
    console.error("Error login:", error);
    throw new Error(error.response.data.message);
  }
};
export const deleteSalePriceApi = async (id: string) => {
  try {
    const res = await AxiosAPI.delete(`/api/sale-prices/${id}`);
    return res;
  } catch (error: any) {
    console.error("Error login:", error);
    throw new Error(error.response.data.message);
  }
};
