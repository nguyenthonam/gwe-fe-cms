"use client";
import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  IconButton,
  Menu,
  Tooltip,
  MenuItem,
  Button,
  Box,
  Pagination,
  CircularProgress,
  Chip,
} from "@mui/material";
import { lightBlue, red, grey, orange, teal } from "@mui/material/colors";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import LockIcon from "@mui/icons-material/Lock";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import { IUser } from "@/types";
import { searchUserApi, deleteUserByIdApi, lockUserByIdApi, unlockUserByIdApi } from "@/utils/apis/apiUser";
import { useNotification } from "@/contexts/NotificationProvider";
import CreateUserDialog from "./dialogs/CreateUserDialog";
import UpdateUserDialog from "./dialogs/UpdateUserDialog";
import { ERECORD_STATUS } from "@/types/enums";

export default function UsersManagerComponent() {
  const [isUpdated, setIsUpdated] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const rowsPerPage = 2;
  const [totalPage, setTotalPage] = useState(1);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [data, setData] = useState<IUser[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
  const [dialogData, setDialogData] = useState<IUser | null>(null);
  const { showNotification } = useNotification();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await searchUserApi({
          page: page,
          perPage: rowsPerPage,
          keyword: search,
          status: "all", // TODO: for Admin
        });
        const result = await response?.data?.data;
        const metadata = result?.metaData;
        setData(result.data || []);
        setTotalPage(metadata.lastPage);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    const debounceFetch = setTimeout(fetchData, 500);
    return () => clearTimeout(debounceFetch);
  }, [page, rowsPerPage, search, isUpdated]);

  const handleMenuOpen = (event: any, id: any) => {
    setAnchorEl(event.currentTarget);
    setSelectedId(id);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedId(null);
  };

  const handleDeleteUser = async () => {
    try {
      setLoading(true);
      if (!selectedId) throw new Error("User not found!");
      const response = await deleteUserByIdApi(selectedId);
      if (!response?.data?.status) {
        showNotification(response?.data?.message || "Xoá thất bại!", "error");
        return;
      }
      setIsUpdated(!isUpdated);
      showNotification("Xoá thành công!", "success");
    } catch (error) {
      console.error("Delete user error:", error);
      showNotification(error instanceof Error ? error.message : "Xoá thất bại!", "error");
    } finally {
      handleMenuClose();
      setLoading(false);
    }
  };

  const handleLockUser = async () => {
    try {
      setLoading(true);
      if (!selectedId) {
        throw new Error("User ID is not valid!");
      }
      const response = await lockUserByIdApi(selectedId);
      if (!response?.data?.status) {
        showNotification(response?.data?.message || "Khoá thất bại!", "error");
        return;
      }
      setIsUpdated(!isUpdated);
      showNotification("Khoá thành công!", "success");
    } catch (error) {
      console.error("Block user error:", error);
      showNotification(error instanceof Error ? error.message : "Khoá thất bại!", "error");
    } finally {
      handleMenuClose();
      setLoading(false);
    }
  };

  const handleUnLockUser = async () => {
    try {
      setLoading(true);
      if (!selectedId) {
        throw new Error("User ID is not valid!");
      }
      const response = await unlockUserByIdApi(selectedId);
      if (!response?.data?.status) {
        showNotification(response?.data?.message || "Mở khoá thất bại!", "error");
        return;
      }
      setIsUpdated(!isUpdated);
      showNotification("Mở khoá thành công!", "success");
    } catch (error) {
      console.error("Block user error:", error);
      showNotification(error instanceof Error ? error.message : "Mở Khoá thất bại!", "error");
    } finally {
      handleMenuClose();
      setLoading(false);
    }
  };

  const handleOpenCreateDialog = () => {
    setDialogData(null); // Clear data for create dialog
    setOpenCreateDialog(true);
  };

  const handleOpenUpdateDialog = (user: IUser) => {
    setDialogData(user); // Pass user data for update dialog
    setOpenUpdateDialog(true);
  };

  return (
    <div>
      <h1 className="mb-4 uppercase" style={{ color: lightBlue[500], fontSize: "24px", fontWeight: "bold" }}>
        QUẢN LÝ TÀI KHOẢN
      </h1>
      <Box className="flex justify-between items-center mb-4">
        <TextField label="Search" variant="outlined" size="small" sx={{ minWidth: "300px" }} onChange={(e) => setSearch(e.target.value)} />
        <Button variant="contained" color="primary" onClick={handleOpenCreateDialog}>
          Thêm User
        </Button>
      </Box>

      {openCreateDialog && <CreateUserDialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} onSuccess={() => setIsUpdated(!isUpdated)} />}

      {openUpdateDialog && dialogData && <UpdateUserDialog open={openUpdateDialog} onClose={() => setOpenUpdateDialog(false)} data={dialogData} onSuccess={() => setIsUpdated(!isUpdated)} />}

      <TableContainer component={Paper} sx={{ marginBottom: "10px" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <CircularProgress size={20} />
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No data available
                </TableCell>
              </TableRow>
            ) : (
              data.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>{row.fullname}</TableCell>
                  <TableCell>{row.email}</TableCell>
                  <TableCell>
                    <Chip
                      label={
                        row.status === ERECORD_STATUS.Active
                          ? "Active"
                          : row.status === ERECORD_STATUS.NoActive
                          ? "No Active"
                          : row.status === ERECORD_STATUS.Deleted
                          ? "Deleted"
                          : row.status === ERECORD_STATUS.Locked
                          ? "Locked"
                          : "Unknown"
                      }
                      sx={{
                        fontWeight: "bold",
                        border: "2px solid",
                        backgroundColor: "white",
                        borderColor:
                          row.status === ERECORD_STATUS.Active
                            ? teal[800]
                            : row.status === ERECORD_STATUS.NoActive
                            ? grey[800]
                            : row.status === ERECORD_STATUS.Deleted
                            ? red[800]
                            : row.status === ERECORD_STATUS.Locked
                            ? orange[800]
                            : grey[800],
                        color:
                          row.status === ERECORD_STATUS.Active
                            ? teal[800]
                            : row.status === ERECORD_STATUS.NoActive
                            ? grey[800]
                            : row.status === ERECORD_STATUS.Deleted
                            ? red[800]
                            : row.status === ERECORD_STATUS.Locked
                            ? orange[800]
                            : grey[800],
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <IconButton disabled={row.status === ERECORD_STATUS.Deleted} onClick={(e) => handleMenuOpen(e, row.id)}>
                      <MoreVertIcon />
                    </IconButton>
                    <Menu anchorEl={anchorEl} open={Boolean(anchorEl && selectedId === row.id)} onClose={handleMenuClose}>
                      <MenuItem
                        onClick={() => {
                          handleOpenUpdateDialog(row);
                          handleMenuClose();
                        }}
                      >
                        <Tooltip title="Edit">
                          <EditIcon fontSize="small" sx={{ color: lightBlue[500] }} />
                        </Tooltip>
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          handleDeleteUser();
                          handleMenuClose();
                        }}
                      >
                        <Tooltip title="Delete">
                          <DeleteIcon fontSize="small" sx={{ color: red[500] }} />
                        </Tooltip>
                      </MenuItem>
                      {row.status === ERECORD_STATUS.Active && (
                        <MenuItem onClick={handleLockUser}>
                          <Tooltip title="Lock">
                            <LockIcon fontSize="small" sx={{ color: orange[500] }} />
                          </Tooltip>
                        </MenuItem>
                      )}
                      {row.status === ERECORD_STATUS.Locked && (
                        <MenuItem onClick={handleUnLockUser}>
                          <Tooltip title="Unlock">
                            <LockOpenIcon fontSize="small" sx={{ color: orange[500] }} />
                          </Tooltip>
                        </MenuItem>
                      )}
                    </Menu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {totalPage > 0 &&
        (isLoading ? (
          <Box className="flex justify-center">
            <CircularProgress size={20} />
          </Box>
        ) : (
          <Pagination
            count={totalPage}
            variant="outlined"
            shape="rounded"
            color="primary"
            page={page}
            disabled={isLoading || totalPage <= 1}
            onChange={(e, newPage) => setPage(newPage)}
            sx={{ "& .MuiPagination-ul": { justifyContent: "center" } }}
          />
        ))}
    </div>
  );
}
