"use client";

import { useEffect, useMemo, useState } from "react";
import { Box, Button, TextField, Typography, CircularProgress, MenuItem, Select, Stack } from "@mui/material";
import { Add, Download } from "@mui/icons-material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import debounce from "lodash/debounce";
import { searchCompanyCarriersApi, lockCompanyCarrierApi, unlockCompanyCarrierApi, deleteCompanyCarrierApi } from "@/utils/apis/apiCarrier";
import { ICompany } from "@/types/typeCompany";
import { ERECORD_STATUS } from "@/types/typeGlobals";
import { useNotification } from "@/contexts/NotificationProvider";
import { EnumChip } from "@/components/Globals/EnumChip";
import { ActionMenu } from "@/components/Globals/ActionMenu";
import CreateCompanyCarrierDialog from "./CreateCompanyCarrierDialog";
import UpdateCompanyCarrierDialog from "./UpdateCompanyCarrierDialog";
import CompanyCarrierDetailDialog from "./CompanyCarrierDetailDialog";
import * as XLSX from "sheetjs-style";
import { recordStatusLabel } from "@/utils/constants/enumLabel";

export default function CompanyCarrierManagerView() {
  const [rows, setRows] = useState<ICompany[]>([]);
  const [selected, setSelected] = useState<ICompany | null>(null);
  const [openCreate, setOpenCreate] = useState(false);
  const [openUpdate, setOpenUpdate] = useState(false);
  const [openDetail, setOpenDetail] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<"all" | "" | ERECORD_STATUS>("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const { showNotification } = useNotification();

  const debouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        setPage(0);
        setKeyword(value);
      }, 500),
    []
  );

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await searchCompanyCarriersApi({
        keyword,
        page: page + 1,
        perPage: pageSize,
        status,
      });
      setRows(res?.data?.data?.data || []);
      setTotal(res?.data?.data?.meta?.total || 0);
    } catch (error: any) {
      console.log(error.message);
      showNotification("Cannot load carrier list", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [keyword, page, pageSize, status]);

  const handleLockToggle = async (company: ICompany) => {
    try {
      if (!company._id) return;
      const confirm = window.confirm(company.status === ERECORD_STATUS.Active ? "Lock this carrier?" : "Unlock this carrier?");
      if (!confirm) return;

      const res = company.status === ERECORD_STATUS.Active ? await lockCompanyCarrierApi(company._id) : await unlockCompanyCarrierApi(company._id);

      showNotification(res?.data?.message || "Status updated!", "success");
      fetchData();
    } catch (err: any) {
      showNotification(err.message || "Failed to update status", "error");
    }
  };

  const handleDelete = async (company: ICompany) => {
    try {
      if (!company._id) return;
      if (!window.confirm("Are you sure you want to delete this carrier?")) return;
      const res = await deleteCompanyCarrierApi(company._id);
      showNotification(res?.data?.message || "Deleted successfully!", "success");
      fetchData();
    } catch (err: any) {
      showNotification(err.message || "Failed to delete", "error");
    }
  };

  const handleExportExcel = () => {
    const data = rows.map((c) => ({
      "CARRIER CODE": c.code,
      "CARRIER NAME": c.name,
      "TAX CODE": c.taxCode,
      ADDRESS: c.address,
      STATUS: recordStatusLabel[c.status as keyof typeof recordStatusLabel] || c.status,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    ws["!cols"] = Object.keys(data[0]).map(() => ({ wch: 20 }));

    // Style for each cell
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
    XLSX.utils.book_append_sheet(wb, ws, "CARRIERS");
    XLSX.writeFile(wb, "CARRIER_LIST.xlsx");
  };

  const columns: GridColDef[] = [
    {
      field: "code",
      headerName: "CARRIER CODE",
      flex: 1,
      minWidth: 140,
      renderCell: ({ row }) => (
        <Box display="flex" alignItems="center" height="100%">
          <Typography
            sx={{ cursor: "pointer", textDecoration: "underline" }}
            color="primary"
            onClick={() => {
              setSelected(row);
              setOpenDetail(true);
            }}
          >
            {row.code}
          </Typography>
        </Box>
      ),
    },
    { field: "name", headerName: "CARRIER NAME", flex: 1.2, minWidth: 150 },
    { field: "taxCode", headerName: "TAX CODE", flex: 1, minWidth: 120 },
    { field: "address", headerName: "ADDRESS", flex: 1.5, minWidth: 200 },
    {
      field: "status",
      headerName: "STATUS",
      width: 130,
      renderCell: ({ value }) => <EnumChip type="recordStatus" value={value} />,
    },
    {
      field: "actions",
      headerName: "",
      width: 60,
      renderCell: ({ row }) => (
        <ActionMenu
          status={row.status}
          onEdit={() => {
            setSelected(row);
            setOpenUpdate(true);
          }}
          onLockUnlock={() => handleLockToggle(row)}
          onDelete={() => handleDelete(row)}
        />
      ),
    },
  ];

  return (
    <Box className="space-y-4 p-6">
      <Box mb={2} display="flex" gap={2} justifyContent="space-between" alignItems="center">
        <TextField placeholder="Search carrier..." size="small" className="max-w-[250px] w-full" onChange={(e) => debouncedSearch(e.target.value)} />
        <Select size="small" displayEmpty value={status} onChange={(e) => setStatus(e.target.value)} sx={{ minWidth: 150 }}>
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
          <Button variant="contained" startIcon={<Add />} onClick={() => setOpenCreate(true)}>
            Add New
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
          rows={rows.map((r) => ({ ...r, id: r._id }))}
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
        />
      )}
      <CreateCompanyCarrierDialog open={openCreate} onClose={() => setOpenCreate(false)} onCreated={fetchData} />
      <UpdateCompanyCarrierDialog open={openUpdate} onClose={() => setOpenUpdate(false)} onUpdated={fetchData} company={selected} />
      <CompanyCarrierDetailDialog open={openDetail} onClose={() => setOpenDetail(false)} company={selected} />
    </Box>
  );
}
