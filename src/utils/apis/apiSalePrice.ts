import { ISalePrice, ISalePriceGroupData } from "@/types/typeSalePrice";
import { EPRODUCT_TYPE, ISearchQuery } from "@/types/typeGlobals";
import AxiosAPI from "@/utils/configs/axiosClient";

/** Create nhiều dòng nhỏ lẻ */
export const createSalePriceApi = async (payload: ISalePrice[]) => {
  try {
    const res = await AxiosAPI.post("/api/sale-prices", payload);
    return res;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

/** Update một dòng nhỏ lẻ */
export const updateSalePriceApi = async (id: string, payload: Partial<ISalePrice>) => {
  try {
    const res = await AxiosAPI.put(`/api/sale-prices/${id}`, payload);
    return res;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

/** Update nhiều dòng trong 1 group */
export const updateGroupSalePriceApi = async (payload: { group: any; datas: ISalePriceGroupData[] }) => {
  try {
    const res = await AxiosAPI.put(`/api/sale-prices/update-group`, payload);
    return res;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

/** Search group bảng giá */
export const searchSalePriceGroupsApi = async ({
  keyword,
  page = 1,
  perPage = 10,
  status = "all",
  partnerId,
  carrierId,
  serviceId,
  productType,
  currency,
}: ISearchQuery & { partnerId?: string; carrierId?: string; serviceId?: string; productType?: EPRODUCT_TYPE; currency?: string }) => {
  try {
    const query: any = { keyword, page, perPage, status };
    if (partnerId) query.partnerId = partnerId;
    if (carrierId) query.carrierId = carrierId;
    if (serviceId) query.serviceId = serviceId;
    if (productType) query.productType = productType;
    if (currency) query.currency = currency;

    const res = await AxiosAPI.get(`/api/sale-prices/search-group`, { params: query });
    return res;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

/** Lock group */
export const lockSalePriceGroupApi = async (payload: { carrierId: string; partnerId: string; serviceId: string; productType: string; currency: string }) => {
  try {
    const res = await AxiosAPI.put(`/api/sale-prices/lock-group`, payload);
    return res;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

/** Unlock group */
export const unlockSalePriceGroupApi = async (payload: { carrierId: string; partnerId: string; serviceId: string; productType: string; currency: string }) => {
  try {
    const res = await AxiosAPI.put(`/api/sale-prices/unlock-group`, payload);
    return res;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

/** Delete group */
export const deleteSalePriceGroupApi = async (payload: { carrierId: string; partnerId: string; serviceId: string; productType: string; currency: string }) => {
  try {
    const res = await AxiosAPI.delete(`/api/sale-prices/delete-group`, { data: payload });
    return res;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

/** Các API thao tác lẻ cho 1 dòng nhỏ */
export const lockSalePriceApi = async (id: string) => {
  try {
    const res = await AxiosAPI.put(`/api/sale-prices/${id}/lock`);
    return res;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const unlockSalePriceApi = async (id: string) => {
  try {
    const res = await AxiosAPI.put(`/api/sale-prices/${id}/unlock`);
    return res;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const deleteSalePriceApi = async (id: string) => {
  try {
    const res = await AxiosAPI.delete(`/api/sale-prices/${id}`);
    return res;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};
