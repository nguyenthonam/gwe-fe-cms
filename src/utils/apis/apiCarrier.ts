import { ICarrier } from "@/types";
import { ECOMPANY_TYPE, ICompany } from "@/types/typeCompany";
import { ISearchQuery } from "@/types/typeGlobals";
import AxiosAPI from "@/utils/configs/axiosClient";

export const getCompanyCarriersApi = async () => {
  try {
    const res = await AxiosAPI.get("/api/companies/type", {
      params: {
        type: ECOMPANY_TYPE.Carrier,
      },
    });
    return res;
  } catch (error: any) {
    console.error("Error:", error);
    throw new Error(error.response.data.message);
  }
};

export const getCarriersApi = async () => {
  try {
    const res = await AxiosAPI.get("/api/carriers");
    return res;
  } catch (error: any) {
    console.error("Error:", error);
    throw new Error(error.response.data.message);
  }
};

export const searchCompanyCarriersApi = async ({ keyword, page = 1, perPage = 10, status }: ISearchQuery) => {
  try {
    const res = await AxiosAPI.get("/api/companies/search", {
      params: {
        keyword,
        page,
        perPage,
        status,
        type: ECOMPANY_TYPE.Carrier,
      },
    });
    return res;
  } catch (error: any) {
    console.error("Error:", error);
    throw new Error(error.response.data.message);
  }
};

export const searchCarriersApi = async ({ keyword, page = 1, perPage = 10, status }: ISearchQuery) => {
  try {
    const res = await AxiosAPI.get("/api/carriers/search", {
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

export const createCompanyCarrierApi = async (payload: ICompany) => {
  try {
    const res = await AxiosAPI.post("/api/companies", { ...payload, type: ECOMPANY_TYPE.Carrier });
    return res;
  } catch (error: any) {
    console.error("Error login:", error);
    throw new Error(error.response.data.message);
  }
};

export const createCarrierApi = async (payload: ICarrier) => {
  try {
    const res = await AxiosAPI.post("/api/carriers", payload);
    return res;
  } catch (error: any) {
    console.error("Error login:", error);
    throw new Error(error.response.data.message);
  }
};

export const updateCompanyCarrierApi = async (id: string, company: ICompany) => {
  try {
    const res = await AxiosAPI.put(`/api/companies/${id}`, company);
    return res;
  } catch (error: any) {
    console.error("Error login:", error);
    throw new Error(error.response.data.message);
  }
};

export const updateCarrierApi = async (id: string, carriers: ICarrier) => {
  try {
    const res = await AxiosAPI.put(`/api/carriers/${id}`, carriers);
    return res;
  } catch (error: any) {
    console.error("Error login:", error);
    throw new Error(error.response.data.message);
  }
};

export const lockCompanyCarrierApi = async (id: string) => {
  try {
    const res = await AxiosAPI.put(`/api/companies/${id}/lock`);
    return res;
  } catch (error: any) {
    console.error("Error login:", error);
    throw new Error(error.response.data.message);
  }
};

export const lockCarrierApi = async (id: string) => {
  try {
    const res = await AxiosAPI.put(`/api/carriers/${id}/lock`);
    return res;
  } catch (error: any) {
    console.error("Error login:", error);
    throw new Error(error.response.data.message);
  }
};

export const unlockCompanyCarrierApi = async (id: string) => {
  try {
    const res = await AxiosAPI.put(`/api/companies/${id}/unlock`);
    return res;
  } catch (error: any) {
    console.error("Error login:", error);
    throw new Error(error.response.data.message);
  }
};

export const unlockCarrierApi = async (id: string) => {
  try {
    const res = await AxiosAPI.put(`/api/carriers/${id}/unlock`);
    return res;
  } catch (error: any) {
    console.error("Error login:", error);
    throw new Error(error.response.data.message);
  }
};

export const deleteCompanyCarrierApi = async (id: string) => {
  try {
    const res = await AxiosAPI.delete(`/api/companies/${id}`);
    return res;
  } catch (error: any) {
    console.error("Error login:", error);
    throw new Error(error.response.data.message);
  }
};

export const deleteCarrierApi = async (id: string) => {
  try {
    const res = await AxiosAPI.delete(`/api/carriers/${id}`);
    return res;
  } catch (error: any) {
    console.error("Error login:", error);
    throw new Error(error.response.data.message);
  }
};
