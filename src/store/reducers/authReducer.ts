import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import type { ILoginRequest, IAuthState } from "@/types/auth";
import { loginApi } from "@/utils/apis/apiAuth";

const initialState: IAuthState = {
  user: null,
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

const AuthSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAccessToken: (state, action: PayloadAction<{ accessToken: string }>) => {
      state.accessToken = action.payload.accessToken;
    },
    setUser: (state, action: PayloadAction<{ user: any }>) => {
      state.user = action.payload.user;
    },
    setAuth: (state, action: PayloadAction<{ accessToken: string; user: any }>) => {
      state.accessToken = action.payload.accessToken;
      state.user = action.payload.user;
      localStorage?.setItem("AccessToken", action.payload.accessToken); // Lưu vào localStorage
      localStorage?.setItem("User", JSON.stringify(action.payload.user)); // 🔥 Lưu user vào localStorage
    },
    logout: (state) => {
      state.accessToken = null;
      state.user = null;
      localStorage?.removeItem("AccessToken");
      localStorage?.removeItem("User");
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
      });
  },
});

export const { setAuth, setUser, setAccessToken, logout } = AuthSlice.actions;
export default AuthSlice.reducer;
