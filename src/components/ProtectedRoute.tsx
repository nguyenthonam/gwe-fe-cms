"use client";
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter, usePathname } from "next/navigation";
import { AppState } from "@/store";
import { signOutUser, setProfile } from "@/store/reducers/authReducer";
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
        if (!res) throw new Error("No response from server!");

        const data = res?.data;
        if (data?.data) {
          const userData = data.data;
          dispatch(setProfile({ profile: userData }));
        }
        return true;
      } catch (err: any) {
        showNotification(err.message || "Token verification failed!", "error");
        return false;
      }
    };

    const handleCheckAuthHeaders = async () => {
      try {
        // If there's no token in Redux or localStorage
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
        showNotification(err.message || "Authentication check failed!", "error");
        return false;
      }
    };

    const EXCEPT_PATHS = ["/auth/forgot-password", "/auth/new-password"];

    if (!EXCEPT_PATHS.includes(pathname)) {
      handleCheckAuthHeaders().then((isValid) => {
        if (!isValid && pathname !== "/sign-in") {
          showNotification("Session expired. Please sign in again!", "error");
          router.push("/sign-in");
        }
      });
    }
  }, [pathname, router, dispatch, showNotification, accessToken]);

  // Redirect if already signed in and on sign-in page
  useEffect(() => {
    if (accessToken && pathname === "/sign-in") {
      router.push("/dashboard");
    }
  }, [accessToken, pathname, router]);

  return <>{children}</>;
};

export default ProtectedRoute;
