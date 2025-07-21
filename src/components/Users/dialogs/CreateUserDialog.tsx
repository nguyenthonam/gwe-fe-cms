import { useState } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button } from "@mui/material";
import { lightBlue } from "@mui/material/colors";
import { createUserApi } from "@/utils/apis/apiUser";
import { useNotification } from "@/contexts/NotificationProvider";

export default function CreateUserDialog({ open, onClose, onSuccess }: { open: boolean; onClose: () => void; onSuccess: () => void }) {
  const [user, setUser] = useState({ email: "", fullname: "" });
  const [isLoading, setLoading] = useState(false);
  const { showNotification } = useNotification();

  const handleCreateUser = async () => {
    try {
      setLoading(true);
      const response = await createUserApi({
        email: user.email,
        contact: { fullname: user.fullname },
      });
      if (!response?.data?.status) {
        showNotification(response?.data?.message || "Failed to create user!", "error");
        return;
      }
      onSuccess();
      showNotification("User created successfully!", "success");
    } catch (error) {
      console.error("Create user error:", error);
      showNotification(error instanceof Error ? error.message : "Failed to create user!", "error");
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle className="uppercase" sx={{ color: lightBlue[500] }}>
        Create User
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
          value={user.fullname}
          onChange={(e) => setUser((prev) => ({ ...prev, fullname: e.target.value }))}
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
          value={user.email}
          onChange={(e) => setUser((prev) => ({ ...prev, email: e.target.value }))}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary" disabled={isLoading}>
          Cancel
        </Button>
        <Button onClick={handleCreateUser} color="primary" disabled={isLoading}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
