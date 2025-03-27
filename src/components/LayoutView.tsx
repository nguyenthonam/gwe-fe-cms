"use client";
import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { styled, Theme, CSSObject } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import customTheme from "@/styles/MUI/customTheme"; // Đường dẫn tới theme.ts
import { lightBlue } from "@mui/material/colors";
import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";
import { Box, Drawer as MuiDrawer, Menu, MenuItem, Toolbar, Divider, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Collapse, Avatar, Typography, IconButton } from "@mui/material";
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
  Logout as LogoutIcon,
} from "@mui/icons-material";
import ReduxProvider from "@/components/ReduxProvider";
import { NotificationProvider, useNotification } from "@/contexts/NotificationProvider";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser, setProfile, logout } from "@/store/reducers/authReducer";
import { useRouter } from "next/navigation";
import { AppState } from "@/store";
import { getProfileApi } from "@/utils/apis/apiProfile";
import { IUser } from "@/types/typeUser";

interface IProps {
  children: React.ReactNode;
}

const drawerWidth = 240;

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

const DrawerHeader = styled("div")(({ theme }) => ({
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
  shouldForwardProp: (prop) => prop !== "open",
})<AppBarProps>(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
  transition: theme.transitions.create(["width", "margin"], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
}));

const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== "open" })(({ theme, open }) => ({
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

export default function LayoutView({ children }: IProps) {
  const View = ({ children }: IProps) => {
    const [showDrawer, setShowDrawer] = React.useState(false);
    const [openManage, setOpenManage] = React.useState(false); // Trạng thái mở rộng "Quản lý"
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const showMenu = Boolean(anchorEl);
    const dispatch = useDispatch();
    const { accessToken, profile } = useSelector((state: AppState) => state.auth);
    const { showNotification } = useNotification();
    const router = useRouter();

    React.useEffect(() => {
      // Refresh user data after successful update
      const fetchProfile = async () => {
        try {
          const response = await getProfileApi();
          if (!response || response.status === 401) {
            dispatch(logout());
            return false;
          }
          const profile = response?.data?.data as IUser;
          if (profile) {
            dispatch(setProfile({ profile: profile }));
          }
        } catch (error) {
          console.error("Fetch user profile error:", error);
        }
      };
      if (accessToken && !profile) {
        fetchProfile();
      }
    }, []);

    const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      setAnchorEl(event.currentTarget);
    };
    const handleMenuClose = () => {
      setAnchorEl(null);
    };
    const handleLogout = async () => {
      handleMenuClose();
      // Logout
      try {
        const result = await dispatch(logoutUser() as any);
        if (logoutUser.fulfilled.match(result)) {
          showNotification("Đăng xuất thành công!", "success");
          router.push("/login");
        } else {
          throw Error("Đăng xuất thất bại, vui lòng thử lại!");
        }
      } catch (error) {
        showNotification("Đăng xuất thất bại, vui lòng thử lại!", "error");
      }
    };

    return (
      <>
        <CssBaseline />
        <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
          {/* <CssBaseline /> */}
          <AppBar position="fixed" open={showDrawer} sx={{ backgroundColor: "white" }}>
            <Toolbar>
              <IconButton edge="start" color="primary" onClick={() => setShowDrawer(!showDrawer)} sx={{ mr: 2 }}>
                <MenuIcon />
              </IconButton>

              {/* Logo - Click để về Home */}
              <Box sx={{ display: "flex", alignItems: "center", cursor: "pointer" }}>
                <Link href="/" passHref>
                  <Image src="/logo.png" alt="Logo" width={150} height={100} />
                </Link>
              </Box>

              {/* Avatar */}
              <Box sx={{ display: "flex", alignItems: "center", ml: "auto" }}>
                <Typography variant="body1" sx={{ mr: 1, fontWeight: 600, color: lightBlue[900] }}>
                  {profile?.fullname}
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
                  <MenuItem onClick={handleLogout}>
                    <ListItemIcon>
                      <LogoutIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Logout</ListItemText>
                  </MenuItem>
                </Menu>
              </Box>
            </Toolbar>
          </AppBar>

          <Box sx={{ display: "flex", flexGrow: 1 }}>
            <Drawer variant="permanent" open={showDrawer} sx={{ "& .MuiDrawer-paper": { bgcolor: lightBlue[900], color: "white" } }}>
              <DrawerHeader />
              <Divider />
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
                {/* Mục Quản lý (Dropdown) */}
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
                    {/* Quản lý Tài khoản */}
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

                    {/* Quản lý Công ty */}
                    <ListItemButton
                      sx={{ pl: 4 }}
                      component={Link}
                      href="/manager/companies"
                      onClick={() => {
                        setShowDrawer(false);
                        setOpenManage(false);
                      }}
                    >
                      <ListItemIcon>
                        <BusinessIcon htmlColor="white" />
                      </ListItemIcon>
                      <ListItemText primary="Công ty" />
                    </ListItemButton>
                  </List>
                </Collapse>
              </List>
            </Drawer>
            {/* Nội dung chính */},
            <Box component="main" sx={{ flexGrow: 1, display: "flex", flexDirection: "column", minHeight: "100vh" }}>
              <DrawerHeader />
              <Box component="div" sx={{ flexGrow: 1, p: 1 }}>
                {children}
              </Box>

              {/* Footer */}
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
}
