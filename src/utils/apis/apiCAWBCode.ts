import { ICAWBCode } from "@/types/typeCAWBCode";
import { ECOMPANY_TYPE, ICompany } from "@/types/typeCompany";
import { ISearchQuery } from "@/types/typeGlobals";
import AxiosAPI from "@/utils/configs/axiosClient";

export const getCAWBCodesApi = async () => {
  try {
    const res = await AxiosAPI.get("/api/cawb-codes");
    return res;
  } catch (error: any) {
    console.error("Error:", error);
    throw new Error(error.response.data.message);
  }
};

export const searchCAWBCodesApi = async ({ keyword, page = 1, perPage = 10, status = "all", isUsed, carrierId }: ISearchQuery & { isUsed?: string; carrierId?: string }) => {
  try {
    const query = {
      page,
      perPage,
      keyword,
      status,
    } as any;
    if (isUsed) query.isUsed = isUsed;
    if (carrierId) query.carrierId = carrierId;

    const res = await AxiosAPI.get(`/api/cawb-codes/search`, {
      params: query,
    });

    return res;
  } catch (error: any) {
    console.error("Error:", error);
    throw new Error(error.response.data.message);
  }
};

export const createCAWBCodesApi = async (payload: { carrierId: string; codes: string[] }) => {
  try {
    const res = await AxiosAPI.post("/api/cawb-codes", payload);
    return res;
  } catch (error: any) {
    console.error("Error login:", error);
    throw new Error(error.response.data.message);
  }
};

export const updateCAWBCodeApi = async (id: string, company: ICAWBCode) => {
  try {
    const res = await AxiosAPI.put(`/api/cawb-codes/${id}`, company);
    return res;
  } catch (error: any) {
    console.error("Error login:", error);
    throw new Error(error.response.data.message);
  }
};
export const lockCAWBCodeApi = async (id: string) => {
  try {
    const res = await AxiosAPI.put(`/api/cawb-codes/${id}/lock`);
    return res;
  } catch (error: any) {
    console.error("Error login:", error);
    throw new Error(error.response.data.message);
  }
};
export const unlockCAWBCodeApi = async (id: string) => {
  try {
    const res = await AxiosAPI.put(`/api/cawb-codes/${id}/unlock`);
    return res;
  } catch (error: any) {
    console.error("Error login:", error);
    throw new Error(error.response.data.message);
  }
};
export const deleteCAWBCodeApi = async (id: string) => {
  try {
    const res = await AxiosAPI.delete(`/api/cawb-codes/${id}`);
    return res;
  } catch (error: any) {
    console.error("Error login:", error);
    throw new Error(error.response.data.message);
  }
};
