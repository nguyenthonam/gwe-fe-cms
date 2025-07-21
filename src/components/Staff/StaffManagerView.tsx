"use client";

import { useEffect, useMemo, useState } from "react";
import { Box, Button, TextField, Typography, CircularProgress, MenuItem, Select, Stack } from "@mui/material";
import { Add, Download } from "@mui/icons-material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import debounce from "lodash/debounce";
import { ActionMenu } from "@/components/Globals/ActionMenu";
import { useNotification } from "@/contexts/NotificationProvider";
import { IUser } from "@/types/typeUser";
import { ERECORD_STATUS } from "@/types/typeGlobals";
import { getStaffsOfPartnerApi, lockUserApi, unlockUserApi, deleteUserApi } from "@/utils/apis/apiUser";
import * as XLSX from "sheetjs-style";
import CreateStaffDialog from "./CreateStaffDialog";
import UpdateStaffDialog from "./UpdateStaffDialog";
import { EnumChip } from "../Globals/EnumChip";
import StaffDetailDialog from "./StaffDetailDialog";
import { genderLabel, recordStatusLabel } from "@/utils/constants/enumLabel";

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
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
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
      const res = await getStaffsOfPartnerApi({
        keyword,
        page: page + 1,
        perPage: pageSize,
        status: statusFilter,
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
      if (!staff?._id) return;
      const confirm = window.confirm(staff.status === ERECORD_STATUS.Active ? "Lock this staff?" : "Unlock this staff?");
      if (!confirm) return;

      const res = staff.status === ERECORD_STATUS.Active ? await lockUserApi(staff._id) : await unlockUserApi(staff._id);
      showNotification(res?.data?.message || "Status updated successfully", "success");
      fetchStaffs();
    } catch (err: any) {
      showNotification(err.message || "Error updating status", "error");
    }
  };

  const handleDelete = async (staff: IUser) => {
    if (!staff._id) return;
    if (!window.confirm("Are you sure you want to delete this staff?")) return;
    try {
      await deleteUserApi(staff._id);
      showNotification("Deleted successfully", "success");
      fetchStaffs();
    } catch (err: any) {
      showNotification(err.message || "Error deleting staff", "error");
    }
  };

  const handleExportExcel = () => {
    const data = staffs.map((s) => ({
      ID: s.userId || "",
      "Full Name": s.contact?.fullname || "",
      Email: s.email || "",
      "Contact Number": s.contact?.phone || "",
      Company: typeof s.companyId === "object" ? s.companyId?.name || "" : String(s.companyId || ""),
      Gender: genderLabel[s.gender as keyof typeof genderLabel] || "Other",
      Status: recordStatusLabel[s.status as keyof typeof recordStatusLabel] || s.status,
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
          alignment: { horizontal: isHeader ? "center" : "left", vertical: "center", wrapText: true },
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
    XLSX.utils.book_append_sheet(wb, ws, "STAFF_TABLE");
    XLSX.writeFile(wb, "STAFF_TABLE.xlsx");
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
    {
      field: "userId",
      headerName: "ID",
      flex: 1.2,
      minWidth: 120,
      renderCell: ({ row }: { row: IUser }) => (
        <Box display="flex" alignItems="center" height="100%">
          <Typography
            sx={{ cursor: "pointer", textDecoration: "underline" }}
            color="primary"
            onClick={() => {
              setSelectedUser(row);
              setOpenDetailDialog(true);
            }}
          >
            {row.userId}
          </Typography>
        </Box>
      ),
    },
    { field: "fullname", headerName: "Full Name", flex: 1, minWidth: 150, renderCell: ({ row }: { row: IUser }) => row.contact?.fullname || "" },
    { field: "companyId", headerName: "Company", flex: 1, minWidth: 100, renderCell: ({ row }) => (typeof row.companyId === "object" ? row.companyId?.name : row.companyId) },
    { field: "email", headerName: "Email", flex: 1, minWidth: 180 },
    { field: "phone", headerName: "Contact Number", flex: 1, minWidth: 120, renderCell: ({ row }: { row: IUser }) => row.contact?.phone || "" },
    { field: "gender", headerName: "Gender", flex: 1, renderCell: ({ row }: { row: IUser }) => <EnumChip type="gender" value={row.gender} /> },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      minWidth: 140,
      renderCell: ({ value }) => <EnumChip type="recordStatus" value={value} />,
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
    <Box className="space-y-4 p-6">
      <Box mb={2} display="flex" gap={2} alignItems="center" justifyContent="space-between">
        <TextField placeholder="Search staff..." size="small" className="max-w-[250px] w-full" onChange={(e) => debouncedSearch(e.target.value)} />
        <Select size="small" displayEmpty value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} sx={{ minWidth: 150 }}>
          <MenuItem value="">Default</MenuItem>
          <MenuItem value="all">All</MenuItem>
          <MenuItem value={ERECORD_STATUS.Active}>Active</MenuItem>
          <MenuItem value={ERECORD_STATUS.Locked}>Locked</MenuItem>
          <MenuItem value={ERECORD_STATUS.NoActive}>Inactive</MenuItem>
          <MenuItem value={ERECORD_STATUS.Deleted}>Deleted</MenuItem>
        </Select>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<Download />} onClick={handleExportExcel}>
            Export Excel
          </Button>
          <Button variant="contained" startIcon={<Add />} onClick={() => setOpenCreateDialog(true)}>
            Create New
          </Button>
        </Stack>
      </Box>

      {loading ? (
        <Box textAlign="center">
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ width: "100%", overflow: "auto" }}>
          <DataGrid
            rows={staffs.map((s) => ({ ...s, id: s._id }))}
            columns={columns}
            rowCount={total}
            pageSizeOptions={[10, 20, 50, 100]}
            paginationModel={{ page, pageSize }}
            paginationMode="server"
            onPaginationModelChange={({ page, pageSize }) => {
              setPage(page);
              setPageSize(pageSize);
            }}
            disableRowSelectionOnClick
          />
        </Box>
      )}
      <StaffDetailDialog open={openDetailDialog} onClose={() => setOpenDetailDialog(false)} staff={selectedUser} />
      <CreateStaffDialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} onCreated={handleCreated} />
      <UpdateStaffDialog open={openUpdateDialog} onClose={() => setOpenUpdateDialog(false)} onUpdated={handleUpdated} user={selectedUser} />
    </Box>
  );
}
