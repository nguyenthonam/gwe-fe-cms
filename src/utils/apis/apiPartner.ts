import { ECOMPANY_TYPE, ICompany } from "@/types/typeCompany";
import { ISearchQuery } from "@/types/typeGlobals";
import AxiosAPI from "@/utils/configs/axiosClient";

export const getPartnersApi = async () => {
  try {
    const res = await AxiosAPI.get("/api/companies/type", {
      params: {
        type: ECOMPANY_TYPE.Customer,
      },
    });
    return res;
  } catch (error: any) {
    console.error("Error:", error);
    throw new Error(error.response.data.message);
  }
};

export const searchPartnersApi = async ({ keyword, page = 1, perPage = 10, status }: ISearchQuery) => {
  try {
    const res = await AxiosAPI.get("/api/companies/search", {
      params: {
        keyword,
        page,
        perPage,
        status,
        type: ECOMPANY_TYPE.Customer,
      },
    });
    return res;
  } catch (error: any) {
    console.error("Error:", error);
    throw new Error(error.response.data.message);
  }
};

export const createPartnerApi = async (payload: ICompany) => {
  try {
    const res = await AxiosAPI.post("/api/companies", { ...payload, type: ECOMPANY_TYPE.Customer });
    return res;
  } catch (error: any) {
    console.error("Error login:", error);
    throw new Error(error.response.data.message);
  }
};

export const updatePartnerApi = async (id: string, company: ICompany) => {
  try {
    const res = await AxiosAPI.put(`/api/companies/${id}`, company);
    return res;
  } catch (error: any) {
    console.error("Error login:", error);
    throw new Error(error.response.data.message);
  }
};
export const lockPartnerApi = async (id: string) => {
  try {
    const res = await AxiosAPI.put(`/api/companies/${id}/lock`);
    return res;
  } catch (error: any) {
    console.error("Error login:", error);
    throw new Error(error.response.data.message);
  }
};
export const unlockPartnerApi = async (id: string) => {
  try {
    const res = await AxiosAPI.put(`/api/companies/${id}/unlock`);
    return res;
  } catch (error: any) {
    console.error("Error login:", error);
    throw new Error(error.response.data.message);
  }
};
export const deletePartnerApi = async (id: string) => {
  try {
    const res = await AxiosAPI.delete(`/api/companies/${id}`);
    return res;
  } catch (error: any) {
    console.error("Error login:", error);
    throw new Error(error.response.data.message);
  }
};
