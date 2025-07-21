import { useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from "@mui/material";
import { lightBlue } from "@mui/material/colors";
import { updateUserApi } from "@/utils/apis/apiUser";
import { useNotification } from "@/contexts/NotificationProvider";
import { IUpdateUserRequest, IUser } from "@/types/typeUser";

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
    if (data && data._id) {
      setUser({
        email: data.email,
        companyId: typeof data.companyId === "object" ? data.companyId?.name : data.companyId,
        contact: data.contact,
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
      if (!user || !data?._id) throw new Error("User not found!");
      console.log("Payload:", user);
      const response = await updateUserApi(data._id, user);
      if (!response?.data?.status) {
        showNotification(response?.data?.message || "Failed to update user!", "error");
        return;
      }
      onSuccess();
      showNotification("User updated successfully!", "success");
    } catch (error) {
      console.error("Update user error:", error);
      showNotification(error instanceof Error ? error.message : "Failed to update user!", "error");
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle className="uppercase" sx={{ color: lightBlue[500] }}>
        Update User
      </DialogTitle>
      <DialogContent>
        <TextField
          className="mb-2 w-full"
          margin="dense"
          size="small"
          type="text"
          label="Full Name"
          placeholder="Enter full name"
          fullWidth
          variant="outlined"
          value={user?.contact?.fullname || ""}
          onChange={(e) =>
            setUser((prev) =>
              prev
                ? {
                    ...prev,
                    contact: { ...prev.contact, fullname: e.target.value },
                  }
                : undefined
            )
          }
        />
        <TextField
          className="mb-2 w-full"
          margin="dense"
          size="small"
          type="text"
          label="Email"
          placeholder="Enter email"
          fullWidth
          variant="outlined"
          value={user?.email || ""}
          onChange={(e) =>
            setUser((prev) =>
              prev
                ? {
                    ...prev,
                    email: e.target.value,
                  }
                : undefined
            )
          }
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
