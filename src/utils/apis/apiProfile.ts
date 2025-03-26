import AxiosAPI from "@/utils/configs/axiosClient";

export const getProfileApi = async () => {
  try {
    const res = await AxiosAPI.get("/api/profile");
    return res;
  } catch (error) {
    console.error("Error login:", error);
  }
};
