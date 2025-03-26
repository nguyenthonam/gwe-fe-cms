import AxiosAPI from "@/utils/configs/axiosClient";

export const getUserApi = async () => {
  try {
    const res = await AxiosAPI.get("/api/user");
    return res;
  } catch (error) {
    console.error("Error login:", error);
  }
};
