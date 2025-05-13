"use client";
import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { styled, Theme, CSSObject } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import customTheme from "@/styles/MUI/customTheme";
import { lightBlue } from "@mui/material/colors";
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
  ListItem,
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
  Dataset as DatasetIcon,
  ExpandLess as ExpandLessIcon,
  ExpandMore as ExpandMoreIcon,
  Dashboard as DashboardIcon,
  Receipt as ReceiptIcon,
  AccountCircle as AccountCircleIcon,
  Person as PersonIcon,
  Subtitles as SubtitlesIcon,
  Logout as LogoutIcon,
} from "@mui/icons-material";
import ReduxProvider from "@/components/ReduxProvider";
import { NotificationProvider, useNotification } from "@/contexts/NotificationProvider";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useDispatch, useSelector } from "react-redux";
import { signOutUser } from "@/store/reducers/authReducer";
import { useRouter } from "next/navigation";
import { AppState } from "@/store";
import { IUser } from "@/types/typeUser";
import { ThunkDispatch } from "@reduxjs/toolkit";
import { AnyAction } from "redux";

interface LayoutViewProps {
  children: React.ReactNode;
}

const drawerWidth: number = 240;

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
  const View: React.FC<LayoutViewProps> = ({ children }) => {
    const [showDrawer, setShowDrawer] = React.useState<boolean>(false);
    const [openManage, setOpenManage] = React.useState<boolean>(false);
    const [anchorEl, setAnchorEl] = React.useState<HTMLElement | null>(null);
    const showMenu: boolean = Boolean(anchorEl);
    const dispatch: ThunkDispatch<AppState, unknown, AnyAction> = useDispatch();
    const { accessToken, profile, isLoading }: { accessToken: string | null; profile: IUser | null; isLoading: boolean } = useSelector((state: AppState) => state.auth);
    const { showNotification } = useNotification();
    const router = useRouter();

    // React.useEffect(() => {
    //   const fetchProfile = async (): Promise<void> => {
    //     try {
    //       const response = await getProfileApi();
    //       if (!response || response.status === 401) {
    //         dispatch(signOutUser());
    //         showNotification("Phiên đăng nhập hết hạn!", "error");
    //         router.push("/sign-in");
    //         return;
    //       }
    //       const profileData: IUser = response?.data?.data as IUser;
    //       if (profileData) {
    //         dispatch(setProfile({ profile: profileData }));
    //         localStorage.setItem("User", JSON.stringify(profileData));
    //       }
    //     } catch (error: unknown) {
    //       console.error("Fetch user profile error:", error);
    //       showNotification("Không thể tải thông tin người dùng!", "error");
    //     }
    //   };

    //   const storedUser: string | null = localStorage.getItem("User");
    //   if (accessToken && !profile && !storedUser) {
    //     fetchProfile();
    //   }
    // }, [accessToken, profile, dispatch, router, showNotification]);

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
        showNotification("Đăng xuất thành công!", "success");
        router.push("/sign-in");
      } catch (error: unknown) {
        showNotification((error as Error).message || "Đăng xuất thất bại, vui lòng thử lại!", "error");
      }
    };

    return (
      <>
        <CssBaseline />
        <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
          <AppBar position="fixed" open={showDrawer} sx={{ backgroundColor: "white" }}>
            <Toolbar>
              <IconButton edge="start" color="primary" onClick={() => setShowDrawer(!showDrawer)} sx={{ mr: 2 }}>
                <MenuIcon />
              </IconButton>
              <Box sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                <Link href="/" passHref>
                  <Image src="/logo.png" alt="Logo" width={150} height={100} priority />
                </Link>
              </Box>
              {accessToken ? (
                <Box sx={{ display: "flex", alignItems: "center", ml: "auto" }}>
                  <Typography variant="body1" sx={{ mr: 1, fontWeight: 600, color: lightBlue[900] }}>
                    {profile?.contact?.fullname || "User"}
                  </Typography>
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
                    >
                      <ListItemIcon>
                        <PersonIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>Profile</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={handleLogout} disabled={isLoading}>
                      <ListItemIcon>
                        <LogoutIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>Logout</ListItemText>
                    </MenuItem>
                  </Menu>
                </Box>
              ) : (
                <Box sx={{ display: "flex", alignItems: "center", ml: "auto" }}>
                  <Link href="/sign-in" passHref>
                    <Typography variant="body1" sx={{ mr: 1, fontWeight: 600, color: lightBlue[500] }}>
                      Sign in
                    </Typography>
                  </Link>
                </Box>
              )}
            </Toolbar>
          </AppBar>
          <Box sx={{ display: "flex", flexGrow: 1 }}>
            <Drawer variant="permanent" open={showDrawer} sx={{ "& .MuiDrawer-paper": { bgcolor: lightBlue[900], color: "white" } }}>
              <DrawerHeader />
              <Divider />
              {accessToken && (
                <List>
                  <ListItem disablePadding sx={{ display: "block" }}>
                    <ListItemButton component={Link} href="/dashboard" onClick={() => setShowDrawer(false)}>
                      <ListItemIcon>
                        <DashboardIcon htmlColor="white" />
                      </ListItemIcon>
                      <ListItemText primary={"Dashboard"} />
                    </ListItemButton>
                    <ListItemButton component={Link} href="/bill" onClick={() => setShowDrawer(false)}>
                      <ListItemIcon>
                        <ReceiptIcon htmlColor="white" />
                      </ListItemIcon>
                      <ListItemText primary={"Bill"} />
                    </ListItemButton>
                  </ListItem>
                  <ListItemButton
                    onClick={() => {
                      setOpenManage(!openManage);
                      setShowDrawer(true);
                    }}
                  >
                    <ListItemIcon>
                      <DatasetIcon htmlColor="white" />
                    </ListItemIcon>
                    <ListItemText primary="Quản lý" />
                    {openManage ? <ExpandLessIcon htmlColor="white" /> : <ExpandMoreIcon htmlColor="white" />}
                  </ListItemButton>
                  <Collapse in={openManage} timeout="auto" unmountOnExit>
                    <List component="div" disablePadding>
                      <ListItemButton
                        sx={{ pl: 4 }}
                        component={Link}
                        href="/manager/orders"
                        onClick={() => {
                          setShowDrawer(false);
                          setOpenManage(false);
                        }}
                      >
                        <ListItemIcon>
                          <SubtitlesIcon htmlColor="white" />
                        </ListItemIcon>
                        <ListItemText primary="Đơn Hàng" />
                      </ListItemButton>
                      <ListItemButton
                        sx={{ pl: 4 }}
                        component={Link}
                        href="/manager/users"
                        onClick={() => {
                          setShowDrawer(false);
                          setOpenManage(false);
                        }}
                      >
                        <ListItemIcon>
                          <PersonIcon htmlColor="white" />
                        </ListItemIcon>
                        <ListItemText primary="Tài khoản" />
                      </ListItemButton>
                      <ListItemButton
                        sx={{ pl: 4 }}
                        component={Link}
                        href="/manager/partners"
                        onClick={() => {
                          setShowDrawer(false);
                          setOpenManage(false);
                        }}
                      >
                        <ListItemIcon>
                          <BusinessIcon htmlColor="white" />
                        </ListItemIcon>
                        <ListItemText primary="Đối Tác" />
                      </ListItemButton>
                    </List>
                  </Collapse>
                </List>
              )}
            </Drawer>
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
    <ReduxProvider>
      <NotificationProvider>
        <ProtectedRoute>
          <ThemeProvider theme={customTheme}>
            <View>{children}</View>
          </ThemeProvider>
        </ProtectedRoute>
      </NotificationProvider>
    </ReduxProvider>
  );
};

export default LayoutView;
