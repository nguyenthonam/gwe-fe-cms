import { IconButton, ListItemIcon, Menu, MenuItem } from "@mui/material";
import { MoreVert as MoreVertIcon, Edit as EditIcon, Lock as LockIcon, LockOpen as LockOpenIcon } from "@mui/icons-material";
import React, { useState } from "react";
import { grey, orange, red } from "@mui/material/colors";
import { ERECORD_STATUS } from "@/types/typeGlobals";

interface ActionMenuProps {
  onEdit: () => void;
  onLockUnlock: () => void;
  status: ERECORD_STATUS | undefined;
}

export const ActionMenu: React.FC<ActionMenuProps> = ({ onEdit, onLockUnlock, status }) => {
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
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <MenuItem
          onClick={() => {
            handleClose();
            onEdit();
          }}
        >
          <ListItemIcon sx={{ minWidth: "20px" }}>
            <EditIcon fontSize="small" sx={{ color: grey[500] }} />
          </ListItemIcon>
        </MenuItem>
        <MenuItem
          onClick={() => {
            handleClose();
            onLockUnlock();
          }}
        >
          <ListItemIcon>{status === ERECORD_STATUS.Locked ? <LockOpenIcon fontSize="small" sx={{ color: orange[500] }} /> : <LockIcon fontSize="small" sx={{ color: red[500] }} />}</ListItemIcon>
        </MenuItem>
      </Menu>
    </>
  );
};
