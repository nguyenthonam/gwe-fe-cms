import { IconButton, ListItemIcon, Menu, MenuItem, Tooltip } from "@mui/material";
import { MoreVert as MoreVertIcon, Edit as EditIcon, Key as ResetPasswordIcon, Lock as LockIcon, LockOpen as LockOpenIcon, Delete as DeleteIcon } from "@mui/icons-material";
import React, { useState } from "react";
import { grey, orange, red } from "@mui/material/colors";
import { ERECORD_STATUS } from "@/types/typeGlobals";

interface ActionMenuProps {
  onEdit?: () => void;
  onLockUnlock?: () => void;
  onDelete?: () => void;
  onResetPassword?: () => void;
  status?: ERECORD_STATUS;
  // Flexible disable controls for each action
  disabledEdit?: boolean;
  disabledLockUnlock?: boolean;
  disabledDelete?: boolean;
  disabledResetPassword?: boolean;
}

export const ActionMenu: React.FC<ActionMenuProps> = ({
  onEdit,
  onLockUnlock,
  onDelete,
  onResetPassword,
  status,
  disabledEdit = false,
  disabledLockUnlock = false,
  disabledDelete = false,
  disabledResetPassword = false,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton size="small" onClick={handleClick}>
        <MoreVertIcon fontSize="small" />
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{ sx: { minWidth: 40, paddingY: 0.5 } }}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        {onEdit && (
          <MenuItem
            onClick={() => {
              handleClose();
              if (!disabledEdit) onEdit();
            }}
            disabled={disabledEdit}
            sx={{ display: "flex", justifyContent: "center", minWidth: 0 }}
          >
            <Tooltip title={disabledEdit ? "Cannot edit when record is locked or deleted." : "Edit"} placement="right">
              <ListItemIcon sx={{ minWidth: 32 }}>
                <EditIcon fontSize="small" sx={{ color: grey[600] }} />
              </ListItemIcon>
            </Tooltip>
          </MenuItem>
        )}

        {onResetPassword && (
          <MenuItem
            onClick={() => {
              handleClose();
              if (!disabledResetPassword) onResetPassword();
            }}
            disabled={disabledResetPassword}
            sx={{ display: "flex", justifyContent: "center", minWidth: 0 }}
          >
            <Tooltip title={disabledResetPassword ? "Action not available." : "Reset password"} placement="right">
              <ListItemIcon sx={{ minWidth: 32 }}>
                <ResetPasswordIcon fontSize="small" sx={{ color: orange[500] }} />
              </ListItemIcon>
            </Tooltip>
          </MenuItem>
        )}

        {onLockUnlock && (
          <MenuItem
            onClick={() => {
              handleClose();
              if (!disabledLockUnlock) onLockUnlock();
            }}
            disabled={disabledLockUnlock}
            sx={{ display: "flex", justifyContent: "center", minWidth: 0 }}
          >
            <Tooltip title={disabledLockUnlock ? "Cannot lock/unlock when record is deleted." : status === ERECORD_STATUS.Locked ? "Unlock" : "Lock"} placement="right">
              <ListItemIcon sx={{ minWidth: 32 }}>
                {status === ERECORD_STATUS.Locked ? <LockOpenIcon fontSize="small" sx={{ color: orange[600] }} /> : <LockIcon fontSize="small" sx={{ color: red[500] }} />}
              </ListItemIcon>
            </Tooltip>
          </MenuItem>
        )}

        {onDelete && (
          <MenuItem
            onClick={() => {
              handleClose();
              if (!disabledDelete) onDelete();
            }}
            disabled={disabledDelete}
            sx={{ display: "flex", justifyContent: "center", minWidth: 0 }}
          >
            <Tooltip title={disabledDelete ? "Cannot delete when record is locked or deleted." : "Delete"} placement="right">
              <ListItemIcon sx={{ minWidth: 32 }}>
                <DeleteIcon fontSize="small" sx={{ color: red[600] }} />
              </ListItemIcon>
            </Tooltip>
          </MenuItem>
        )}
      </Menu>
    </>
  );
};
