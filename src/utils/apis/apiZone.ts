import { IZone } from "@/types/typeZone";
import { ISearchQuery } from "@/types/typeGlobals";
import AxiosAPI from "@/utils/configs/axiosClient";

export const getZonesApi = async () => {
  try {
    const res = await AxiosAPI.get("/api/zones");
    return res;
  } catch (error: any) {
    console.error("Error:", error);
    throw new Error(error.response.data.message);
  }
};

export const getZonesByCarrierApi = async (carrierId: string) => {
  try {
    const res = await AxiosAPI.get("/api/zones/get-by-carrier", {
      params: {
        carrierId,
      },
    });
    return res;
  } catch (error: any) {
    console.error("Error:", error);
    throw new Error(error.response.data.message);
  }
};

export const searchZonesApi = async ({ keyword, page = 1, perPage = 10, status = "all", carrierId }: ISearchQuery & { carrierId?: string }) => {
  try {
    const query = {
      page,
      perPage,
      keyword,
      status,
    } as any;
    if (carrierId) query.carrierId = carrierId;

    const res = await AxiosAPI.get(`/api/zones/search`, {
      params: query,
    });

    return res;
  } catch (error: any) {
    console.error("Error:", error);
    throw new Error(error.response.data.message);
  }
};

export const createZoneApi = async (payload: IZone) => {
  try {
    const res = await AxiosAPI.post("/api/zones", payload);
    return res;
  } catch (error: any) {
    console.error("Error login:", error);
    throw new Error(error.response.data.message);
  }
};

export const updateZoneApi = async (id: string, payload: IZone) => {
  try {
    const res = await AxiosAPI.put(`/api/zones/${id}`, payload);
    return res;
  } catch (error: any) {
    console.error("Error login:", error);
    throw new Error(error.response.data.message);
  }
};
export const lockZoneApi = async (id: string) => {
  try {
    const res = await AxiosAPI.put(`/api/zones/${id}/lock`);
    return res;
  } catch (error: any) {
    console.error("Error login:", error);
    throw new Error(error.response.data.message);
  }
};
export const unlockZoneApi = async (id: string) => {
  try {
    const res = await AxiosAPI.put(`/api/zones/${id}/unlock`);
    return res;
  } catch (error: any) {
    console.error("Error login:", error);
    throw new Error(error.response.data.message);
  }
};
export const deleteZoneApi = async (id: string) => {
  try {
    const res = await AxiosAPI.delete(`/api/zones/${id}`);
    return res;
  } catch (error: any) {
    console.error("Error login:", error);
    throw new Error(error.response.data.message);
  }
};

// Tạo mới group Zone (chỉ insert zone chưa có)
export const createZoneGroupApi = async (carrierId: string, zones: IZone[]) => {
  try {
    const res = await AxiosAPI.post("/api/zones/group", { carrierId, zones });
    return res;
  } catch (error: any) {
    console.error("Error:", error);
    throw new Error(error.response.data.message);
  }
};

// Update group Zone (chỉ update các zone đã có)
export const updateZoneGroupApi = async (carrierId: string, zones: IZone[]) => {
  try {
    const res = await AxiosAPI.put("/api/zones/group", { carrierId, zones });
    return res;
  } catch (error: any) {
    console.error("Error:", error);
    throw new Error(error.response.data.message);
  }
};

// Xoá group Zone (soft delete)
export const deleteZoneGroupByCarrierApi = async (carrierId: string) => {
  try {
    const res = await AxiosAPI.delete(`/api/zones/group/${carrierId}`);
    return res;
  } catch (error: any) {
    console.error("Error:", error);
    throw new Error(error.response.data.message);
  }
};

// Lấy danh sách group Zone theo Carrier
export const getZoneGroupByCarrierApi = async (carrierId: string) => {
  try {
    const res = await AxiosAPI.get(`/api/zones/group/${carrierId}`);
    return res;
  } catch (error: any) {
    console.error("Error:", error);
    throw new Error(error.response.data.message);
  }
};

// Lock group zone
export const lockZoneGroupByCarrierApi = async (carrierId: string) => {
  try {
    const res = await AxiosAPI.put(`/api/zones/group/${carrierId}/lock`);
    return res;
  } catch (error: any) {
    console.error("Error:", error);
    throw new Error(error.response.data.message);
  }
};

// Unlock group zone
export const unlockZoneGroupByCarrierApi = async (carrierId: string) => {
  try {
    const res = await AxiosAPI.put(`/api/zones/group/${carrierId}/unlock`);
    return res;
  } catch (error: any) {
    console.error("Error:", error);
    throw new Error(error.response.data.message);
  }
};
