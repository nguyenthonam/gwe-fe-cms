"use client";
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter, usePathname } from "next/navigation";
import { AppState } from "@/store";
import { logoutUser, setProfile } from "@/store/reducers/authReducer";
import { useNotification } from "@/contexts/NotificationProvider";
import { IUser } from "@/types/typeUser";
import { ThunkDispatch } from "@reduxjs/toolkit";
import { AnyAction } from "redux";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch: ThunkDispatch<AppState, unknown, AnyAction> = useDispatch();
  const { showNotification } = useNotification();
  const { accessToken } = useSelector((state: AppState) => state.auth);

  useEffect(() => {
    const handleCheckAuthHeaders = async () => {
      console.log("Checking auth headers from middleware...");
      const response = await fetch(window.location.href);
      const authStatus = response.headers.get("X-Auth-Status");
      const shouldClearStorage = response.headers.get("X-Clear-LocalStorage");
      const userData = response.headers.get("X-User-Data");

      if (authStatus === "unauthorized" || shouldClearStorage) {
        localStorage.clear();
        dispatch(logoutUser());
        return true;
      }

      const localToken = localStorage.getItem("AccessToken");

      // Không có token trong Redux và localStorage
      if (!localToken) {
        dispatch(logoutUser());
        return true;
      }

      if (userData) {
        const parsedUserData = JSON.parse(userData) as IUser;
        dispatch(setProfile({ profile: parsedUserData }));
      }
      return false;
    };

    // Check middleware response first
    handleCheckAuthHeaders().then((isUnauthorized) => {
      if (isUnauthorized && pathname !== "/login") {
        showNotification("Phiên đăng nhập kết thúc!", "error");
        router.push("/login");
      }
    });
  }, [pathname, router, dispatch, showNotification]);

  // Handle routing based on auth state
  useEffect(() => {
    if (accessToken && pathname === "/login") {
      router.push("/dashboard");
    }
  }, [accessToken, pathname, router]);

  return <>{children}</>;
};

export default ProtectedRoute;
