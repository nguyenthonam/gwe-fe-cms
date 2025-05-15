import { ECOMPANY_TYPE, ICompany } from "@/types/typeCompany";
import { ISearchQuery } from "@/types/typeGlobals";
import AxiosAPI from "@/utils/configs/axiosClient";

export const getPartnersApi = async () => {
  try {
    const res = await AxiosAPI.get("/api/companies");
    return res;
  } catch (error) {
    console.error("Error:", error);
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
        type: ECOMPANY_TYPE.Partner,
      },
    });
    return res;
  } catch (error) {
    console.error("Error:", error);
  }
};

export const createPartnerApi = async (payload: ICompany) => {
  try {
    const res = await AxiosAPI.post("/api/companies", { ...payload, type: ECOMPANY_TYPE.Partner });
    return res;
  } catch (error) {
    console.error("Error login:", error);
  }
};

export const updatePartnerApi = async (company: ICompany) => {
  try {
    const res = await AxiosAPI.put(`/api/companies/${company.id}`, company);
    return res;
  } catch (error) {
    console.error("Error login:", error);
  }
};
export const lockPartnerApi = async (id: string) => {
  try {
    const res = await AxiosAPI.put(`/api/companies/${id}/lock`);
    return res;
  } catch (error) {
    console.error("Error login:", error);
  }
};
export const unlockPartnerApi = async (id: string) => {
  try {
    const res = await AxiosAPI.put(`/api/companies/${id}/unlock`);
    return res;
  } catch (error) {
    console.error("Error login:", error);
  }
};
export const deletePartnerApi = async (id: string) => {
  try {
    const res = await AxiosAPI.delete(`/api/companies/${id}`);
    return res;
  } catch (error) {
    console.error("Error login:", error);
  }
};
