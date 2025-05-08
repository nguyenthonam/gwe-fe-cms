"use client";
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter, usePathname } from "next/navigation";
import { AppState } from "@/store";
import { signOutUser, setProfile } from "@/store/reducers/authReducer";
import { useNotification } from "@/contexts/NotificationProvider";
import { IUser } from "@/types/typeUser";
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
      } catch (err: any) {
        showNotification(err.message, "error");
        return false;
      }
    };

    const handleCheckAuthHeaders = async () => {
      try {
        // Không có token trong Redux và localStorage);
        if (!accessToken) {
          dispatch(signOutUser());
          return false;
        }
        const isValid = await handleVerifyToken();
        if (!isValid) {
          dispatch(signOutUser());
          return false;
        }

        return true;
      } catch (err: any) {
        showNotification(err.message, "error");
        return false;
      }
    };

    const EXCEPT_PATH = ["/auth/forgot-password", "/auth/new-password"];

    if (!EXCEPT_PATH.includes(pathname)) {
      // Check middleware response first
      handleCheckAuthHeaders().then((isValid) => {
        if (!isValid && pathname !== "/sign-in") {
          showNotification("Phiên đăng nhập kết thúc!", "error");
          router.push("/sign-in");
        }
      });
    }
  }, [pathname, router, dispatch, showNotification]);

  // Handle routing based on auth state
  useEffect(() => {
    if (accessToken && pathname === "/sign-in") {
      router.push("/dashboard");
    }
  }, [accessToken, pathname, router]);

  return <>{children}</>;
};

export default ProtectedRoute;
