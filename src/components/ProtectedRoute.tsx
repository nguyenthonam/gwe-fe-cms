"use client";
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter, usePathname } from "next/navigation";
import { AppState } from "@/store";
import { logoutUser, setProfile } from "@/store/reducers/authReducer";
import { useNotification } from "@/contexts/NotificationProvider";
import { ThunkDispatch } from "@reduxjs/toolkit";
import { AnyAction } from "redux";
import { verifyTokenApi } from "@/utils/apis/apiAuth";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch: ThunkDispatch<AppState, unknown, AnyAction> = useDispatch();
  const { showNotification } = useNotification();
  const { accessToken } = useSelector((state: AppState) => state.auth);

  useEffect(() => {
    const handleVerifyToken = async () => {
      try {
        const res = await verifyTokenApi();
        if (!res) throw new Error("Không nhận được phản hồi từ máy chủ!");

        const data = res?.data;
        if (data?.data) {
          const userData = data.data;
          dispatch(setProfile({ profile: userData }));
        }
        return true;
      } catch (error: any) {
        console.error("Error verifying token:", error?.message);
        return false;
      }
    };

    const handleCheckAuthHeaders = async () => {
      // Không có token trong Redux và localStorage
      if (!accessToken) {
        dispatch(logoutUser());
        return false;
      }
      const isValid = await handleVerifyToken();
      if (!isValid) {
        dispatch(logoutUser());
        return false;
      }

      return true;
    };

    // Check middleware response first
    handleCheckAuthHeaders().then((isValid) => {
      if (!isValid && pathname !== "/login") {
        showNotification("Phiên đăng nhập kết thúc!", "error");
        router.push("/login");
      }
    });
  }, [accessToken, pathname, router, dispatch, showNotification]);

  // Handle routing based on auth state
  useEffect(() => {
    if (accessToken && pathname === "/login") {
      router.push("/dashboard");
    }
  }, [accessToken, pathname, router]);

  return <>{children}</>;
};

export default ProtectedRoute;
