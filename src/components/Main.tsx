"use client";
import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { styled, Theme, CSSObject } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import customTheme from "@/styles/MUI/customTheme"; // Đường dẫn tới theme.ts
import Box from "@mui/material/Box";
import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MuiDrawer from "@mui/material/Drawer";
import MuiAppBar, { AppBarProps as MuiAppBarProps } from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ReceiptIcon from "@mui/icons-material/Receipt";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import PersonIcon from "@mui/icons-material/Person";
import LogoutIcon from "@mui/icons-material/Logout";
import { lightBlue } from "@mui/material/colors";
import { NotificationProvider } from "@/contexts/NotificationProvider";

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

export default function Main({ children }: IProps) {
  const [showDrawer, setShowDrawer] = React.useState(false);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const showMenu = Boolean(anchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <NotificationProvider>
      <ThemeProvider theme={customTheme}>
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
                  Admin
                </Typography>
                <IconButton onClick={handleMenuClick} sx={{ p: 0 }}>
                  <Avatar alt="User" sx={{ bgcolor: lightBlue[500] }}>
                    <AccountCircleIcon />
                  </Avatar>
                </IconButton>
                <Menu anchorEl={anchorEl} open={showMenu} onClose={handleMenuClose} sx={{ mt: 1 }}>
                  <MenuItem onClick={handleMenuClose}>
                    <ListItemIcon>
                      <PersonIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Profile</ListItemText>
                  </MenuItem>
                  <MenuItem onClick={handleMenuClose}>
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
      </ThemeProvider>
    </NotificationProvider>
  );
}
