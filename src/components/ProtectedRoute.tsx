"use client";

import { useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter, usePathname } from "next/navigation";
import { ThunkDispatch } from "@reduxjs/toolkit";
import { AnyAction } from "redux";

import { AppState } from "@/store";
import { logout, setAccessToken, setProfile } from "@/store/reducers/authReducer";
import { useNotification } from "@/contexts/NotificationProvider";
import { verifyTokenApi } from "@/utils/apis/apiAuth";

const PUBLIC_PATHS = ["/sign-in", "/auth/forgot-password", "/auth/new-password"];

const getClientToken = () => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("AccessToken");
};

const getApiErrorMessage = (error: any, fallback = "Authentication check failed!") => {
  return error?.response?.data?.message || error?.message || fallback;
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch: ThunkDispatch<AppState, unknown, AnyAction> = useDispatch();
  const { showNotification } = useNotification();
  const { accessToken, profile } = useSelector((state: AppState) => state.auth);
  const verifiedTokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (PUBLIC_PATHS.includes(pathname)) return;

    const token = accessToken || getClientToken();

    if (!token) {
      verifiedTokenRef.current = null;
      dispatch(logout());
      router.replace("/sign-in");
      return;
    }

    if (!accessToken) {
      dispatch(setAccessToken({ accessToken: token }));
    }

    if (verifiedTokenRef.current === token && profile?._id) {
      return;
    }

    let cancelled = false;

    const verify = async () => {
      try {
        const res = await verifyTokenApi();
        const userData = res?.data?.data;

        if (!userData?._id) {
          throw new Error("Token không hợp lệ!");
        }

        if (!cancelled) {
          verifiedTokenRef.current = token;
          dispatch(setProfile({ profile: userData }));
        }
      } catch (error: any) {
        if (!cancelled) {
          verifiedTokenRef.current = null;
          dispatch(logout());
          showNotification(getApiErrorMessage(error, "Token verification failed!"), "error");
          router.replace("/sign-in");
        }
      }
    };

    verify();

    return () => {
      cancelled = true;
    };
  }, [pathname, accessToken, profile?._id, dispatch, router, showNotification]);

  useEffect(() => {
    if (pathname !== "/sign-in") return;

    const token = accessToken || getClientToken();
    if (token) {
      router.replace("/dashboard");
    }
  }, [accessToken, pathname, router]);

  return <>{children}</>;
};

export default ProtectedRoute;
