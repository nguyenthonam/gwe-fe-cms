import { IUpdateUserRequest, IUser } from "@/types/typeUser";
import { EUSER_ROLES, ISearchQuery } from "@/types/typeGlobals";
import AxiosAPI from "@/utils/configs/axiosClient";

export const createUserApi = async (payload: IUser) => {
  try {
    const res = await AxiosAPI.post("/api/users", payload);
    return res;
  } catch (error: any) {
    console.error("Error login:", error);
    throw new Error(error.response.data.message);
  }
};
export const updateUserApi = async (id: string, payload: IUpdateUserRequest) => {
  try {
    const res = await AxiosAPI.put(`/api/users/${id}`, payload);
    return res;
  } catch (error: any) {
    console.error("Error udpate user!", error);
    throw new Error(error.response.data.message);
  }
};

export const getUserApi = async () => {
  try {
    const res = await AxiosAPI.get("/api/users");
    return res;
  } catch (error: any) {
    console.error("Error login:", error);
    throw new Error(error.response.data.message);
  }
};
export const getUserByIdApi = async (id: string) => {
  try {
    const res = await AxiosAPI.get(`/api/user/${id}`);
    return res;
  } catch (error: any) {
    console.error("Error login:", error);
    throw new Error(error.response.data.message);
  }
};

export const searchUsersApi = async (payload: ISearchQuery & { role?: EUSER_ROLES }) => {
  try {
    const { page = 0, perPage = 5, keyword = "", status = "all", role } = payload;
    const query = {
      page,
      perPage,
      keyword,
      status,
    } as any;
    if (role) query.role = role;

    const res = await AxiosAPI.get(`/api/users/search`, {
      params: query,
    });
    return res;
  } catch (error: any) {
    console.error("Error login:", error);
    throw new Error(error.response.data.message);
  }
};

export const deleteUserApi = async (id: string) => {
  try {
    const res = await AxiosAPI.delete(`/api/users/${id}`);
    return res;
  } catch (error: any) {
    console.error("Error login:", error);
    throw new Error(error.response.data.message);
  }
};

export const lockUserApi = async (id: string) => {
  try {
    const res = await AxiosAPI.put(`/api/users/${id}/lock`);
    return res;
  } catch (error: any) {
    console.error("Error login:", error);
    throw new Error(error.response.data.message);
  }
};
export const unlockUserApi = async (id: string) => {
  try {
    const res = await AxiosAPI.put(`/api/users/${id}/unlock`);
    return res;
  } catch (error: any) {
    console.error("Error login:", error);
    throw new Error(error.response.data.message);
  }
};
