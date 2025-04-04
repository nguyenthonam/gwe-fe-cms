import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import type { IAuthState } from "@/types/typeAuth";
import { loginApi, logoutApi } from "@/utils/apis/apiAuth";
import { ILoginRequest } from "@/types/apis/typeAuthApi";
import { IUser } from "@/types";

const initialState: IAuthState = {
  profile: null,
  accessToken: null,
  isLoading: false,
  error: null,
};

// Async Thunk để xử lý login
export const loginUser = createAsyncThunk("auth/loginUser", async ({ email, password }: ILoginRequest, { rejectWithValue, dispatch }) => {
  try {
    const res = await loginApi({ email, password });
    if (!res) {
      throw new Error("Không nhận được phản hồi từ máy chủ!");
    }

    const token = res?.headers["authorization"];
    if (!token) throw new Error("Không có token!");

    const data = res?.data?.data;

    if (!data || !data.id) {
      throw new Error("Đăng nhập thất bại!");
    }
    // ✅ Cập nhật Redux state + Lưu token vào localStorage
    dispatch(setAuth({ accessToken: token, user: data }));
    return data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || "Lỗi không xác định";
    return rejectWithValue(errorMessage);
  }
});

export const logoutUser = createAsyncThunk("auth/logoutUser", async (_, { dispatch }) => {
  try {
    const res = await logoutApi();
    dispatch(logout());
    return res.data;
  } catch (error) {
    // Still clear local state on error
    dispatch(logout());
    throw error;
  }
});

const AuthSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAccessToken: (state, action: PayloadAction<{ accessToken: string }>) => {
      state.accessToken = action.payload.accessToken;
    },
    setProfile: (state, action: PayloadAction<{ profile: IUser }>) => {
      state.profile = action.payload.profile;
      localStorage?.setItem("User", JSON.stringify(action.payload.profile));
    },
    setAuth: (state, action: PayloadAction<{ accessToken: string; user: any }>) => {
      state.accessToken = action.payload.accessToken;
      state.profile = action.payload.user;
      localStorage?.setItem("AccessToken", action.payload.accessToken); // Lưu vào localStorage
      localStorage?.setItem("User", JSON.stringify(action.payload.user)); // 🔥 Lưu user vào localStorage
    },
    logout: (state) => {
      state.accessToken = null;
      state.profile = null;
      localStorage?.removeItem("AccessToken");
      localStorage?.removeItem("User");
      document.cookie = "AccessToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(logoutUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setAuth, setProfile, setAccessToken, logout } = AuthSlice.actions;
export default AuthSlice.reducer;
