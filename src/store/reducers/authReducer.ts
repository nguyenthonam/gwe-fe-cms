import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import type { IAuthState } from "@/types/typeAuth";
import { signInApi, signOutApi } from "@/utils/apis/apiAuth";
import { ILoginRequest } from "@/types/apis/typeAuthApi";
import { IUser } from "@/types";

const initialState: IAuthState = {
  profile: null,
  accessToken: null,
  isLoading: false,
  error: null,
};

const initializeAuthState = (): IAuthState => {
  if (typeof window !== "undefined") {
    const token: string | null = localStorage.getItem("AccessToken");
    const user: string | null = localStorage.getItem("User");
    return {
      ...initialState,
      accessToken: token || null,
      profile: user ? JSON.parse(user) : null,
    };
  }
  return initialState;
};

export const signInUser = createAsyncThunk<{ accessToken: string; user: IUser }, ILoginRequest, { rejectValue: string }>(
  "auth/signInUser",
  async ({ email, password }: ILoginRequest, { rejectWithValue }) => {
    try {
      const res = await signInApi({ email, password });
      if (!res) throw new Error("Không nhận được phản hồi từ máy chủ!");

      const token: string | undefined = res?.headers["authorization"];
      if (!token) throw new Error("Không có token!");

      const data: IUser = res?.data?.data as IUser;
      if (!data || !data._id) throw new Error("Đăng nhập thất bại!");

      return { accessToken: token, user: data };
    } catch (error: unknown) {
      const errorMessage: string = (error as any).response?.data?.message || "Lỗi không xác định";
      return rejectWithValue(errorMessage);
    }
  }
);

export const signOutUser = createAsyncThunk<any, void, { rejectValue: string }>("auth/signOutUser", async (_, { dispatch, rejectWithValue }) => {
  try {
    const res = await signOutApi(); // Gọi API logout để xóa cookie từ server
    dispatch(logout()); // Cập nhật state và xóa localStorage
    return res.data;
  } catch (error: unknown) {
    dispatch(logout()); // Vẫn logout client-side ngay cả khi API lỗi
    return rejectWithValue((error as Error).message || "Lỗi đăng xuất");
  }
});

const AuthSlice = createSlice({
  name: "auth",
  initialState: initializeAuthState(),
  reducers: {
    setAccessToken: (state: IAuthState, action: PayloadAction<{ accessToken: string }>) => {
      state.accessToken = action.payload.accessToken;
      if (typeof window !== "undefined") {
        localStorage.setItem("AccessToken", action.payload.accessToken);
      }
    },
    setProfile: (state: IAuthState, action: PayloadAction<{ profile: IUser }>) => {
      state.profile = action.payload.profile;
      if (typeof window !== "undefined") {
        localStorage.setItem("User", JSON.stringify(action.payload.profile));
      }
    },
    setAuth: (state: IAuthState, action: PayloadAction<{ accessToken: string; user: IUser }>) => {
      state.accessToken = action.payload.accessToken;
      state.profile = action.payload.user;
      if (typeof window !== "undefined") {
        localStorage.setItem("AccessToken", action.payload.accessToken);
        localStorage.setItem("User", JSON.stringify(action.payload.user));
      }
      document.cookie = `AccessToken=${action.payload.accessToken}; Path=/; Secure; HttpOnly`;
    },
    logout: (state: IAuthState) => {
      state.accessToken = null;
      state.profile = null;
      if (typeof window !== "undefined") {
        localStorage.removeItem("AccessToken");
        localStorage.removeItem("User");
        // Không cần xóa cookie bằng document.cookie vì HttpOnly ngăn điều này
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(signInUser.pending, (state: IAuthState) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signInUser.fulfilled, (state: IAuthState, action: PayloadAction<{ accessToken: string; user: IUser }>) => {
        state.isLoading = false;
        state.accessToken = action.payload.accessToken;
        state.profile = action.payload.user;
        if (typeof window !== "undefined") {
          localStorage.setItem("AccessToken", action.payload.accessToken);
          localStorage.setItem("User", JSON.stringify(action.payload.user));
        }
        document.cookie = `AccessToken=${action.payload.accessToken}; Path=/; Secure; HttpOnly`;
      })
      .addCase(signInUser.rejected, (state: IAuthState, action: PayloadAction<string | undefined>) => {
        state.isLoading = false;
        state.error = action.payload || null;
      })
      .addCase(signOutUser.pending, (state: IAuthState) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signOutUser.fulfilled, (state: IAuthState) => {
        state.isLoading = false;
      })
      .addCase(signOutUser.rejected, (state: IAuthState, action: PayloadAction<string | undefined>) => {
        state.isLoading = false;
        state.error = action.payload || null;
      });
  },
});

export const { setAuth, setProfile, setAccessToken, logout } = AuthSlice.actions;
export default AuthSlice.reducer;
