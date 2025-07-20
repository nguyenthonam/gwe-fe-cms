"use client";

import { useState, useEffect, useMemo } from "react";
import { Box, Button, Stack, TextField, Select, MenuItem, CircularProgress, Typography } from "@mui/material";
import { Add, Download } from "@mui/icons-material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import * as XLSX from "sheetjs-style";
import debounce from "lodash/debounce";
import { IUser } from "@/types/typeUser";
import { ERECORD_STATUS, EUSER_ROLES } from "@/types/typeGlobals";
import { useNotification } from "@/contexts/NotificationProvider";
import { EnumChip } from "@/components/Globals/EnumChip";
import { ActionMenu } from "@/components/Globals/ActionMenu";
import { searchUsersApi, deleteUserApi, lockUserApi, unlockUserApi, resetPasswordUserApi } from "@/utils/apis/apiUser";
import CreateUserDialog from "./CreateUserDialog";
import UpdateUserDialog from "./UpdateUserDialog";
import UserDetailDialog from "./UserDetailDialog";
import { getPartnersApi } from "@/utils/apis/apiPartner";

export default function UserManagerView() {
  const [users, setUsers] = useState<IUser[]>([]);
  const [keyword, setKeyword] = useState("");
  const [roleFilter, setRoleFilter] = useState<EUSER_ROLES | "">("");
  const [companyIdFilter, setCompanyIdFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | "all" | ERECORD_STATUS>("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [companies, setCompanies] = useState<any[]>([]);

  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [selected, setSelected] = useState<IUser | null>(null);

  const { showNotification } = useNotification();
  const debouncedSearch = useMemo(() => debounce((v) => setKeyword(v), 500), []);

  const fetchCompanies = async () => {
    try {
      const res = await getPartnersApi();
      setCompanies(res?.data?.data?.data || []);
    } catch (err) {
      console.error(err);
      showNotification("Không thể tải danh sách công ty", "error");
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await searchUsersApi({
        keyword,
        page: page + 1,
        perPage: pageSize,
        status: statusFilter,
        role: roleFilter || "",
        companyId: companyIdFilter,
      });
      setUsers(res?.data?.data?.data || []);
      setTotal(res?.data?.data?.meta?.total || 0);
    } catch (err) {
      console.error(err);
      showNotification("Không thể tải danh sách User", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
    fetchData();
  }, []);

  useEffect(() => {
    fetchData();
  }, [keyword, page, pageSize, roleFilter, companyIdFilter, statusFilter]);

  const handleLockToggle = async (item: IUser) => {
    try {
      if (!item._id) return;
      const confirm = window.confirm(item.status === ERECORD_STATUS.Active ? "Khoá tài khoản này?" : "Mở khoá tài khoản này?");
      if (!confirm) return;
      const res = item.status === ERECORD_STATUS.Active ? await lockUserApi(item._id) : await unlockUserApi(item._id);
      showNotification(res?.data?.message || "Cập nhật thành công", "success");
      fetchData();
    } catch (err: any) {
      showNotification(err.message || "Lỗi cập nhật trạng thái", "error");
    }
  };

  const handleResetPassword = async (item: IUser) => {
    if (!item._id) return;
    if (!window.confirm("Bạn có chắc muốn lấy lại mật khẩu tài khoản này?")) return;
    try {
      await resetPasswordUserApi(item._id);
      showNotification("Đã gửi mật khẩu mới tới Email thành công!", "success");
      fetchData();
    } catch (err: any) {
      console.error(err.message);
      showNotification(err.message || "Lỗi khi lấy lại mật khẩu!", "error");
    }
  };

  const handleDelete = async (item: IUser) => {
    if (!item._id) return;
    if (!window.confirm("Bạn có chắc muốn xoá tài khoản này?")) return;
    try {
      await deleteUserApi(item._id);
      showNotification("Đã xoá thành công", "success");
      fetchData();
    } catch (err: any) {
      showNotification(err.message || "Lỗi khi xoá", "error");
    }
  };

  const handleExportExcel = () => {
    const data = users.map((u) => ({
      "USER ID": u.userId,
      EMAIL: u.email,
      ROLE: u.role,
      COMPANY: typeof u.companyId === "object" ? u.companyId?.name : u.companyId,
      STATUS: u.status,
      CONTACT: u.contact?.fullname || "",
      GENDER: u.gender,
      BIRTHDAY: u.birthday ? new Date(u.birthday).toLocaleDateString("vi-VN") : "",
      "CREATED AT": u.createdAt ? new Date(u.createdAt).toLocaleDateString("vi-VN") : "",
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    ws["!cols"] = Object.keys(data[0]).map(() => ({ wch: 20 }));

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "USER_LIST");
    XLSX.writeFile(wb, "Danh_Sach_User.xlsx");
  };

  const columns: GridColDef[] = [
    {
      field: "userId",
      headerName: "USER ID",
      minWidth: 120,
      flex: 1,
      renderCell: ({ row }) => (
        <Box display="flex" alignItems="center" height="100%">
          <Typography
            color="primary"
            sx={{ cursor: "pointer", textDecoration: "underline" }}
            onClick={() => {
              setSelected(row);
              setOpenDetailDialog(true);
            }}
          >
            {row.userId}
          </Typography>
        </Box>
      ),
    },
    {
      field: "email",
      headerName: "EMAIL",
      minWidth: 180,
      flex: 1,
    },
    {
      field: "role",
      headerName: "ROLE",
      minWidth: 120,
      flex: 0.8,
      renderCell: ({ value }) => <EnumChip type="userRole" value={value} />,
    },
    {
      field: "companyId",
      headerName: "COMPANY",
      minWidth: 140,
      flex: 1,
      renderCell: ({ row }) => (typeof row.companyId === "object" ? row.companyId?.name : row.companyId),
    },
    {
      field: "contact",
      headerName: "LIÊN HỆ",
      minWidth: 160,
      flex: 1,
      renderCell: ({ row }) => row.contact?.name || "-",
    },
    {
      field: "status",
      headerName: "TRẠNG THÁI",
      minWidth: 120,
      flex: 0.7,
      renderCell: ({ value }) => <EnumChip type="recordStatus" value={value} />,
    },
    {
      field: "actions",
      headerName: "",
      width: 60,
      renderCell: ({ row }) => (
        <ActionMenu
          onEdit={() => {
            setSelected(row);
            setOpenUpdateDialog(true);
          }}
          onLockUnlock={() => handleLockToggle(row)}
          onDelete={() => handleDelete(row)}
          onResetPassword={() => handleResetPassword(row)}
          status={row.status}
        />
      ),
    },
  ];

  return (
    <Box className="space-y-4 p-6">
      <Box display="flex" flexWrap="wrap" gap={1} justifyContent="space-between" alignItems="center">
        <TextField placeholder="Tìm kiếm..." size="small" onChange={(e) => debouncedSearch(e.target.value)} sx={{ minWidth: 250 }} />
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<Download />} onClick={handleExportExcel}>
            Xuất Excel
          </Button>
          <Button variant="contained" startIcon={<Add />} onClick={() => setOpenCreateDialog(true)}>
            Tạo mới
          </Button>
        </Stack>
        <Stack direction="row" spacing={1} width={"100%"}>
          <Select size="small" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} displayEmpty sx={{ minWidth: 160 }}>
            <MenuItem value="">Tất cả Role</MenuItem>
            {Object.values(EUSER_ROLES).map((r) => (
              <MenuItem key={r} value={r}>
                <EnumChip type="userRole" value={r} />
              </MenuItem>
            ))}
          </Select>
          <Select size="small" value={companyIdFilter} onChange={(e) => setCompanyIdFilter(e.target.value)} displayEmpty sx={{ minWidth: 160 }}>
            <MenuItem value="">Tất cả Company</MenuItem>
            {companies.map((c) => (
              <MenuItem key={c._id} value={c._id}>
                {c.name}
              </MenuItem>
            ))}
          </Select>
          <Select size="small" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} displayEmpty sx={{ minWidth: 150 }}>
            <MenuItem value="">Mặc định</MenuItem>
            <MenuItem value="all">Tất cả</MenuItem>
            <MenuItem value={ERECORD_STATUS.Active}>Hoạt động</MenuItem>
            <MenuItem value={ERECORD_STATUS.Locked}>Đã khoá</MenuItem>
            <MenuItem value={ERECORD_STATUS.NoActive}>Không hoạt động</MenuItem>
            <MenuItem value={ERECORD_STATUS.Deleted}>Đã xoá</MenuItem>
          </Select>
        </Stack>
      </Box>
      {loading ? (
        <Box textAlign="center">
          <CircularProgress />
        </Box>
      ) : (
        <DataGrid
          rows={users.map((r) => ({ ...r, id: r._id }))}
          columns={columns}
          paginationMode="server"
          rowCount={total}
          pageSizeOptions={[10, 20, 50, 100]}
          paginationModel={{ page, pageSize }}
          onPaginationModelChange={({ page, pageSize }) => {
            setPage(page);
            setPageSize(pageSize);
          }}
          disableRowSelectionOnClick
          autoHeight
        />
      )}
      <CreateUserDialog
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
        onCreated={() => {
          fetchData();
          setOpenCreateDialog(false);
        }}
        companies={companies}
      />
      <UpdateUserDialog open={openUpdateDialog} onClose={() => setOpenUpdateDialog(false)} onUpdated={fetchData} companies={companies} user={selected} />
      <UserDetailDialog open={openDetailDialog} onClose={() => setOpenDetailDialog(false)} user={selected} />
    </Box>
  );
}
