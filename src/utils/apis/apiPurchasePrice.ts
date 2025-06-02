import { IPurchasePrice } from "@/types/typePurchasePrice";
import { EPRODUCT_TYPE, ISearchQuery } from "@/types/typeGlobals";
import AxiosAPI from "@/utils/configs/axiosClient";

export const getPurchasePricesApi = async () => {
  try {
    const res = await AxiosAPI.get("/api/purchase-prices");
    return res;
  } catch (error: any) {
    console.error("Error:", error);
    throw new Error(error.response.data.message);
  }
};

export const searchPurchasePricesApi = async ({
  keyword,
  page = 1,
  perPage = 10,
  status = "all",
  supplierId,
  carrierId,
  serviceId,
  productType,
}: ISearchQuery & { supplierId?: string; carrierId?: string; serviceId?: string; productType?: EPRODUCT_TYPE }) => {
  try {
    const query = {
      page,
      perPage,
      keyword,
      status,
    } as any;
    if (supplierId) query.supplierId = supplierId;
    if (carrierId) query.carrierId = carrierId;
    if (serviceId) query.serviceId = serviceId;
    if (productType) query.productType = productType;

    const res = await AxiosAPI.get(`/api/purchase-prices/search`, {
      params: query,
    });

    return res;
  } catch (error: any) {
    console.error("Error:", error);
    throw new Error(error.response.data.message);
  }
};

export const createPurchasePriceApi = async (payload: IPurchasePrice) => {
  try {
    const res = await AxiosAPI.post("/api/purchase-prices", payload);
    return res;
  } catch (error: any) {
    console.error("Error login:", error);
    throw new Error(error.response.data.message);
  }
};

export const updatePurchasePriceApi = async (id: string, payload: Partial<IPurchasePrice>) => {
  try {
    const res = await AxiosAPI.put(`/api/purchase-prices/${id}`, payload);
    return res;
  } catch (error: any) {
    console.error("Error login:", error);
    throw new Error(error.response.data.message);
  }
};
export const lockPurchasePriceApi = async (id: string) => {
  try {
    const res = await AxiosAPI.put(`/api/purchase-prices/${id}/lock`);
    return res;
  } catch (error: any) {
    console.error("Error login:", error);
    throw new Error(error.response.data.message);
  }
};
export const unlockPurchasePriceApi = async (id: string) => {
  try {
    const res = await AxiosAPI.put(`/api/purchase-prices/${id}/unlock`);
    return res;
  } catch (error: any) {
    console.error("Error login:", error);
    throw new Error(error.response.data.message);
  }
};
export const deletePurchasePriceApi = async (id: string) => {
  try {
    const res = await AxiosAPI.delete(`/api/purchase-prices/${id}`);
    return res;
  } catch (error: any) {
    console.error("Error login:", error);
    throw new Error(error.response.data.message);
  }
};
