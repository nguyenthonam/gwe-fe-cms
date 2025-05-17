import { ICarrier } from "@/types";
import { ECOMPANY_TYPE, ICompany } from "@/types/typeCompany";
import { ISearchQuery } from "@/types/typeGlobals";
import { IService } from "@/types/typeService";
import AxiosAPI from "@/utils/configs/axiosClient";

export const getServicesApi = async () => {
  try {
    const res = await AxiosAPI.get("/api/services");
    return res;
  } catch (error: any) {
    console.error("Error:", error);
    throw new Error(error.response.data.message);
  }
};
export const getServicesByCarrierApi = async (companyId: string) => {
  try {
    const res = await AxiosAPI.get("/api/services", {
      params: {
        companyId,
      },
    });
    return res;
  } catch (error: any) {
    console.error("Error:", error);
    throw new Error(error.response.data.message);
  }
};

export const searchServicesApi = async ({ keyword, page = 1, perPage = 10, status, companyId }: ISearchQuery & { companyId?: string }) => {
  try {
    const query = {
      page,
      perPage,
      keyword,
      status,
    } as any;
    if (companyId) query.companyId = companyId;

    const res = await AxiosAPI.get(`/api/services/search`, {
      params: query,
    });
    return res;
  } catch (error: any) {
    console.error("Error:", error);
    throw new Error(error.response.data.message);
  }
};

export const createServiceApi = async (payload: IService) => {
  try {
    const res = await AxiosAPI.post("/api/services", payload);
    return res;
  } catch (error: any) {
    console.error("Error login:", error);
    throw new Error(error.response.data.message);
  }
};

export const updateServiceApi = async (id: string, service: IService) => {
  try {
    const res = await AxiosAPI.put(`/api/services/${id}`, service);
    return res;
  } catch (error: any) {
    console.error("Error login:", error);
    throw new Error(error.response.data.message);
  }
};

export const lockServiceApi = async (id: string) => {
  try {
    const res = await AxiosAPI.put(`/api/services/${id}/lock`);
    return res;
  } catch (error: any) {
    console.error("Error login:", error);
    throw new Error(error.response.data.message);
  }
};

export const unlockServiceApi = async (id: string) => {
  try {
    const res = await AxiosAPI.put(`/api/services/${id}/unlock`);
    return res;
  } catch (error: any) {
    console.error("Error login:", error);
    throw new Error(error.response.data.message);
  }
};

export const deleteServiceApi = async (id: string) => {
  try {
    const res = await AxiosAPI.delete(`/api/services/${id}`);
    return res;
  } catch (error: any) {
    console.error("Error login:", error);
    throw new Error(error.response.data.message);
  }
};
