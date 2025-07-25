"use client";

import { Box, Button, CircularProgress, MenuItem, Select, Stack, TextField, Typography } from "@mui/material";
import { Add, Download } from "@mui/icons-material";
import { useEffect, useMemo, useState } from "react";
import debounce from "lodash/debounce";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import * as XLSX from "sheetjs-style";

import { IService } from "@/types/typeService";
import { ERECORD_STATUS } from "@/types/typeGlobals";
import { EnumChip } from "../Globals/EnumChip";
import { ActionMenu } from "../Globals/ActionMenu";
import { useNotification } from "@/contexts/NotificationProvider";
import { deleteServiceApi, lockServiceApi, searchServicesApi, unlockServiceApi } from "@/utils/apis/apiService";
import { recordStatusLabel } from "@/utils/constants/enumLabel";
import CreateServiceDialog from "./CreateServiceDialog";
import UpdateServiceDialog from "./UpdateServiceDialog";
import ServiceDetailDialog from "./ServiceDetailDialog";
import { ICompany } from "@/types/typeCompany";
import { getCompanyCarriersApi } from "@/utils/apis/apiCarrier";

export default function ServiceManagerView() {
  const [services, setServices] = useState<IService[]>([]);
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | "all" | ERECORD_STATUS>("");
  const [companyFilter, setCompanyFilter] = useState("");
  const [companies, setCompanies] = useState<ICompany[]>([]);

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [selectedService, setSelectedService] = useState<IService | null>(null);

  const { showNotification } = useNotification();
  const debouncedSearch = useMemo(() => debounce((v) => setKeyword(v), 500), []);

  const fetchCompanies = async () => {
    try {
      const res = await getCompanyCarriersApi();
      setCompanies(res?.data?.data?.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchServices = async () => {
    try {
      setLoading(true);
      const res = await searchServicesApi({
        keyword,
        page: page + 1,
        perPage: pageSize,
        status: statusFilter,
        companyId: companyFilter,
      });
      setServices(res?.data?.data?.data || []);
      setTotal(res?.data?.data?.meta?.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    fetchServices();
  }, [keyword, page, pageSize, statusFilter, companyFilter]);

  const handleLockToggle = async (item: IService) => {
    try {
      if (!item._id) return;
      const confirm = window.confirm(item.status === ERECORD_STATUS.Active ? "Lock this service?" : "Unlock this service?");
      if (!confirm) return;

      const res = item.status === ERECORD_STATUS.Active ? await lockServiceApi(item._id) : await unlockServiceApi(item._id);

      showNotification(res?.data?.message || "Status updated successfully", "success");
      fetchServices();
    } catch (err: any) {
      showNotification(err.message || "Failed to update status", "error");
    }
  };

  const handleDelete = async (item: IService) => {
    if (!item._id) return;
    if (!window.confirm("Are you sure you want to delete this service?")) return;
    try {
      await deleteServiceApi(item._id);
      showNotification("Deleted successfully", "success");
      fetchServices();
    } catch (err: any) {
      showNotification(err.message || "Delete failed", "error");
    }
  };

  const handleExportExcel = () => {
    const data = services.map((s) => ({
      "SERVICE CODE": s.code,
      NAME: s.name,
      "SUB CARRIER": typeof s.companyId === "object" ? s.companyId?.name || "" : String(s.companyId),
      DESCRIPTION: s.description || "",
      STATUS: recordStatusLabel[s.status as keyof typeof recordStatusLabel] || s.status,
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
    XLSX.utils.book_append_sheet(wb, ws, "SERVICE");
    XLSX.writeFile(wb, "SERVICES.xlsx");
  };

  const handleCreated = () => {
    setOpenCreateDialog(false);
    fetchServices();
  };

  const handleUpdated = () => {
    setOpenUpdateDialog(false);
    setSelectedService(null);
    fetchServices();
  };

  const columns: GridColDef[] = [
    {
      field: "code",
      headerName: "CODE",
      flex: 1.2,
      renderCell: ({ row }: { row: IService }) => (
        <Box display="flex" alignItems="center" height="100%">
          <Typography
            sx={{ cursor: "pointer", textDecoration: "underline" }}
            color="primary"
            onClick={() => {
              setSelectedService(row);
              setOpenDetailDialog(true);
            }}
          >
            {row.code}
          </Typography>
        </Box>
      ),
    },
    { field: "name", headerName: "SERVICE NAME", flex: 1.5 },
    {
      field: "companyId",
      headerName: "SUB CARRIER",
      flex: 1.5,
      renderCell: ({ row }) => (typeof row.companyId === "object" ? row.companyId?.name : row.companyId),
    },
    {
      field: "status",
      headerName: "STATUS",
      flex: 1,
      renderCell: ({ value }) => <EnumChip type="recordStatus" value={value} />,
    },
    {
      field: "actions",
      headerName: "",
      width: 60,
      renderCell: ({ row }) => (
        <ActionMenu
          onEdit={() => {
            setSelectedService(row);
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
        <TextField placeholder="Search service..." size="small" onChange={(e) => debouncedSearch(e.target.value)} className="max-w-[250px] w-full" />
        <Select size="small" displayEmpty value={companyFilter} onChange={(e) => setCompanyFilter(e.target.value)} sx={{ minWidth: 200 }}>
          <MenuItem value="">All Sub Carriers</MenuItem>
          {companies.map((c) => (
            <MenuItem key={c._id} value={c._id}>
              {c.name}
            </MenuItem>
          ))}
        </Select>
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
            rows={services.map((s) => ({ ...s, id: s._id }))}
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

      <ServiceDetailDialog open={openDetailDialog} onClose={() => setOpenDetailDialog(false)} service={selectedService} />
      <CreateServiceDialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} onCreated={handleCreated} />
      <UpdateServiceDialog open={openUpdateDialog} onClose={() => setOpenUpdateDialog(false)} onUpdated={handleUpdated} service={selectedService} />
    </Box>
  );
}
