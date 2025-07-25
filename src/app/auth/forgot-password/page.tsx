"use client";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { AppState } from "@/store";
import Image from "next/image";
import { Button, CircularProgress, Container, Typography } from "@mui/material";
import TextField from "@mui/material/TextField";
import { useNotification } from "@/contexts/NotificationProvider";
import { useRouter } from "next/navigation";
import * as Yup from "yup";
import { forgotPasswordApi } from "@/utils/apis/apiAuth";
import { lightBlue } from "@mui/material/colors";

// Validation schema
const AuthSchema = Yup.object().shape({
  email: Yup.string().email("Invalid email format").required("This field is required"),
});

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({ email: "" });
  const router = useRouter();
  const { isLoading, accessToken } = useSelector((state: AppState) => state.auth);
  const { showNotification } = useNotification();

  // Redirect if already logged in
  useEffect(() => {
    if (accessToken) {
      router.push("/dashboard");
    }
  }, [accessToken, router]);

  const validateForm = async () => {
    try {
      await AuthSchema.validate({ email }, { abortEarly: false });
      setErrors({ email: "" });
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

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();

    const isValid = await validateForm();
    if (!isValid) {
      showNotification("Please check your input!", "warning");
      return;
    }

    try {
      const res = await forgotPasswordApi({ email });
      if (!res) throw new Error("No response from server!");
      showNotification("Password reset request sent! Please check your email!", "success");
      return true;
    } catch (error: any) {
      showNotification(error.message || "No response from server!", "error");
      return false;
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
            Forgot Password
          </Typography>
          <TextField
            className="!mb-4 w-full"
            margin="dense"
            size="small"
            type="text"
            label="Email"
            placeholder="Enter your email"
            fullWidth
            variant="outlined"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
            error={!!errors.email}
            helperText={errors.email}
          />
          <Button type="button" className="font-bold capitalize" color="primary" variant="contained" disabled={isLoading} onClick={handleSubmit}>
            {isLoading ? <CircularProgress size={24} /> : "Send"}
          </Button>
        </form>
      </div>
    </Container>
  );
}
