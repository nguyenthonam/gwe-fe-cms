import { ECOMPANY_TYPE, ICompany } from "@/types/typeCompany";
import { ISearchQuery } from "@/types/typeGlobals";
import AxiosAPI from "@/utils/configs/axiosClient";

export const getCompaniesApi = async () => {
  try {
    const res = await AxiosAPI.get("/api/companies");
    return res;
  } catch (error: any) {
    console.error("Error:", error);
    throw new Error(error.response.data.message);
  }
};

export const searchCompaniesApi = async ({ keyword, page = 1, perPage = 10, status }: ISearchQuery) => {
  try {
    const res = await AxiosAPI.get("/api/companies/search", {
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

export const createCompanyApi = async (payload: ICompany) => {
  try {
    const res = await AxiosAPI.post("/api/companies", payload);
    return res;
  } catch (error: any) {
    console.error("Error login:", error);
    throw new Error(error.response.data.message);
  }
};

export const updateCompanyApi = async (id: string, company: ICompany) => {
  try {
    const res = await AxiosAPI.put(`/api/companies/${id}`, company);
    return res;
  } catch (error: any) {
    console.error("Error login:", error);
    throw new Error(error.response.data.message);
  }
};
export const lockCompanyApi = async (id: string) => {
  try {
    const res = await AxiosAPI.put(`/api/companies/${id}/lock`);
    return res;
  } catch (error: any) {
    console.error("Error login:", error);
    throw new Error(error.response.data.message);
  }
};
export const unlockCompanyApi = async (id: string) => {
  try {
    const res = await AxiosAPI.put(`/api/companies/${id}/unlock`);
    return res;
  } catch (error: any) {
    console.error("Error login:", error);
    throw new Error(error.response.data.message);
  }
};
export const deleteCompanyApi = async (id: string) => {
  try {
    const res = await AxiosAPI.delete(`/api/companies/${id}`);
    return res;
  } catch (error: any) {
    console.error("Error login:", error);
    throw new Error(error.response.data.message);
  }
};
