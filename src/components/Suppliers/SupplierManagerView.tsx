"use client";

import { Box, Button, CircularProgress, MenuItem, Select, Stack, TextField, Typography } from "@mui/material";
import { Add, Download } from "@mui/icons-material";
import { useEffect, useMemo, useState } from "react";
import debounce from "lodash/debounce";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import * as XLSX from "sheetjs-style";

import { ISupplier } from "@/types/typeSupplier";
import { ERECORD_STATUS } from "@/types/typeGlobals";
import { EnumChip } from "../Globals/EnumChip";
import { ActionMenu } from "../Globals/ActionMenu";
import { useNotification } from "@/contexts/NotificationProvider";
import { searchSuppliersApi, deleteSupplierApi, lockSupplierApi, unlockSupplierApi } from "@/utils/apis/apiSupplier";
import { recordStatusLabel } from "@/utils/constants/enumLabel";
import CreateSupplierDialog from "./CreateSupplierDialog";
import UpdateSupplierDialog from "./UpdateSupplierDialog";
import SupplierDetailDialog from "./SupplierDetailDialog";

export default function SupplierManagerView() {
  const [suppliers, setSuppliers] = useState<ISupplier[]>([]);
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | "all" | ERECORD_STATUS>("");

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<ISupplier | null>(null);

  const { showNotification } = useNotification();
  const debouncedSearch = useMemo(
    () =>
      debounce((v) => {
        setPage(0);
        setKeyword(v);
      }, 500),
    []
  );

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const res = await searchSuppliersApi({
        keyword,
        page: page + 1,
        perPage: pageSize,
        status: statusFilter,
      });
      setSuppliers(res?.data?.data?.data || []);
      setTotal(res?.data?.data?.meta?.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
    // eslint-disable-next-line
  }, [keyword, page, pageSize, statusFilter]);

  const handleLockToggle = async (item: ISupplier) => {
    try {
      if (!item._id) return;
      const confirm = window.confirm(item.status === ERECORD_STATUS.Active ? "Lock this supplier?" : "Unlock this supplier?");
      if (!confirm) return;

      const res = item.status === ERECORD_STATUS.Active ? await lockSupplierApi(item._id) : await unlockSupplierApi(item._id);

      showNotification(res?.data?.message || "Status updated successfully!", "success");
      fetchSuppliers();
    } catch (err: any) {
      showNotification(err.message || "Failed to update status!", "error");
    }
  };

  const handleDelete = async (item: ISupplier) => {
    if (!item._id) return;
    if (!window.confirm("Are you sure you want to delete this supplier?")) return;
    try {
      await deleteSupplierApi(item._id);
      showNotification("Deleted successfully!", "success");
      fetchSuppliers();
    } catch (err: any) {
      showNotification(err.message || "Failed to delete!", "error");
    }
  };

  const handleExportExcel = () => {
    const data = suppliers.map((s) => ({
      "Supplier Code": s.code || "",
      "Supplier Name": s.name || "",
      "Tax Code": s.taxCode || "",
      "Representative Name": s.representative?.name || "",
      "Representative Phone": s.representative?.phone || "",
      Email: s.contact?.email || "",
      Hotline: s.contact?.hotline || "",
      Website: s.contact?.website || "",
      Address: s.address || "",
      "Payment Terms": s.contract?.paymentTerms || "",
      Status: recordStatusLabel[s.status as keyof typeof recordStatusLabel] || s.status,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    ws["!cols"] = Object.keys(data[0]).map(() => ({ wch: 20 }));

    // Cell style
    const range = XLSX.utils.decode_range(ws["!ref"] || "");
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cell = XLSX.utils.encode_cell({ r: R, c: C });
        if (!ws[cell]) continue;
        const isHeader = R === 0;

        (ws[cell] as any).s = {
          font: {
            bold: isHeader,
            sz: isHeader ? 12 : 11,
          },
          alignment: {
            horizontal: isHeader ? "center" : "left",
            vertical: "center",
            wrapText: true,
          },
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
    XLSX.utils.book_append_sheet(wb, ws, "SUPPLIERS");
    XLSX.writeFile(wb, "SUPPLIERS.xlsx");
  };

  const handleCreated = () => {
    setOpenCreateDialog(false);
    fetchSuppliers();
  };

  const handleUpdated = () => {
    setOpenUpdateDialog(false);
    setSelectedSupplier(null);
    fetchSuppliers();
  };

  const columns: GridColDef[] = [
    {
      field: "code",
      headerName: "Supplier Code",
      flex: 1.2,
      renderCell: ({ row }: { row: ISupplier }) => (
        <Box display="flex" alignItems="center" height="100%">
          <Typography
            sx={{ cursor: "pointer", textDecoration: "underline" }}
            color="primary"
            onClick={() => {
              setSelectedSupplier(row);
              setOpenDetailDialog(true);
            }}
          >
            {row.code}
          </Typography>
        </Box>
      ),
    },
    { field: "name", headerName: "Supplier Name", flex: 1.5 },
    {
      field: "representative",
      headerName: "Representative Name",
      flex: 1.2,
      renderCell: ({ row }) => (
        <Typography height={"100%"} alignContent={"center"} justifyContent={"center"}>
          {row.representative?.name}
        </Typography>
      ),
    },
    { field: "taxCode", headerName: "Tax Code", flex: 1 },
    {
      field: "contactEmail",
      headerName: "Email",
      flex: 1.5,
      width: 200,
      renderCell: ({ row }) => row.contact?.email,
    },
    {
      field: "contactHotline",
      headerName: "Hotline",
      flex: 1,
      renderCell: ({ row }) => row.contact?.hotline,
    },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      width: 130,
      renderCell: ({ value }) => <EnumChip type="recordStatus" value={value} />,
    },
    {
      field: "actions",
      headerName: "",
      width: 60,
      renderCell: ({ row }) => (
        <ActionMenu
          onEdit={() => {
            setSelectedSupplier(row);
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
    <Box className="space-y-4">
      <Box mb={2} display="flex" gap={2} alignItems="center" justifyContent="space-between">
        <TextField placeholder="Search suppliers..." size="small" onChange={(e) => debouncedSearch(e.target.value)} className="max-w-[250px] w-full" />
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
            rows={suppliers.map((s) => ({ ...s, id: s._id }))}
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

      <SupplierDetailDialog open={openDetailDialog} onClose={() => setOpenDetailDialog(false)} supplier={selectedSupplier} />
      <CreateSupplierDialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} onCreated={handleCreated} />
      <UpdateSupplierDialog open={openUpdateDialog} onClose={() => setOpenUpdateDialog(false)} onUpdated={handleUpdated} supplier={selectedSupplier} />
    </Box>
  );
}
