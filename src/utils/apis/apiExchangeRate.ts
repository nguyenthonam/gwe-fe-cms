import { IExchangeRate } from "@/types/typeExchangeRate";
import { ECURRENCY, ISearchQuery } from "@/types/typeGlobals";
import AxiosAPI from "@/utils/configs/axiosClient";

export const getExchangeRatesApi = async () => {
  try {
    const res = await AxiosAPI.get("/api/exchange-rates");
    return res;
  } catch (error: any) {
    console.error("Error:", error);
    throw new Error(error.response.data.message);
  }
};

export const searchExchangeRatesApi = async ({ keyword, page = 1, perPage = 10, status = "all", currencyFrom }: ISearchQuery & { currencyFrom?: string }) => {
  try {
    const query = {
      page,
      perPage,
      keyword,
      status,
    } as any;
    if (currencyFrom) query.currencyFrom = currencyFrom;

    const res = await AxiosAPI.get(`/api/exchange-rates/search`, {
      params: query,
    });

    return res;
  } catch (error: any) {
    console.error("Error:", error);
    throw new Error(error.response.data.message);
  }
};

export const createExchangeRateApi = async (payload: { currencyFrom: ECURRENCY; currencyTo: ECURRENCY; rate: number }) => {
  try {
    const res = await AxiosAPI.post("/api/exchange-rates", payload);
    return res;
  } catch (error: any) {
    console.error("Error login:", error);
    throw new Error(error.response.data.message);
  }
};

export const updateExchangeRateApi = async (id: string, payload: Partial<IExchangeRate>) => {
  try {
    const res = await AxiosAPI.put(`/api/exchange-rates/${id}`, payload);
    return res;
  } catch (error: any) {
    console.error("Error login:", error);
    throw new Error(error.response.data.message);
  }
};
export const lockExchangeRateApi = async (id: string) => {
  try {
    const res = await AxiosAPI.put(`/api/exchange-rates/${id}/lock`);
    return res;
  } catch (error: any) {
    console.error("Error login:", error);
    throw new Error(error.response.data.message);
  }
};
export const unlockExchangeRateApi = async (id: string) => {
  try {
    const res = await AxiosAPI.put(`/api/exchange-rates/${id}/unlock`);
    return res;
  } catch (error: any) {
    console.error("Error login:", error);
    throw new Error(error.response.data.message);
  }
};
export const deleteExchangeRateApi = async (id: string) => {
  try {
    const res = await AxiosAPI.delete(`/api/exchange-rates/${id}`);
    return res;
  } catch (error: any) {
    console.error("Error login:", error);
    throw new Error(error.response.data.message);
  }
};
