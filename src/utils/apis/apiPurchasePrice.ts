import { IPurchasePrice, IPurchasePriceGroupData } from "@/types/typePurchasePrice";
import { EPRODUCT_TYPE, ISearchQuery } from "@/types/typeGlobals";
import AxiosAPI from "@/utils/configs/axiosClient";

/** Create nhiều dòng nhỏ lẻ (giữ nguyên, dùng khi nhập hàng loạt) */
export const createPurchasePriceApi = async (payload: IPurchasePrice[]) => {
  try {
    const res = await AxiosAPI.post("/api/purchase-prices", payload);
    return res;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

/** Update một dòng nhỏ lẻ */
export const updatePurchasePriceApi = async (id: string, payload: Partial<IPurchasePrice>) => {
  try {
    const res = await AxiosAPI.put(`/api/purchase-prices/${id}`, payload);
    return res;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

/** Update nhiều dòng trong 1 group (không đổi key group) */
export const updateGroupPurchasePriceApi = async (payload: { group: any; datas: IPurchasePriceGroupData[] }) => {
  try {
    const res = await AxiosAPI.put(`/api/purchase-prices/update-group`, payload);
    return res;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

/** Search group bảng giá (dạng group, filter phân trang) */
export const searchPurchasePriceGroupsApi = async ({
  keyword,
  page = 1,
  perPage = 10,
  status = "all",
  supplierId,
  carrierId,
  serviceId,
  productType,
  currency,
}: ISearchQuery & { supplierId?: string; carrierId?: string; serviceId?: string; productType?: EPRODUCT_TYPE; currency?: string }) => {
  try {
    const query = { page, perPage, keyword, status } as any;
    if (supplierId) query.supplierId = supplierId;
    if (carrierId) query.carrierId = carrierId;
    if (serviceId) query.serviceId = serviceId;
    if (productType) query.productType = productType;
    if (currency) query.currency = currency;
    const res = await AxiosAPI.get(`/api/purchase-prices/search-group`, { params: query });
    return res;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

/** Lock group */
export const lockPurchasePriceGroupApi = async (payload: { carrierId: string; supplierId: string; serviceId: string; productType: string; currency: string }) => {
  try {
    const res = await AxiosAPI.put(`/api/purchase-prices/lock-group`, payload);
    return res;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};
/** Unlock group */
export const unlockPurchasePriceGroupApi = async (payload: { carrierId: string; supplierId: string; serviceId: string; productType: string; currency: string }) => {
  try {
    const res = await AxiosAPI.put(`/api/purchase-prices/unlock-group`, payload);
    return res;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

/** Delete group */
export const deletePurchasePriceGroupApi = async (payload: { carrierId: string; supplierId: string; serviceId: string; productType: string; currency: string }) => {
  try {
    // DELETE truyền body cần config Axios: { data: ... }
    const res = await AxiosAPI.delete(`/api/purchase-prices/delete-group`, { data: payload });
    return res;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

/** ---- Các API lẻ cũ cho 1 dòng nhỏ lẻ, giữ lại để hỗ trợ legacy ---- */
/** Lock 1 dòng nhỏ lẻ */
export const lockPurchasePriceApi = async (id: string) => {
  try {
    const res = await AxiosAPI.put(`/api/purchase-prices/${id}/lock`);
    return res;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};
/** Unlock 1 dòng nhỏ lẻ */
export const unlockPurchasePriceApi = async (id: string) => {
  try {
    const res = await AxiosAPI.put(`/api/purchase-prices/${id}/unlock`);
    return res;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};
/** Delete 1 dòng nhỏ lẻ */
export const deletePurchasePriceApi = async (id: string) => {
  try {
    const res = await AxiosAPI.delete(`/api/purchase-prices/${id}`);
    return res;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};
