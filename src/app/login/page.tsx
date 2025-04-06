"use client";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "@/store/reducers/authReducer";
import { AppState } from "@/store";
import Image from "next/image";
import { Button, CircularProgress, Container } from "@mui/material";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useNotification } from "@/contexts/NotificationProvider";
import { useRouter } from "next/navigation";
import * as Yup from "yup";

// Validation schema
const LoginSchema = Yup.object().shape({
  email: Yup.string().email("Email không hợp lệ").required("Bắt buộc"),
  password: Yup.string().min(6, "Mật khẩu phải dài hơn 6 ký tự").required("Bắt buộc"),
});

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "" });
  const router = useRouter();
  const { isLoading, accessToken } = useSelector((state: AppState) => state.auth); // Giả định token trong Redux
  const dispatch = useDispatch();
  const { showNotification } = useNotification();

  // Chuyển hướng nếu đã đăng nhập
  useEffect(() => {
    if (accessToken) {
      router.push("/dashboard");
    }
  }, [accessToken, router]);

  const validateForm = async () => {
    try {
      await LoginSchema.validate({ email, password }, { abortEarly: false });
      setErrors({ email: "", password: "" });
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

  const handleLogin = async (e?: React.FormEvent) => {
    e?.preventDefault();

    const isValid = await validateForm();
    if (!isValid) {
      showNotification("Vui lòng kiểm tra thông tin nhập!", "warning");
      return;
    }

    try {
      const result = await dispatch(loginUser({ email, password }) as any);
      if (loginUser.fulfilled.match(result)) {
        showNotification("Đăng nhập thành công!", "success");
        router.push("/dashboard");
      } else {
        throw new Error(result.payload?.message || "Đăng nhập thất bại");
      }
    } catch (error: any) {
      showNotification(error.message || "Đăng nhập thất bại, vui lòng thử lại!", "error");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleLogin();
    }
  };

  return (
    <Container maxWidth="lg" sx={{ padding: "0" }}>
      <div className="flex flex-col items-center justify-center min-h-screen">
        <form className="w-full max-w-[500px] p-6 flex flex-col items-center justify-center bg-white rounded shadow-md border border-blue-400">
          <div className="flex flex-col justify-center items-center">
            <Image src="/logo-04.png" alt="Logo" width={150} height={100} />
          </div>
          <TextField
            className="mb-2 w-full"
            margin="dense"
            size="small"
            type="text"
            label="Email"
            placeholder="Email"
            fullWidth
            variant="outlined"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
            error={!!errors.email}
            helperText={errors.email}
          />
          <TextField
            className="mb-2 w-full"
            margin="dense"
            label="Password"
            size="small"
            value={password}
            placeholder="Password"
            type={showPassword ? "text" : "password"}
            onKeyDown={handleKeyDown}
            onChange={(e) => setPassword(e.target.value)}
            error={!!errors.password}
            helperText={errors.password}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label={showPassword ? "hide the password" : "display the password"}
                    onClick={() => setShowPassword((show) => !show)}
                    onMouseDown={(e) => e.preventDefault()}
                    onMouseUp={(e) => e.preventDefault()}
                    edge="end"
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Button type="button" className="font-bold capitalize" color="primary" variant="contained" disabled={isLoading} onClick={handleLogin}>
            {isLoading ? <CircularProgress size={24} /> : "Login"}
          </Button>
        </form>
      </div>
    </Container>
  );
}
