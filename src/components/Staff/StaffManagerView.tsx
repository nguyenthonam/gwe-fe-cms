"use client";

import { useEffect, useMemo, useState } from "react";
import { Box, Button, Paper, TextField, Typography, CircularProgress, MenuItem, Select, Stack } from "@mui/material";
import { Add, Download } from "@mui/icons-material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import debounce from "lodash/debounce";
import { ActionMenu } from "@/components/Globals/ActionMenu";
import { useNotification } from "@/contexts/NotificationProvider";
import { StatusChip } from "../Globals/StatusChip";
import { IUser } from "@/types/typeUser";
import { ERECORD_STATUS, EUSER_ROLES } from "@/types/typeGlobals";
import { searchUsersApi, lockUserApi, unlockUserApi, deleteUserApi } from "@/utils/apis/apiUser";
import * as XLSX from "sheetjs-style";
import CreateStaffDialog from "./CreateStaffDialog";
import UpdateStaffDialog from "./UpdateStaffDialog";

export default function StaffManagerView() {
  const [staffs, setStaffs] = useState<IUser[]>([]);
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | "all" | ERECORD_STATUS>("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);

  const { showNotification } = useNotification();

  const debouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        setPage(0);
        setKeyword(value);
      }, 500),
    []
  );

  const fetchStaffs = async () => {
    try {
      setLoading(true);
      const res = await searchUsersApi({
        keyword,
        page: page + 1,
        perPage: pageSize,
        status: statusFilter,
        role: EUSER_ROLES.Partner,
      });
      setStaffs(res?.data?.data?.data || []);
      setTotal(res?.data?.data?.meta?.total || 0);
    } catch (error) {
      console.error("Failed to fetch staffs", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaffs();
  }, [page, pageSize, statusFilter, keyword]);

  const handleLockToggle = async (staff: IUser) => {
    try {
      if (!staff?.id) return;
      const confirm = window.confirm(staff.status === ERECORD_STATUS.Active ? "Khoá nhân viên này?" : "Mở khoá nhân viên này?");
      if (!confirm) return;

      const res = staff.status === ERECORD_STATUS.Active ? await lockUserApi(staff.id) : await unlockUserApi(staff.id);
      showNotification(res?.data?.message || "Cập nhật thành công", "success");
      fetchStaffs();
    } catch (err: any) {
      showNotification(err.message || "Lỗi cập nhật trạng thái", "error");
    }
  };

  const handleDelete = async (staff: IUser) => {
    if (!staff.id) return;
    if (!window.confirm("Bạn có chắc muốn xoá nhân viên này?")) return;
    try {
      await deleteUserApi(staff.id);
      showNotification("Đã xoá thành công", "success");
      fetchStaffs();
    } catch (err: any) {
      showNotification(err.message || "Lỗi khi xoá nhân viên", "error");
    }
  };

  const handleExportExcel = () => {
    const data = staffs.map((s) => ({
      ID: s.userId || "",
      "HỌ TÊN": s.contact?.fullname || "",
      EMAIL: s.email || "",
      SĐT: s.contact?.phone || "",
      "GIỚI TÍNH": s.gender || "",
      "TRẠNG THÁI": s.status || "",
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    ws["!cols"] = Object.keys(data[0]).map(() => ({ wch: 20 }));

    const range = XLSX.utils.decode_range(ws["!ref"] || "");
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cell = XLSX.utils.encode_cell({ r: R, c: C });
        if (!ws[cell]) continue;
        const isHeader = R === 0;
        (ws[cell] as any).s = {
          font: { bold: isHeader, sz: isHeader ? 12 : 11 },
          alignment: { horizontal: isHeader ? "center" : "left", vertical: "center" },
          border: {
            top: { style: "thin", color: { auto: 1 } },
            bottom: { style: "thin", color: { auto: 1 } },
            left: { style: "thin", color: { auto: 1 } },
            right: { style: "thin", color: { auto: 1 } },
          },
        };
      }
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "BẢNG NHÂN VIÊN");
    XLSX.writeFile(wb, "BANG_NHAN_VIEN.xlsx");
  };

  const handleCreated = () => {
    setOpenCreateDialog(false);
    fetchStaffs();
  };

  const handleUpdated = () => {
    setOpenUpdateDialog(false);
    setSelectedUser(null);
    fetchStaffs();
  };

  const columns: GridColDef[] = [
    { field: "userId", headerName: "ID", width: 120 },
    { field: "fullname", headerName: "HỌ TÊN", width: 200, renderCell: ({ row }: { row: IUser }) => row.contact?.fullname || "" },
    { field: "email", headerName: "EMAIL", width: 220 },
    { field: "phone", headerName: "SĐT", width: 150, renderCell: ({ row }: { row: IUser }) => row.contact?.phone || "" },
    { field: "gender", headerName: "GIỚI TÍNH", width: 120 },
    {
      field: "status",
      headerName: "TRẠNG THÁI",
      width: 130,
      renderCell: ({ value }) => <StatusChip status={value} />,
    },
    {
      field: "actions",
      headerName: "",
      width: 60,
      renderCell: ({ row }) => (
        <ActionMenu
          onEdit={() => {
            setSelectedUser(row);
            setOpenUpdateDialog(true);
          }}
          onLockUnlock={() => handleLockToggle(row)}
          onDelete={() => handleDelete(row)}
          status={row.status}
        />
      ),
    },
  ];

  return (
    <Box>
      <Box mb={2} display="flex" gap={2} alignItems="center" justifyContent="space-between">
        <TextField placeholder="Tìm nhân viên..." size="small" className="max-w-[250px] w-full" onChange={(e) => debouncedSearch(e.target.value)} />
        <Select size="small" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} sx={{ minWidth: 150 }}>
          <MenuItem value="">Mặc định</MenuItem>
          <MenuItem value="all">Tất cả</MenuItem>
          <MenuItem value={ERECORD_STATUS.Active}>Hoạt động</MenuItem>
          <MenuItem value={ERECORD_STATUS.Locked}>Đã khoá</MenuItem>
          <MenuItem value={ERECORD_STATUS.NoActive}>Không hoạt động</MenuItem>
          <MenuItem value={ERECORD_STATUS.Deleted}>Đã xoá</MenuItem>
        </Select>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<Download />} onClick={handleExportExcel}>
            Xuất Excel
          </Button>
          <Button variant="contained" startIcon={<Add />} onClick={() => setOpenCreateDialog(true)}>
            Tạo mới
          </Button>
        </Stack>
      </Box>

      {loading ? (
        <Box textAlign="center">
          <CircularProgress />
        </Box>
      ) : (
        <DataGrid
          autoHeight
          rows={staffs.map((s) => ({ ...s, id: s.id || s._id }))}
          columns={columns}
          rowCount={total}
          paginationModel={{ page, pageSize }}
          paginationMode="server"
          onPaginationModelChange={({ page, pageSize }) => {
            setPage(page);
            setPageSize(pageSize);
          }}
          disableRowSelectionOnClick
        />
      )}

      <CreateStaffDialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} onCreated={handleCreated} />
      <UpdateStaffDialog open={openUpdateDialog} onClose={() => setOpenUpdateDialog(false)} onUpdated={handleUpdated} user={selectedUser} />
    </Box>
  );
}
