import { IVATRate } from "@/types/typeVATRate";
import { ISearchQuery } from "@/types/typeGlobals";
import AxiosAPI from "@/utils/configs/axiosClient";

// Get list (all, with optional filter)
export const getVATRatesApi = async (params?: { carrierId?: string; serviceId?: string; supplierId?: string }) => {
  try {
    const res = await AxiosAPI.get("/api/vat-rates/list", { params });
    return res;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Error fetching VAT Rates");
  }
};

// Get detail by ID
export const getVATRateByIdApi = async (id: string) => {
  try {
    const res = await AxiosAPI.get(`/api/vat-rates/${id}`);
    return res;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Error fetching VAT Rate detail");
  }
};

// Search
export const searchVATRatesApi = async ({
  keyword,
  page = 1,
  perPage = 10,
  status = "all",
  carrierId,
  serviceId,
  supplierId,
  startDate,
  endDate,
}: ISearchQuery & {
  carrierId?: string;
  serviceId?: string;
  supplierId?: string;
  startDate?: string;
  endDate?: string;
}) => {
  try {
    const params: any = { page, perPage, keyword, status };
    if (carrierId) params.carrierId = carrierId;
    if (serviceId) params.serviceId = serviceId;
    if (supplierId) params.supplierId = supplierId;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const res = await AxiosAPI.get("/api/vat-rates/search", { params });
    return res;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Error searching VAT Rates");
  }
};

// Create
export const createVATRateApi = async (payload: Partial<IVATRate>) => {
  try {
    const res = await AxiosAPI.post("/api/vat-rates", payload);
    return res;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Error creating VAT Rate");
  }
};

// Update (BE dùng /update/:id)
export const updateVATRateApi = async (id: string, payload: Partial<IVATRate>) => {
  try {
    const res = await AxiosAPI.put(`/api/vat-rates/update/${id}`, payload);
    return res;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Error updating VAT Rate");
  }
};

// Lock/Unlock
export const lockVATRateApi = async (id: string) => {
  try {
    const res = await AxiosAPI.put(`/api/vat-rates/lock/${id}`);
    return res;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Error locking VAT Rate");
  }
};

export const unlockVATRateApi = async (id: string) => {
  try {
    const res = await AxiosAPI.put(`/api/vat-rates/unlock/${id}`);
    return res;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Error unlocking VAT Rate");
  }
};

// Lock/Unlock many
export const lockVATRatesApi = async (ids: string[]) => {
  try {
    const res = await AxiosAPI.put(`/api/vat-rates/lock/list`, { ids });
    return res;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Error locking VAT Rates");
  }
};

export const unlockVATRatesApi = async (ids: string[]) => {
  try {
    const res = await AxiosAPI.put(`/api/vat-rates/unlock/list`, { ids });
    return res;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Error unlocking VAT Rates");
  }
};

// Delete (BE dùng /delete/:id)
export const deleteVATRateApi = async (id: string) => {
  try {
    const res = await AxiosAPI.delete(`/api/vat-rates/delete/${id}`);
    return res;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Error deleting VAT Rate");
  }
};

// Delete many
export const deleteVATRatesApi = async (ids: string[]) => {
  try {
    const res = await AxiosAPI.delete(`/api/vat-rates/delete/list`, { data: { ids } });
    return res;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Error deleting VAT Rates");
  }
};

// Get logs by VAT Rate id
export const getVATRateLogsApi = async (id: string, page = 1, perPage = 10) => {
  try {
    const res = await AxiosAPI.get(`/api/vat-rates/logs/${id}`, { params: { page, perPage } });
    return res;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || "Error fetching VAT Rate logs");
  }
};
