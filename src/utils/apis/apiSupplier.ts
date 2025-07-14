import { ISupplier } from "@/types/typeSupplier";
import { ISearchQuery } from "@/types/typeGlobals";
import AxiosAPI from "@/utils/configs/axiosClient";

export const createSupplierApi = async (payload: ISupplier) => {
  try {
    const res = await AxiosAPI.post("/api/suppliers", payload);
    return res;
  } catch (error: any) {
    console.error("Error login:", error);
    throw new Error(error.response.data.message);
  }
};

export const updateSupplierApi = async (id: string, suppliers: ISupplier) => {
  try {
    const res = await AxiosAPI.put(`/api/suppliers/update/${id}`, suppliers);
    return res;
  } catch (error: any) {
    console.error("Error login:", error);
    throw new Error(error.response.data.message);
  }
};

export const getSuppliersApi = async () => {
  try {
    const res = await AxiosAPI.get("/api/suppliers/list");
    return res;
  } catch (error: any) {
    console.error("Error:", error);
    throw new Error(error.response.data.message);
  }
};

export const searchSuppliersApi = async ({ keyword, page = 1, perPage = 10, status }: ISearchQuery) => {
  try {
    const res = await AxiosAPI.get("/api/suppliers/search", {
      params: {
        keyword,
        page,
        perPage,
        status,
      },
    });
    return res;
  } catch (error: any) {
    console.error("Error:", error);
    throw new Error(error.response.data.message);
  }
};

export const lockSupplierApi = async (id: string) => {
  try {
    const res = await AxiosAPI.put(`/api/suppliers/lock/${id}`);
    return res;
  } catch (error: any) {
    console.error("Error login:", error);
    throw new Error(error.response.data.message);
  }
};

export const unlockSupplierApi = async (id: string) => {
  try {
    const res = await AxiosAPI.put(`/api/suppliers/unlock/${id}`);
    return res;
  } catch (error: any) {
    console.error("Error login:", error);
    throw new Error(error.response.data.message);
  }
};

export const deleteSupplierApi = async (id: string) => {
  try {
    const res = await AxiosAPI.delete(`/api/suppliers/delete/${id}`);
    return res;
  } catch (error: any) {
    console.error("Error login:", error);
    throw new Error(error.response.data.message);
  }
};
