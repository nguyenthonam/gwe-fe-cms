"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/utils/lib/react-query";

import { styled, Theme, CSSObject, useTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import customTheme from "@/styles/MUI/customTheme";
import { blue, lightBlue, red } from "@mui/material/colors";

import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";
import {
  Box,
  Drawer as MuiDrawer,
  DrawerProps as MuiDrawerProps,
  Menu,
  MenuItem,
  Toolbar,
  Divider,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Avatar,
  Typography,
  IconButton,
} from "@mui/material";

import {
  Menu as MenuIcon,
  Business as BusinessIcon,
  Handshake as PartnerIcon,
  AirplaneTicket as CarrierIcon,
  EmojiTransportation as SupplierIcon,
  CurrencyBitcoin as PriceIcon,
  LocalAtm as PurchasePriceIcon,
  MonetizationOn as SalePriceIcon,
  QueuePlayNext as ExtraFeeIcon,
  Dataset as DatasetIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  Dashboard as DashboardIcon,
  Receipt as ReceiptIcon,
  AccountCircle as AccountCircleIcon,
  ManageAccounts as ManageAccountsIcon,
  SupervisedUserCircle as SystemIcon,
  Person as PersonIcon,
  QrCode as CAWBCodeIcon,
  Logout as LogoutIcon,
  Percent as PercentIcon,
  Layers as ZoneIcon,
  LocalGasStation as LocalGasStationIcon,
} from "@mui/icons-material";

import ReduxProvider from "@/components/ReduxProvider";
import { NotificationProvider, useNotification } from "@/contexts/NotificationProvider";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useDispatch, useSelector } from "react-redux";
import { signOutUser } from "@/store/reducers/authReducer";
import { AppState } from "@/store";
import { ThunkDispatch } from "@reduxjs/toolkit";
import { AnyAction } from "redux";
import ClientOnly from "@/components/ClientOnly";

import LayoutContext from "@/contexts/LayoutContext";

interface LayoutViewProps {
  children: React.ReactNode;
}

const drawerWidth: number = 320;

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: { width: `calc(${theme.spacing(8)} + 1px)` },
  overflow: "hidden", // ⛔ đóng là không scroll
});

const DrawerHeader = styled("div")(({ theme }: { theme: Theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
}));

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop: string) => prop !== "open",
})<AppBarProps>(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
}));

interface DrawerProps extends MuiDrawerProps {
  open: boolean;
}

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop: keyof DrawerProps) => prop !== "open",
})<DrawerProps>(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  "&.MuiDrawer-root": { overflow: "hidden" }, // ⛔ root không scroll ngang
  "& .MuiDrawer-paper": { overflowX: "hidden" }, // ⛔ paper không scroll ngang
  ...(open && { ...openedMixin(theme), "& .MuiDrawer-paper": { ...openedMixin(theme), overflowY: "auto", overflowX: "hidden" } }),
  ...(!open && { ...closedMixin(theme), "& .MuiDrawer-paper": { ...closedMixin(theme) } }),
}));

const SIDEBAR_LINKS = [
  {
    section: null,
    items: [
      { title: "Dashboard", href: "/dashboard", icon: <DashboardIcon /> },
      { title: "Bills", href: "/bill", icon: <ReceiptIcon /> },
    ],
  },
  {
    section: "Company Management",
    icon: <BusinessIcon />,
    items: [
      { title: "Customers", href: "/manager/partners", icon: <PartnerIcon /> },
      { title: "Carriers", href: "/manager/carriers", icon: <CarrierIcon /> },
      { title: "Services", href: "/manager/carriers?tab=2", icon: <DatasetIcon /> },
      { title: "Suppliers", href: "/manager/suppliers", icon: <SupplierIcon /> },
    ],
  },
  {
    section: "Price Management",
    icon: <PriceIcon />,
    items: [
      { title: "Purchase Prices", href: "/manager/prices?tab=0", icon: <PurchasePriceIcon /> },
      { title: "Sale Prices", href: "/manager/prices?tab=1", icon: <SalePriceIcon /> },
      { title: "Zones", href: "/manager/prices?tab=2", icon: <ZoneIcon /> },
      { title: "VAT", href: "/manager/prices?tab=3", icon: <PercentIcon /> },
      { title: "Extra Fees", href: "/manager/prices?tab=4", icon: <ExtraFeeIcon /> },
      { title: "Fuel Surcharges", href: "/manager/prices?tab=5", icon: <LocalGasStationIcon /> },
      { title: "AWB Codes", href: "/manager/prices?tab=6", icon: <CAWBCodeIcon /> },
      { title: "Exchange Rates", href: "/manager/prices?tab=7", icon: <PriceIcon /> },
    ],
  },
  { section: "System Management", icon: <SystemIcon />, items: [{ title: "Accounts", href: "/manager/systems?tab=0", icon: <ManageAccountsIcon /> }] },
];

