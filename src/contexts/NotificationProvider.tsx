"use client";

import React, { createContext, useCallback, useContext, useMemo, useState, ReactNode } from "react";
import { Alert, Snackbar } from "@mui/material";

type NotificationSeverity = "success" | "error" | "warning" | "info";

interface NotificationContextType {
  showNotification: (message: string, severity?: NotificationSeverity) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState<NotificationSeverity>("info");

  /**
   * Giữ reference ổn định để ProtectedRoute không bị chạy lại chỉ vì show notification.
   * Lỗi cũ: showNotification bị tạo lại sau mỗi render => useEffect trong ProtectedRoute gọi lại verify-token.
   */
  const showNotification = useCallback((msg: string, type: NotificationSeverity = "info") => {
    setMessage(msg);
    setSeverity(type);
    setOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  const contextValue = useMemo(() => ({ showNotification }), [showNotification]);

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      <Snackbar open={open} autoHideDuration={3000} onClose={handleClose} anchorOrigin={{ vertical: "top", horizontal: "right" }}>
        <Alert onClose={handleClose} severity={severity} sx={{ width: "100%" }}>
          {message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
};
