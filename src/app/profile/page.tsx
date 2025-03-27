"use client";

import { useState, useEffect } from "react";
import { Container, TextField, Box, Typography, IconButton, Grid, Paper, Divider, MenuItem, Select, InputAdornment } from "@mui/material";
import { Save as SaveIcon, Edit as EditIcon, Visibility as VisibilityIcon, VisibilityOff as VisibilityOffIcon } from "@mui/icons-material";
import { orange, lightBlue } from "@mui/material/colors";
import { getProfileApi, updatePasswordProfileApi, updateProfileApi } from "@/utils/apis/apiProfile";
import { useNotification } from "@/contexts/NotificationProvider";
import { IUpdatePasswordRequest, IUpdateProfileRequest } from "@/types/apis/typeProfileApi";
import { COUNTRIES } from "@/utils/constants";
import { ICountry, IUser } from "@/types";
import { useDispatch } from "react-redux";
import { setProfile, logout } from "@/store/reducers/authReducer";

interface IPasswordChange {
  oldPassword: string;
  newPassword: string;
}

const countriesList: ICountry[] = [{ code: "", name: "" }, ...COUNTRIES];

export default function ProfilePage() {
  const [user, setUser] = useState<IUser>({
    userId: "",
    email: "",
    fullname: "",
    phone: "",
    address: "",
    province: "",
    state: "",
    country: { code: "", name: "" },
  });

  const [isUpdated, setIsUpdated] = useState(false);
  const [editField, setEditField] = useState<keyof IUser | null>(null);
  const [password, setPassword] = useState<IPasswordChange>({ oldPassword: "", newPassword: "" });
  const [showPassword, setShowPassword] = useState({
    oldPassword: false,
    newPassword: false,
  });
  const [editPassword, setEditPassword] = useState(false);
  const { showNotification } = useNotification();
  const dispatch = useDispatch();

  useEffect(() => {
    // Refresh user data after successful update
    console.log("Refresh user data", isUpdated);
    const fetchProfile = async () => {
      try {
        const response = await getProfileApi();
        if (!response || response.status === 401) {
          dispatch(logout());
          window.location.reload();
        }
        const profile = response?.data?.data as IUser;
        if (profile) {
          setUser(profile);
          dispatch(setProfile({ profile: profile }));
        }
      } catch (error) {
        console.error("Fetch user profile error:", error);
      }
    };
    fetchProfile();
  }, [isUpdated]);

  const handleEditClick = (field: keyof IUser) => setEditField(field);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword({ ...password, [e.target.name]: e.target.value });
  };
  const handleClickShowPassword = (field: "oldPassword" | "newPassword") => {
    setShowPassword((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };
  const handlePasswordSave = async () => {
    try {
      const payload: IUpdatePasswordRequest = { pwd: password.oldPassword, newPassword: password.newPassword };
      const response = await updatePasswordProfileApi(payload);

      if (!response?.data?.status) {
        showNotification(response?.data?.message || "Cập nhật thất bại!", "error");
        return;
      }

      showNotification("Cập nhật thành công!", "success");
      setIsUpdated(!isUpdated);
    } catch (error) {
      console.error("Update user error:", error);
      showNotification(error instanceof Error ? error.message : "Cập nhật thất bại!", "error");
    } finally {
      setPassword({ oldPassword: "", newPassword: "" });
      setEditPassword(false);
    }
  };
  const handleCountryChange = (e: any) => {
    const selectedCountry = countriesList.find((c) => c.code === e.target.value);
    console.log("selectedCountry", selectedCountry);
    if (selectedCountry) {
      setUser({ ...user, country: selectedCountry || { code: "", name: "" } });
    }
  };
  const handleUpdateProfile = async (field: keyof IUser) => {
    try {
      const payload: IUpdateProfileRequest = { [field]: user[field] };
      const response = await updateProfileApi(payload);

      if (!response?.data?.status) {
        showNotification(response?.data?.message || "Cập nhật thất bại!", "error");
        return;
      }

      showNotification("Cập nhật thành công!", "success");
      setIsUpdated(!isUpdated);
    } catch (error) {
      console.error("Update user error:", error);
      showNotification(error instanceof Error ? error.message : "Cập nhật thất bại!", "error");
    } finally {
      setEditField(null);
    }
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom sx={{ textAlign: "center", fontWeight: "bold", mb: 3, color: lightBlue[700] }}>
        User Profile
      </Typography>

      <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: "bold", color: orange[600], mb: 1 }}>
          Personal Information
        </Typography>

        <Grid container spacing={2}>
          {(["userId", "email"] as const).map((field) => (
            <Grid item xs={12} sm={6} key={field} container alignItems="center">
              <Grid item xs={3}>
                <Typography variant="body2" sx={{ color: lightBlue[500], fontWeight: "bold" }}>
                  {field.charAt(0).toUpperCase() + field.slice(1)}:
                </Typography>
              </Grid>
              <Grid item xs={9}>
                <Typography variant="body2">{user[field]}</Typography>
              </Grid>
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ my: 1 }} />

        <Typography variant="h6" sx={{ fontWeight: "bold", color: orange[600], mb: 1 }}>
          Contact Information
        </Typography>

        {(["fullname", "phone", "address", "province", "state"] as const).map((field) => (
          <Grid height={"36px"} item xs={12} key={field} container alignItems="center" sx={{ mb: 1 }}>
            <Grid item xs={2}>
              <Typography variant="body2" sx={{ color: lightBlue[500], fontWeight: "bold" }}>
                {field.charAt(0).toUpperCase() + field.slice(1)}:
              </Typography>
            </Grid>
            <Grid item xs={9}>
              {editField === field ? (
                <TextField
                  fullWidth
                  size="small"
                  sx={{
                    "& .MuiInputBase-root": {
                      fontSize: "14px",
                      padding: "0",
                    },
                    "& .MuiInputBase-input": {
                      padding: "8px 10px 6px 10px",
                    },
                  }}
                  name={field}
                  value={user[field]}
                  onChange={handleChange}
                  autoFocus
                />
              ) : (
                <Typography variant="body2">{user[field]}</Typography>
              )}
            </Grid>
            <Grid item xs={1}>
              <IconButton
                size="small"
                onClick={() => (editField === field ? handleUpdateProfile(field) : handleEditClick(field))}
                sx={{
                  color: editField === field ? "green" : "gray",
                  padding: "4px", // Add padding instead of size
                  "& .MuiSvgIcon-root": {
                    fontSize: "20px",
                  },
                }}
              >
                {editField === field ? <SaveIcon /> : <EditIcon />}
              </IconButton>
            </Grid>
          </Grid>
        ))}
        {/* Country */}
        <Grid height={"36px"} item xs={12} container alignItems="center" sx={{ mb: 1 }}>
          <Grid item xs={2}>
            <Typography variant="body2" sx={{ color: lightBlue[500], fontWeight: "bold" }}>
              Country:
            </Typography>
          </Grid>
          <Grid item xs={9}>
            {editField === "country" ? (
              <Select
                fullWidth
                size="small"
                sx={{
                  "& .MuiSelect-select": {
                    fontSize: "14px",
                    padding: "8px 4px 4px 6px",
                  },
                }}
                value={user.country?.code || ""}
                onChange={handleCountryChange}
              >
                {countriesList.map((country) => (
                  <MenuItem key={country.code} value={country.code}>
                    {country.name}
                  </MenuItem>
                ))}
              </Select>
            ) : (
              <Typography variant="body2">{user.country?.name}</Typography>
            )}
          </Grid>
          <Grid item xs={1}>
            <IconButton
              onClick={() => (editField === "country" ? handleUpdateProfile("country") : handleEditClick("country"))}
              sx={{
                color: editField === "country" ? "green" : "gray",
                padding: "4px", // Add padding instead of size
                "& .MuiSvgIcon-root": {
                  fontSize: "20px",
                },
              }}
            >
              {editField === "country" ? <SaveIcon /> : <EditIcon />}
            </IconButton>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" sx={{ fontWeight: "bold", color: orange[600], mb: 1 }}>
          Security
        </Typography>

        <Grid item xs={12} container alignItems="top">
          <Grid item xs={2}>
            <Typography variant="body2" sx={{ color: lightBlue[500], fontWeight: "bold" }}>
              Password:
            </Typography>
          </Grid>
          <Grid item xs={9}>
            {editPassword ? (
              <Box sx={{ mt: "-4px" }}>
                <TextField
                  fullWidth
                  size="small"
                  name="oldPassword"
                  label="Old Password"
                  type={showPassword.oldPassword ? "text" : "password"}
                  value={password.oldPassword}
                  sx={{ mb: 1 }}
                  onChange={handlePasswordChange}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton aria-label="toggle password visibility" onClick={() => handleClickShowPassword("oldPassword")} edge="end" size="small">
                          {showPassword.oldPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  size="small"
                  fullWidth
                  label="New Password"
                  type={showPassword.newPassword ? "text" : "password"}
                  name="newPassword"
                  value={password.newPassword}
                  sx={{ mb: 1 }}
                  onChange={handlePasswordChange}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton aria-label="toggle password visibility" onClick={() => handleClickShowPassword("newPassword")} edge="end" size="small">
                          {showPassword.newPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
            ) : (
              <Typography variant="body2">******</Typography>
            )}
          </Grid>
          <Grid item xs={1} container alignItems="center">
            <IconButton
              onClick={() => (editPassword ? handlePasswordSave() : setEditPassword(true))}
              sx={{
                color: editPassword ? "green" : "gray",
                padding: "4px", // Add padding instead of size
                "& .MuiSvgIcon-root": {
                  fontSize: "20px",
                },
              }}
            >
              {editPassword ? <SaveIcon /> : <EditIcon />}
            </IconButton>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
}
