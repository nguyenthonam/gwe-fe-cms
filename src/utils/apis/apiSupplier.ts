import { ISupplier } from "@/types/typeSupplier";
import { ECOMPANY_TYPE, ICompany } from "@/types/typeCompany";
import { ISearchQuery } from "@/types/typeGlobals";
import AxiosAPI from "@/utils/configs/axiosClient";

export const getCompanySuppliersApi = async () => {
  try {
    const res = await AxiosAPI.get("/api/companies/type", {
      params: {
        type: ECOMPANY_TYPE.Supplier,
      },
    });
    return res;
  } catch (error: any) {
    console.error("Error:", error);
    throw new Error(error.response.data.message);
  }
};

export const getSuppliersApi = async () => {
  try {
    const res = await AxiosAPI.get("/api/suppliers");
    return res;
  } catch (error: any) {
    console.error("Error:", error);
    throw new Error(error.response.data.message);
  }
};

export const searchCompanySuppliersApi = async ({ keyword, page = 1, perPage = 10, status }: ISearchQuery) => {
  try {
    const res = await AxiosAPI.get("/api/companies/search", {
      params: {
        keyword,
        page,
        perPage,
        status,
        type: ECOMPANY_TYPE.Supplier,
      },
    });
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

export const createCompanySupplierApi = async (payload: ICompany) => {
  try {
    const res = await AxiosAPI.post("/api/companies", { ...payload, type: ECOMPANY_TYPE.Supplier });
    return res;
  } catch (error: any) {
    console.error("Error login:", error);
    throw new Error(error.response.data.message);
  }
};

export const createSupplierApi = async (payload: ISupplier) => {
  try {
    const res = await AxiosAPI.post("/api/suppliers", payload);
    return res;
  } catch (error: any) {
    console.error("Error login:", error);
    throw new Error(error.response.data.message);
  }
};

export const updateCompanySupplierApi = async (id: string, company: ICompany) => {
  try {
    const res = await AxiosAPI.put(`/api/companies/${id}`, company);
    return res;
  } catch (error: any) {
    console.error("Error login:", error);
    throw new Error(error.response.data.message);
  }
};

export const updateSupplierApi = async (id: string, suppliers: ISupplier) => {
  try {
    const res = await AxiosAPI.put(`/api/suppliers/${id}`, suppliers);
    return res;
  } catch (error: any) {
    console.error("Error login:", error);
    throw new Error(error.response.data.message);
  }
};

export const lockCompanySupplierApi = async (id: string) => {
  try {
    const res = await AxiosAPI.put(`/api/companies/${id}/lock`);
    return res;
  } catch (error: any) {
    console.error("Error login:", error);
    throw new Error(error.response.data.message);
  }
};

export const lockSupplierApi = async (id: string) => {
  try {
    const res = await AxiosAPI.put(`/api/suppliers/${id}/lock`);
    return res;
  } catch (error: any) {
    console.error("Error login:", error);
    throw new Error(error.response.data.message);
  }
};

export const unlockCompanySupplierApi = async (id: string) => {
  try {
    const res = await AxiosAPI.put(`/api/companies/${id}/unlock`);
    return res;
  } catch (error: any) {
    console.error("Error login:", error);
    throw new Error(error.response.data.message);
  }
};

export const unlockSupplierApi = async (id: string) => {
  try {
    const res = await AxiosAPI.put(`/api/suppliers/${id}/unlock`);
    return res;
  } catch (error: any) {
    console.error("Error login:", error);
    throw new Error(error.response.data.message);
  }
};

export const deleteCompanySupplierApi = async (id: string) => {
  try {
    const res = await AxiosAPI.delete(`/api/companies/${id}`);
    return res;
  } catch (error: any) {
    console.error("Error login:", error);
    throw new Error(error.response.data.message);
  }
};

export const deleteSupplierApi = async (id: string) => {
  try {
    const res = await AxiosAPI.delete(`/api/suppliers/${id}`);
    return res;
  } catch (error: any) {
    console.error("Error login:", error);
    throw new Error(error.response.data.message);
  }
};
