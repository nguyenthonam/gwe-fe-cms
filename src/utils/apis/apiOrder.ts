import { ICreateOrderRequest, IFilterOrder, IOrder } from "@/types/typeOrder";
import AxiosAPI from "@/utils/configs/axiosClient";

// Tạo đơn hàng
export const createOrderApi = async (payload: ICreateOrderRequest) => {
  const res = await AxiosAPI.post("/api/orders", payload);
  return res.data;
};

export const bulkUpdateOrdersApi = async (orderIds: string[], update: Record<string, any>) => {
  const res = await AxiosAPI.put("/api/orders/update/list", { orderIds, update });
  return res.data;
};

// Cập nhật đơn hàng (theo id)
export const updateOrderApi = async (id: string, payload: Partial<IOrder>) => {
  const res = await AxiosAPI.put(`/api/orders/update/${id}`, payload);
  return res.data;
};

// Tìm kiếm đơn hàng (filter nâng cao)
export const searchOrdersApi = async (params: IFilterOrder) => {
  const res = await AxiosAPI.get("/api/orders/search", { params });
  return res.data;
};

// Lấy danh sách đơn hàng (phân trang)
export const getOrderListApi = async (params?: IFilterOrder) => {
  const res = await AxiosAPI.get("/api/orders/list", { params });
  return res.data;
};

// Lấy chi tiết đơn hàng theo id
export const getOrderByIdApi = async (id: string) => {
  const res = await AxiosAPI.get(`/api/orders/${id}`);
  return res.data;
};

// Lock 1 đơn hàng
export const lockOrderApi = async (id: string) => {
  const res = await AxiosAPI.put(`/api/orders/lock/${id}`);
  return res.data;
};

// Lock nhiều đơn hàng
export const lockOrdersApi = async (ids: string[]) => {
  const res = await AxiosAPI.put("/api/orders/lock/list", { ids });
  return res.data;
};

// Unlock 1 đơn hàng
export const unlockOrderApi = async (id: string) => {
  const res = await AxiosAPI.put(`/api/orders/unlock/${id}`);
  return res.data;
};

// Unlock nhiều đơn hàng
export const unlockOrdersApi = async (ids: string[]) => {
  const res = await AxiosAPI.put("/api/orders/unlock/list", { ids });
  return res.data;
};

// Xóa 1 đơn hàng
export const deleteOrderApi = async (id: string) => {
  const res = await AxiosAPI.delete(`/api/orders/delete/${id}`);
  return res.data;
};

// Xóa nhiều đơn hàng
export const deleteOrdersApi = async (ids: string[]) => {
  // Với axios delete + data phải truyền vào config object
  const res = await AxiosAPI.delete("/api/orders/delete/list", { data: { ids } });
  return res.data;
};

// Lấy logs của đơn hàng
export const getOrderLogsApi = async (id: string) => {
  const res = await AxiosAPI.get(`/api/orders/logs/${id}`);
  return res.data;
};
