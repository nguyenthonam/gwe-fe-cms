import { ISearchUserRequest, ICreateUserRequest, IUpdateUserRequest } from "@/types/apis/typeUser.Api";
import AxiosAPI from "@/utils/configs/axiosClient";

export const createUserApi = async (payload: ICreateUserRequest) => {
  try {
    const res = await AxiosAPI.post("/api/user", payload);
    return res;
  } catch (error) {
    console.error("Error login:", error);
  }
};
export const updateUserApi = async (payload: IUpdateUserRequest) => {
  try {
    const res = await AxiosAPI.post("/api/user", payload);
    return res;
  } catch (error) {
    console.error("Error udpate user!", error);
  }
};

export const getUserApi = async () => {
  try {
    const res = await AxiosAPI.get("/api/user/");
    return res;
  } catch (error) {
    console.error("Error login:", error);
  }
};
export const getUserByIdApi = async (id: string) => {
  try {
    const res = await AxiosAPI.get(`/api/user/${id}`);
    return res;
  } catch (error) {
    console.error("Error login:", error);
  }
};

export const searchUserApi = async (payload: ISearchUserRequest) => {
  try {
    const { page = 0, perPage = 5, keyword = "", status = "all" } = payload as { page?: number; perPage?: number; keyword?: string; status?: string };

    const res = await AxiosAPI.get(`/api/user/search`, {
      params: {
        page,
        perPage,
        keyword,
        status,
      },
    });
    return res;
  } catch (error) {
    console.error("Error login:", error);
  }
};

export const deleteUserByIdApi = async (id: string) => {
  try {
    const res = await AxiosAPI.delete(`/api/user/${id}`);
    return res;
  } catch (error) {
    console.error("Error login:", error);
  }
};

export const lockUserByIdApi = async (id: string) => {
  try {
    const res = await AxiosAPI.put(`/api/user/lock/${id}`);
    return res;
  } catch (error) {
    console.error("Error login:", error);
  }
};
export const unlockUserByIdApi = async (id: string) => {
  try {
    const res = await AxiosAPI.put(`/api/user/unlock/${id}`);
    return res;
  } catch (error) {
    console.error("Error login:", error);
  }
};
