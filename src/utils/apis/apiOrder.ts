import { ICreateOrderRequest, IFilterOrder, IOrder } from "@/types/typeOrder";
import AxiosAPI from "@/utils/configs/axiosClient";

/** Create 1 order */
export const createOrderApi = async (payload: ICreateOrderRequest) => {
  const res = await AxiosAPI.post("/api/orders", payload);
  return res.data;
};

/** Update NHIỀU đơn (bulk) */
export const bulkUpdateOrdersApi = async (ids: string[], update: Partial<IOrder>) => {
  const res = await AxiosAPI.put("/api/orders/update", { ids, update });
  return res.data;
};

/** Update 1 đơn theo id */
export const updateOrderApi = async (id: string, payload: Partial<IOrder>) => {
  const res = await AxiosAPI.put(`/api/orders/${id}`, payload);
  return res.data;
};

/** Search (filter nâng cao) — nhận IFilterOrder
 *  - Để lấy toàn bộ dữ liệu cho export: truyền { all: true }
 */
export const searchOrdersApi = async (params: IFilterOrder) => {
  const res = await AxiosAPI.get("/api/orders/search", { params });
  return res.data;
};

/** (tuỳ chọn) helper lấy toàn bộ */
export const searchOrdersAllApi = async (params: IFilterOrder = {}) => {
  const res = await AxiosAPI.get("/api/orders/search", { params: { ...params, all: true } });
  return res.data;
};

/** Get by id */
export const getOrderByIdApi = async (id: string) => {
  const res = await AxiosAPI.get(`/api/orders/${id}`);
  return res.data;
};

/** Lock / Unlock / Delete (1) */
export const lockOrderApi = async (id: string) => {
  const res = await AxiosAPI.put(`/api/orders/${id}/lock`);
  return res.data;
};
export const unlockOrderApi = async (id: string) => {
  const res = await AxiosAPI.put(`/api/orders/${id}/unlock`);
  return res.data;
};
export const deleteOrderApi = async (id: string) => {
  const res = await AxiosAPI.delete(`/api/orders/${id}`);
  return res.data;
};

/** Lock / Unlock / Delete (nhiều) */
export const lockOrdersApi = async (ids: string[]) => {
  const res = await AxiosAPI.put("/api/orders/lock", { ids });
  return res.data;
};
export const unlockOrdersApi = async (ids: string[]) => {
  const res = await AxiosAPI.put("/api/orders/unlock", { ids });
  return res.data;
};
export const deleteOrdersApi = async (ids: string[]) => {
  const res = await AxiosAPI.delete("/api/orders/delete", { data: { ids } });
  return res.data;
};

/** Logs */
export const getOrderLogsApi = async (id: string) => {
  const res = await AxiosAPI.get(`/api/orders/${id}/logs`);
  return res.data;
};
