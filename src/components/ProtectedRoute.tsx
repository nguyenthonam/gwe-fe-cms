"use client";
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter, usePathname } from "next/navigation";
import { AppState } from "@/store";
import { setAccessToken, logout, setProfile } from "@/store/reducers/authReducer";
import { useNotification } from "@/contexts/NotificationProvider";
import { IUser } from "@/types/typeUser";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
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
        console.log("Unauthorized from middleware - clearing storage");
        localStorage.clear();
        dispatch(logout());
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
  }, [pathname, router]);

  // Handle routing based on auth state
  useEffect(() => {
    if (accessToken && pathname === "/login") {
      router.push("/dashboard");
    }
  }, [accessToken, pathname, router]);

  return <>{children}</>;
};

export default ProtectedRoute;
