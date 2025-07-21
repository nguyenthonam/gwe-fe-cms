"use client";
import { useEffect, useState } from "react";
import { useNotification } from "@/contexts/NotificationProvider";
import { useRouter, useSearchParams } from "next/navigation";
import { Button, CircularProgress, Container, Typography, TextField, InputAdornment, IconButton } from "@mui/material";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import * as Yup from "yup";
import { lightBlue } from "@mui/material/colors";
import Image from "next/image";
import { resetPasswordApi } from "@/utils/apis/apiAuth";

// Validation schema
const ResetPasswordSchema = Yup.object().shape({
  newPassword: Yup.string().min(6, "Password must be at least 6 characters").required("New password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("newPassword")], "Passwords do not match")
    .required("Confirmation password is required"),
});

export default function ResetPasswordPage() {
  const [confirmKey, setConfirmKey] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({ newPassword: "", confirmPassword: "" });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showNotification } = useNotification();

  useEffect(() => {
    const key = searchParams.get("confirmKey") || "";
    setConfirmKey(key);
  }, [searchParams]);

  const validateForm = async () => {
    try {
      await ResetPasswordSchema.validate({ newPassword, confirmPassword }, { abortEarly: false });
      setErrors({ newPassword: "", confirmPassword: "" });
      return true;
    } catch (err: any) {
      const validationErrors: any = {};
      err.inner.forEach((error: any) => {
        validationErrors[error.path] = error.message;
      });
      setErrors(validationErrors);
      return false;
    }
  };

  const handleSubmit = async () => {
    const isValid = await validateForm();
    if (!isValid) {
      showNotification("Please check your password!", "warning");
      return;
    }

    setIsLoading(true);
    try {
      if (!confirmKey) throw new Error("Missing confirmation key!");
      const res = await resetPasswordApi({ newPassword, confirmKey });
      if (!res) throw new Error("An error occurred!");
      showNotification("Password reset successfully!", "success");
      router.push("/sign-in");
    } catch (error: any) {
      showNotification(error.message || "An error occurred!", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <Container maxWidth="lg" sx={{ padding: "0" }}>
      <div className="flex flex-col items-center justify-center min-h-screen">
        <form className="w-full max-w-[500px] p-6 flex flex-col items-center justify-center bg-white rounded shadow-md border border-blue-400">
          <div className="mb-4 flex flex-col justify-center items-center">
            <Image src="/icon.png" alt="Logo" width={80} height={50} priority />
          </div>
          <Typography variant="h4" gutterBottom sx={{ textAlign: "center", fontWeight: "normal", mb: 3, color: lightBlue[700] }}>
            Reset Password
          </Typography>

          {/* New Password */}
          <TextField
            className="!mb-4 w-full"
            type={showPassword ? "text" : "password"}
            label="New Password"
            variant="outlined"
            fullWidth
            size="small"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            error={!!errors.newPassword}
            helperText={errors.newPassword}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword((show) => !show)} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {/* Confirm Password */}
          <TextField
            className="!mb-4 w-full"
            type={showConfirmPassword ? "text" : "password"}
            label="Confirm New Password"
            variant="outlined"
            fullWidth
            size="small"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowConfirmPassword((show) => !show)} edge="end">
                    {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          {/* Submit Button */}
          <Button type="button" className="font-bold capitalize" color="primary" variant="contained" disabled={isLoading} onClick={handleSubmit}>
            {isLoading ? <CircularProgress size={24} /> : "Send"}
          </Button>
        </form>
      </div>
    </Container>
  );
}
