"use client";
import * as React from "react";

export type LayoutCtx = {
  drawerOpen: boolean;
  toggleDrawer: () => void;
  contentRect: DOMRectReadOnly | null;
  isDrawerAnimating: boolean;
};

const LayoutContext = React.createContext<LayoutCtx | null>(null);

export const useLayout = () => {
  const ctx = React.useContext(LayoutContext);
  if (!ctx) throw new Error("useLayout must be used within LayoutContext.Provider");
  return ctx;
};

export default LayoutContext;
