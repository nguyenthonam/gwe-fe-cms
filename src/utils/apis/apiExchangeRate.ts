import { IExchangeRate } from "@/types/typeExchangeRate";
import { ECURRENCY, ISearchQuery } from "@/types/typeGlobals";
import AxiosAPI from "@/utils/configs/axiosClient";

export const getExchangeRatesApi = async () => {
  try {
    const res = await AxiosAPI.get("/api/exchange-rates/list");
    return res;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const searchExchangeRatesApi = async ({
  keyword,
  page = 1,
  perPage = 10,
  status = "all",
  currencyFrom,
  startDate,
  endDate,
}: ISearchQuery & { currencyFrom?: string; startDate?: string; endDate?: string }) => {
  try {
    const query: any = { page, perPage, keyword, status };
    if (currencyFrom) query.currencyFrom = currencyFrom;
    if (startDate) query.startDate = startDate;
    if (endDate) query.endDate = endDate;

    const res = await AxiosAPI.get(`/api/exchange-rates/search`, { params: query });
    return res;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const createExchangeRateApi = async (payload: { currencyFrom: ECURRENCY; currencyTo: ECURRENCY; rate: number; startDate: string; endDate: string }) => {
  try {
    const res = await AxiosAPI.post("/api/exchange-rates", payload);
    return res;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const updateExchangeRateApi = async (id: string, payload: Partial<IExchangeRate>) => {
  try {
    const res = await AxiosAPI.put(`/api/exchange-rates/update/${id}`, payload);
    return res;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const lockExchangeRateApi = async (id: string) => {
  try {
    const res = await AxiosAPI.put(`/api/exchange-rates/lock/${id}`);
    return res;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const unlockExchangeRateApi = async (id: string) => {
  try {
    const res = await AxiosAPI.put(`/api/exchange-rates/unlock/${id}`);
    return res;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};

export const deleteExchangeRateApi = async (id: string) => {
  try {
    const res = await AxiosAPI.delete(`/api/exchange-rates/delete/${id}`);
    return res;
  } catch (error: any) {
    throw new Error(error.response.data.message);
  }
};
