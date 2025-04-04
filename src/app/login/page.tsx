"use client";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "@/store/reducers/authReducer";
import { AppState } from "@/store";
import Image from "next/image";
import { Button, CircularProgress } from "@mui/material";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useNotification } from "@/contexts/NotificationProvider";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { isLoading } = useSelector((state: AppState) => state.auth);
  const dispatch = useDispatch();
  const { showNotification } = useNotification();

  const handleLogin = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!email || !password) {
      showNotification("Hãy nhập đầy đủ thông tin!", "warning");
      return false;
    }

    try {
      const result = await dispatch(loginUser({ email, password }) as any);
      if (loginUser.fulfilled.match(result)) {
        showNotification("Đăng nhập thành công!", "success");
        router.push("/dashboard");
      } else {
        throw Error("Đăng nhập thất bại, vui lòng thử lại!");
      }
    } catch (error) {
      showNotification("Đăng nhập thất bại, vui lòng thử lại!", "error");
    }
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e?.preventDefault();
      handleLogin();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <form className="w-full max-w-[500px] p-6 flex flex-col items-center justify-center  bg-white rounded shadow-md border border-blue-400">
        <div className="flex flex-col justify-center items-center">
          {/* <h1 className="text-blue-400 text-[32px] font-bold mb-4">Login</h1> */}
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
        <Button type="button" className="font-bold capitalize" color="primary" variant="contained" disabled={!email || !password || isLoading} onClick={handleLogin}>
          {isLoading ? <CircularProgress size={24} /> : "Login"}
        </Button>
      </form>
    </div>
  );
}
