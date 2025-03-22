"use client";
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useRouter, usePathname } from "next/navigation";
import { AppState } from "@/store";
import { setAccessToken, logout } from "@/store/reducers/authReducer";
import { useNotification } from "@/contexts/NotificationProvider";

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

      if (authStatus === "unauthorized" || shouldClearStorage) {
        console.log("Unauthorized from middleware - clearing storage");
        localStorage.clear();
        dispatch(logout());
        return true;
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

    // Handle token restoration
    const savedToken = localStorage.getItem("AccessToken");
    if (savedToken && !accessToken) {
      console.log("Restoring token from localStorage");
      dispatch(setAccessToken({ accessToken: savedToken }));
    }
  }, [pathname, router]);

  // 2. Handle routing based on auth state
  useEffect(() => {
    if (accessToken && pathname === "/login") {
      router.push("/dashboard");
    }
  }, [accessToken, pathname, router]); // Fewer dependencies

  return <>{children}</>;
};

export default ProtectedRoute;
