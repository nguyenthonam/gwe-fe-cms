import { useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from "@mui/material";
import { lightBlue } from "@mui/material/colors";
import { updateUserApi, getUserByIdApi } from "@/utils/apis/apiUser";
import { useNotification } from "@/contexts/NotificationProvider";
import { IUser } from "@/types/typeUser";
import { IUpdateUserRequest } from "@/types/apis/typeUser.Api";

interface IProps {
  open: boolean;
  onClose: () => void;
  data: IUser | null;
  onSuccess: () => void;
}
export default function UpdateUserDialog({ open, onClose, data, onSuccess }: IProps) {
  const [user, setUser] = useState<IUpdateUserRequest>();
  const [isLoading, setLoading] = useState(false);
  const { showNotification } = useNotification();

  useEffect(() => {
    if (data && data.id) {
      setUser({
        id: data.id,
        email: data.email,
        fullname: data.fullname,
        phone: data.phone,
        company: data.company,
        address: data.address,
        province: data.province,
        state: data.state,
        country: data.country,
        avatar: data.avatar,
        identity_key: data.identity_key,
        role: data.role,
        status: data.status,
      });
    }
  }, [data]);

  const handleUpdateUser = async () => {
    try {
      setLoading(true);
      if (!user) throw new Error("User not found!");
      console.log("Payload:", user);
      const response = await updateUserApi(user);
      if (!response?.data?.status) {
        showNotification(response?.data?.message || "Cập nhật thất bại!", "error");
        return;
      }
      onSuccess();
      showNotification("Cập nhật thành công!", "success");
    } catch (error) {
      console.error("Update user error:", error);
      showNotification(error instanceof Error ? error.message : "Cập nhật thất bại!", "error");
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle className="uppercase" sx={{ color: lightBlue[500] }}>
        Cập Nhật Tài Khoản
      </DialogTitle>
      <DialogContent>
        <TextField
          className="mb-2 w-full"
          margin="dense"
          size="small"
          type="text"
          label="Họ và tên"
          placeholder="Họ và tên"
          fullWidth
          variant="outlined"
          value={user?.fullname}
          onChange={(e) => setUser((prev) => (prev ? { ...prev, fullname: e.target.value } : undefined))}
        />
        <TextField
          className="mb-2 w-full"
          margin="dense"
          size="small"
          type="text"
          label="Email"
          placeholder="Email"
          fullWidth
          variant="outlined"
          value={user?.email}
          onChange={(e) => setUser((prev) => (prev ? { ...prev, email: e.target.value } : undefined))}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary" disabled={isLoading}>
          Cancel
        </Button>
        <Button onClick={handleUpdateUser} color="primary" disabled={isLoading}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
