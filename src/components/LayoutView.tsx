"use client";
import * as React from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/utils/lib/react-query";
import Link from "next/link";
import Image from "next/image";
import { styled, Theme, CSSObject } from "@mui/material/styles";
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
import { useRouter } from "next/navigation";
import { AppState } from "@/store";
import { ThunkDispatch } from "@reduxjs/toolkit";
import { AnyAction } from "redux";
import ClientOnly from "@/components/ClientOnly";

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
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
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
})<AppBarProps>(({ theme }: { theme: Theme }) => ({
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
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme),
  }),
}));

const LayoutView: React.FC<LayoutViewProps> = ({ children }) => {
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
    {
      section: "System Management",
      icon: <SystemIcon />,
      items: [{ title: "Accounts", href: "/manager/systems?tab=0", icon: <ManageAccountsIcon /> }],
    },
  ];

  const View: React.FC<LayoutViewProps> = ({ children }) => {
    const [showDrawer, setShowDrawer] = React.useState<boolean>(true);
    const [openGroup, setOpenGroup] = React.useState<string | null>(null);
    const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
    const showMenu: boolean = Boolean(anchorEl);
    const dispatch: ThunkDispatch<AppState, unknown, AnyAction> = useDispatch();
    const { accessToken, profile, isLoading } = useSelector((state: AppState) => state.auth);
    const { showNotification } = useNotification();
    const router = useRouter();

    const [hydrated, setHydrated] = React.useState(false);
    React.useEffect(() => {
      setHydrated(true);
    }, []);

    React.useEffect(() => {
      if (!accessToken) setShowDrawer(false);
    }, [accessToken]);

    const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>): void => {
      setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = (): void => {
      setAnchorEl(null);
    };

    const handleLogout = async (): Promise<void> => {
      handleMenuClose();
      if (isLoading) return;
      try {
        await dispatch(signOutUser());
        showNotification("Signed out successfully!", "success");
        router.push("/sign-in");
      } catch (error: unknown) {
        showNotification((error as Error).message || "Sign out failed, please try again!", "error");
      }
    };

    return (
      <>
        <CssBaseline />
        <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
          <AppBar position="fixed" open={showDrawer} sx={{ backgroundColor: "white" }}>
            <Toolbar>
              <IconButton edge="start" color="primary" onClick={() => setShowDrawer((prev) => !prev)} sx={{ mr: 2 }}>
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
          <Box sx={{ display: "flex", flexGrow: 1 }}>
            {accessToken && (
              <Drawer variant="permanent" open={showDrawer} sx={{ "& .MuiDrawer-paper": { bgcolor: lightBlue[900], color: "white" } }}>
                <DrawerHeader />
                <Divider />
                <Box sx={{ flex: 1, overflowY: "auto", minHeight: 0 }}>
                  <List>
                    {SIDEBAR_LINKS.map((group, gIdx) => (
                      <React.Fragment key={gIdx}>
                        {!group.section &&
                          group.items.map((item) => (
                            <ListItemButton
                              key={item.title}
                              component={Link}
                              href={item.href}
                              onClick={(e) => {
                                if (!showDrawer) e.preventDefault();
                              }}
                            >
                              <ListItemIcon
                                sx={{ color: "white", minWidth: 40, cursor: "pointer" }}
                                onClick={(e) => {
                                  if (!showDrawer) {
                                    e.stopPropagation();
                                    setShowDrawer(true);
                                    setTimeout(() => {
                                      window.location.href = item.href;
                                    }, 220);
                                  }
                                }}
                              >
                                {item.icon}
                              </ListItemIcon>
                              <ListItemText
                                primary={item.title}
                                sx={{
                                  opacity: showDrawer ? 1 : 0,
                                  transition: "opacity .2s",
                                  textTransform: "uppercase",
                                }}
                              />
                            </ListItemButton>
                          ))}
                        {group.section && (
                          <>
                            <ListItemButton
                              onClick={() => {
                                if (showDrawer) {
                                  setOpenGroup(openGroup === group.section ? null : group.section);
                                }
                              }}
                              sx={{ cursor: "pointer" }}
                            >
                              <ListItemIcon
                                sx={{ color: "white", minWidth: 40, cursor: "pointer" }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (!showDrawer) {
                                    setShowDrawer(true);
                                    setOpenGroup(group.section);
                                  }
                                }}
                              >
                                {group.icon}
                              </ListItemIcon>
                              <ListItemText
                                primary={group.section}
                                sx={{
                                  opacity: showDrawer ? 1 : 0,
                                  transition: "opacity .2s",
                                  textTransform: "uppercase",
                                }}
                              />
                              {showDrawer && (openGroup === group.section ? <ExpandLessIcon htmlColor="white" /> : <ExpandMoreIcon htmlColor="white" />)}
                            </ListItemButton>
                            <Collapse in={showDrawer && openGroup === group.section} timeout="auto" unmountOnExit>
                              <List component="div" disablePadding>
                                {group.items.map((item) => (
                                  <ListItemButton key={item.title} sx={{ pl: 4 }} component={Link} href={item.href}>
                                    <ListItemIcon sx={{ color: "white" }}>{item.icon}</ListItemIcon>
                                    <ListItemText
                                      primary={item.title}
                                      sx={{
                                        textTransform: "uppercase",
                                      }}
                                    />
                                  </ListItemButton>
                                ))}
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

            <Box component="main" sx={{ flexGrow: 1, display: "flex", flexDirection: "column", minHeight: "100vh" }}>
              <DrawerHeader />
              <Box component="div" sx={{ flexGrow: 1, p: 1 }}>
                {children}
              </Box>
              <Box component="footer" sx={{ p: 2, textAlign: "center", bgcolor: lightBlue[900], color: "white" }}>
                <Typography variant="body2">© 2025 Gateway Express. All rights reserved.</Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </>
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