const LayoutView: React.FC<LayoutViewProps> = ({ children }) => {
  const View: React.FC<LayoutViewProps> = ({ children }) => {
    const theme = useTheme();
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // ===== Active helpers (path + query params) =====
    const parseHref = React.useCallback((href: string) => {
      const [path, query = ""] = href.split("?");
      const params = new URLSearchParams(query);
      return { path, params };
    }, []);

    const isActive = React.useCallback(
      (href: string) => {
        const { path, params } = parseHref(href);
        if (path !== pathname) return false;
        for (const [k, v] of params.entries()) {
          if (searchParams.get(k) !== v) return false;
        }
        return true;
      },
      [pathname, searchParams, parseHref]
    );

    // ===== Drawer persist =====
    const [showDrawer, setShowDrawer] = React.useState<boolean>(() => {
      if (typeof window === "undefined") return false;
      try {
        return JSON.parse(localStorage.getItem("gwe.drawerOpen") || "false");
      } catch {
        return false;
      }
    });

    const [openGroup, setOpenGroup] = React.useState<string | null>(() => {
      if (typeof window === "undefined") return null;
      try {
        const v = localStorage.getItem("gwe.drawerOpenGroup");
        return v ? JSON.parse(v) : null;
      } catch {
        return null;
      }
    });

    React.useEffect(() => {
      try {
        localStorage.setItem("gwe.drawerOpen", JSON.stringify(showDrawer));
      } catch {}
    }, [showDrawer]);

    React.useEffect(() => {
      try {
        localStorage.setItem("gwe.drawerOpenGroup", JSON.stringify(openGroup));
      } catch {}
    }, [openGroup]);

    // ===== Auth / menu =====
    const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
    const showMenu: boolean = Boolean(anchorEl);
    const dispatch: ThunkDispatch<AppState, unknown, AnyAction> = useDispatch();
    const { accessToken, profile, isLoading } = useSelector((state: AppState) => state.auth);
    const { showNotification } = useNotification();

    const [hydrated, setHydrated] = React.useState(false);
    React.useEffect(() => setHydrated(true), []);
    React.useEffect(() => {
      if (!accessToken) setShowDrawer(false);
    }, [accessToken]);

    const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => setAnchorEl(event.currentTarget);
    const handleMenuClose = () => setAnchorEl(null);

    const handleLogout = async () => {
      handleMenuClose();
      if (isLoading) return;
      try {
        await dispatch(signOutUser());
        showNotification("Signed out successfully!", "success");
        router.push("/sign-in");
      } catch (e: any) {
        showNotification(e?.message || "Sign out failed, please try again!", "error");
      }
    };

    // ===== content rect (cho page con dùng nếu cần) =====
    const mainRef = React.useRef<HTMLDivElement>(null);
    const [contentRect, setContentRect] = React.useState<DOMRectReadOnly | null>(null);
    React.useEffect(() => {
      if (!mainRef.current) return;
      const ro = new ResizeObserver(([entry]) => setContentRect(entry.contentRect));
      ro.observe(mainRef.current);
      return () => ro.disconnect();
    }, []);

    // ===== Toggle Drawer: khóa scroll khi animate =====
    const [isDrawerAnimating, setIsDrawerAnimating] = React.useState(false);
    const toggleDrawer = React.useCallback(() => {
      setIsDrawerAnimating(true);
      setShowDrawer((p) => !p);

      const dur = typeof theme.transitions.duration.enteringScreen === "number" ? (showDrawer ? theme.transitions.duration.leavingScreen : theme.transitions.duration.enteringScreen) : 300;

      document.documentElement.classList.add("gwe-scroll-lock");
      window.setTimeout(() => {
        setIsDrawerAnimating(false);
        document.documentElement.classList.remove("gwe-scroll-lock");
        window.dispatchEvent(new Event("resize"));
      }, Number(dur) || 300);
    }, [showDrawer, theme.transitions.duration]);

    const onGroupHeaderClick = (section: string) => {
      if (showDrawer) {
        setOpenGroup((prev) => (prev === section ? null : section));
      } else {
        setShowDrawer(true);
        setOpenGroup(section);
      }
    };

    const navigateWithOpen = (href: string, closeGroups: boolean = true) => {
      if (closeGroups) {
        setOpenGroup(null);
        try {
          localStorage.setItem("gwe.drawerOpenGroup", "null");
        } catch {}
      }
      if (!showDrawer) {
        setShowDrawer(true);
        setTimeout(() => router.push(href), 220);
      } else {
        router.push(href);
      }
    };

    const activeBg = "rgba(255,255,255,0.16)";
    const hoverBg = "rgba(255,255,255,0.08)";
    const activeText = "#ffffff";

    return (
      <LayoutContext.Provider value={{ drawerOpen: showDrawer, toggleDrawer, contentRect, isDrawerAnimating }}>
        <CssBaseline />
        {/* Khóa scroll body khi animate Drawer */}
        <style>{`html.gwe-scroll-lock, html.gwe-scroll-lock body { overflow: hidden !important; }`}</style>

        <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
          <AppBar position="fixed" open={showDrawer} sx={{ backgroundColor: "white" }}>
            <Toolbar>
              <IconButton edge="start" color="primary" onClick={toggleDrawer} sx={{ mr: 2 }} aria-label="toggle drawer">
                <MenuIcon />
              </IconButton>

              <Link href="/" style={{ display: "flex", alignItems: "center" }}>
                <Image src="/logo.png" alt="Logo" width={150} height={50} priority style={{ width: 150, height: "auto" }} />
              </Link>

              {accessToken ? (
                <Box sx={{ display: "flex", alignItems: "center", ml: "auto" }}>
                  {hydrated && (
                    <Typography variant="body1" sx={{ mr: 1, fontWeight: 600, color: lightBlue[900] }}>
                      {profile?.contact?.fullname || "User"}
                    </Typography>
                  )}

                  <IconButton onClick={handleMenuClick} sx={{ p: "2px" }}>
                    <Avatar alt="User" sx={{ bgcolor: lightBlue[500] }}>
                      <AccountCircleIcon />
                    </Avatar>
                  </IconButton>
                  <Menu anchorEl={anchorEl} open={showMenu} onClose={handleMenuClose} sx={{ mt: 1 }}>
                    <MenuItem
                      onClick={() => {
                        handleMenuClose();
                        router.push("/profile");
                      }}
                      sx={{ color: blue[500] }}
                    >
                      <ListItemIcon sx={{ color: blue[500] }}>
                        <PersonIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>Profile</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={handleLogout} disabled={isLoading} sx={{ color: red[500] }}>
                      <ListItemIcon sx={{ color: red[500] }}>
                        <LogoutIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>Logout</ListItemText>
                    </MenuItem>
                  </Menu>
                </Box>
              ) : (
                <Box sx={{ display: "flex", alignItems: "center", ml: "auto" }}>
                  <Link href="/sign-in" passHref legacyBehavior>
                    <Typography component="a" variant="body1" sx={{ mr: 1, fontWeight: 600, color: lightBlue[500], textDecoration: "none", cursor: "pointer" }}>
                      Sign in
                    </Typography>
                  </Link>
                </Box>
              )}
            </Toolbar>
          </AppBar>

          <Box sx={{ display: "flex", flexGrow: 1, minHeight: 0 }}>
            {accessToken && (
              <Drawer variant="permanent" open={showDrawer} sx={{ "& .MuiDrawer-paper": { bgcolor: lightBlue[900], color: "white" } }}>
                <DrawerHeader />
                <Divider />
                <Box
                  sx={{
                    flex: 1,
                    minHeight: 0,
                    overflowY: showDrawer ? "auto" : "hidden",
                    overflowX: "hidden", // ⛔ luôn ẩn scroll ngang
                  }}
                  onWheel={(e) => {
                    if (!showDrawer) {
                      e.preventDefault();
                      e.stopPropagation();
                    }
                  }}
                  onTouchMove={(e) => {
                    if (!showDrawer) {
                      e.preventDefault();
                      e.stopPropagation();
                    }
                  }}
                >
                  <List>
                    {SIDEBAR_LINKS.map((group, gIdx) => (
                      <React.Fragment key={gIdx}>
                        {/* Nhóm không có section */}
                        {!group.section &&
                          group.items.map((item) => {
                            const active = isActive(item.href);
                            return (
                              <ListItemButton
                                key={item.title}
                                component={Link}
                                href={item.href}
                                selected={active}
                                onClick={(e) => {
                                  e.preventDefault();
                                  navigateWithOpen(item.href, true);
                                }}
                                sx={{
                                  "&.Mui-selected": {
                                    bgcolor: activeBg,
                                    "& .MuiListItemIcon-root": { color: activeText },
                                    "& .MuiListItemText-primary": { fontWeight: 700, color: activeText },
                                  },
                                  "&:hover": { bgcolor: hoverBg },
                                }}
                              >
                                <ListItemIcon sx={{ color: active ? activeText : "rgba(255,255,255,0.9)", minWidth: 40 }}>{item.icon}</ListItemIcon>
                                <ListItemText
                                  primary={item.title}
                                  sx={{
                                    opacity: showDrawer ? 1 : 0,
                                    transition: "opacity .2s",
                                    textTransform: "uppercase",
                                    "& .MuiTypography-root": {
                                      fontWeight: active ? 700 : 500,
                                      color: active ? activeText : "rgba(255,255,255,0.9)",
                                    },
                                  }}
                                />
                              </ListItemButton>
                            );
                          })}

                        {/* Nhóm có section (KHÔNG highlight header) */}
                        {group.section && (
                          <>
                            <ListItemButton onClick={() => onGroupHeaderClick(group.section!)} sx={{ cursor: "pointer", "&:hover": { bgcolor: hoverBg } }}>
                              <ListItemIcon sx={{ color: "rgba(255,255,255,0.9)", minWidth: 40 }}>{group.icon}</ListItemIcon>
                              <ListItemText
                                primary={group.section}
                                sx={{
                                  opacity: showDrawer ? 1 : 0,
                                  transition: "opacity .2s",
                                  textTransform: "uppercase",
                                  "& .MuiTypography-root": { fontWeight: 500, color: "rgba(255,255,255,0.9)" },
                                }}
                              />
                              {showDrawer && (openGroup === group.section ? <ExpandLessIcon htmlColor="white" /> : <ExpandMoreIcon htmlColor="white" />)}
                            </ListItemButton>

                            <Collapse in={showDrawer && openGroup === group.section} timeout="auto" unmountOnExit>
                              <List component="div" disablePadding>
                                {group.items.map((item) => {
                                  const active = isActive(item.href);
                                  return (
                                    <ListItemButton
                                      key={item.title}
                                      sx={{
                                        pl: 4,
                                        "&.Mui-selected": {
                                          bgcolor: activeBg,
                                          "& .MuiListItemIcon-root": { color: activeText },
                                          "& .MuiListItemText-primary": { fontWeight: 700, color: activeText },
                                        },
                                        "&:hover": { bgcolor: hoverBg },
                                      }}
                                      component={Link}
                                      href={item.href}
                                      selected={active}
                                      onClick={(e) => {
                                        e.preventDefault();
                                        navigateWithOpen(item.href, false); // không đóng group
                                      }}
                                    >
                                      <ListItemIcon sx={{ color: active ? activeText : "rgba(255,255,255,0.9)" }}>{item.icon}</ListItemIcon>
                                      <ListItemText
                                        primary={item.title}
                                        sx={{
                                          textTransform: "uppercase",
                                          "& .MuiTypography-root": {
                                            fontWeight: active ? 700 : 500,
                                            color: active ? activeText : "rgba(255,255,255,0.9)",
                                          },
                                        }}
                                      />
                                    </ListItemButton>
                                  );
                                })}
                              </List>
                            </Collapse>
                          </>
                        )}
                      </React.Fragment>
                    ))}
                  </List>
                  <Box sx={{ height: 68 }} />
                </Box>
              </Drawer>
            )}

            {/* Main */}
            <Box
              component="main"
              ref={mainRef}
              sx={{
                flexGrow: 1,
                display: "flex",
                flexDirection: "column",
                minHeight: 0,
                overflowY: isDrawerAnimating ? "hidden" : "auto",
                pointerEvents: isDrawerAnimating ? "none" : "auto",
                scrollbarGutter: "stable",
              }}
            >
              <DrawerHeader />
              <Box component="div" sx={{ flexGrow: 1, minHeight: 0 }}>
                {children}
              </Box>
              <Box component="footer" sx={{ p: 2, textAlign: "center", bgcolor: lightBlue[900], color: "white" }}>
                <Typography variant="body2">© 2025 Gateway Express. All rights reserved.</Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </LayoutContext.Provider>
    );
  };

  return (
    <QueryClientProvider client={queryClient}>
      <ReduxProvider>
        <NotificationProvider>
          <ProtectedRoute>
            <ThemeProvider theme={customTheme}>
              <ClientOnly>
                <View>{children}</View>
              </ClientOnly>
            </ThemeProvider>
          </ProtectedRoute>
        </NotificationProvider>
      </ReduxProvider>
    </QueryClientProvider>
  );
};

export default LayoutView;
