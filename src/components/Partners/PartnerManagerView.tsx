"use client";

import { useEffect, useMemo, useState } from "react";
import debounce from "lodash/debounce";
import * as XLSX from "sheetjs-style";
import { useNotification } from "@/contexts/NotificationProvider";
import { Box, Button, TextField, Typography, CircularProgress, MenuItem, Select, Stack } from "@mui/material";
import { Add, Download } from "@mui/icons-material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { ActionMenu } from "@/components/Globals/ActionMenu";
import { lockPartnerApi, searchPartnersApi, unlockPartnerApi, deletePartnerApi } from "@/utils/apis/apiPartner";
import { ICompany } from "@/types/typeCompany";
import { ERECORD_STATUS } from "@/types/typeGlobals";
import CreateCustomerDialog from "./CreatePartnerDialog";
import UpdateCustomerDialog from "./UpdatePartnerDialog";
import CustomerDetailDialog from "./PartnerDetailDialog";
import { EnumChip } from "../Globals/EnumChip";
import { recordStatusLabel } from "@/utils/constants/enumLabel";

export default function CustomerManager() {
  const [customers, setCustomers] = useState<ICompany[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<ICompany | null>(null);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState<ERECORD_STATUS | "" | "all">("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  const { showNotification } = useNotification();

  // Debounced search
  const debouncedSearch = useMemo(
    () =>
      debounce((value: string) => {
        setPage(0);
        setKeyword(value);
      }, 500),
    []
  );

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await searchPartnersApi({
        keyword,
        page: page + 1,
        perPage: pageSize,
        status: statusFilter || "",
      });
      setCustomers(res?.data?.data?.data || []);
      setTotal(res?.data?.data?.meta?.total || 0);
      // eslint-disable-next-line
    } catch (error) {
      showNotification("Failed to fetch customers", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [page, pageSize, statusFilter, keyword]);

  const handleLockToggle = async (customer: ICompany) => {
    try {
      let res;
      if (!customer?._id) throw new Error("Missing customer ID");

      if (customer.status === ERECORD_STATUS.Active) {
        const confirm = window.confirm("Are you sure you want to lock this customer?");
        if (!confirm) return;
        res = await lockPartnerApi(customer._id);
      } else if (customer.status === ERECORD_STATUS.Locked) {
        const confirm = window.confirm("Are you sure you want to unlock this customer?");
        if (!confirm) return;
        res = await unlockPartnerApi(customer._id);
      }
      if (res) {
        showNotification(res.data.message || "Update successful!", "success");
        fetchCustomers();
      }
    } catch (err: any) {
      showNotification(err.message || "No response from server!", "error");
    }
  };

  const handleDelete = async (customer: ICompany) => {
    try {
      if (!customer?._id) throw new Error("Missing customer ID");
      const confirm = window.confirm("Are you sure you want to delete this customer?");
      if (!confirm) return;
      const res = await deletePartnerApi(customer._id);
      showNotification(res?.data?.message || "Deleted successfully!", "success");
      fetchCustomers();
    } catch (err: any) {
      showNotification(err.message || "Failed to delete customer", "error");
    }
  };

  const handleExportExcel = () => {
    const data = customers.map((c) => ({
      "CUSTOMER CODE": c.code || "",
      "CUSTOMER NAME": c.name || "",
      "TAX CODE": c.taxCode || "",
      REPRESENTATIVE: c.representative?.name || "",
      "REPRESENTATIVE PHONE": c.representative?.phone || "",
      EMAIL: c.contact?.email || "",
      HOTLINE: c.contact?.hotline || "",
      WEBSITE: c.contact?.website || "",
      ADDRESS: c.address || "",
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
    XLSX.utils.book_append_sheet(wb, ws, "CUSTOMER_LIST");
    XLSX.writeFile(wb, "CUSTOMER_LIST.xlsx");
  };

  const handleCreated = () => {
    setOpenCreateDialog(false);
    fetchCustomers();
  };

  const handleUpdate = (customer: ICompany) => {
    setSelectedCustomer(customer);
    setOpenUpdateDialog(true);
  };

  const columns: GridColDef[] = [
    {
      field: "code",
      headerName: "CUSTOMER CODE",
      flex: 1.5,
      renderCell: ({ row }: { row: ICompany }) => (
        <Box display="flex" alignItems="center" height="100%">
          <Typography
            sx={{ cursor: "pointer", textDecoration: "underline" }}
            color="primary"
            onClick={() => {
              setSelectedCustomer(row);
              setOpenDetailDialog(true);
            }}
          >
            {row.code}
          </Typography>
        </Box>
      ),
    },
    { field: "name", headerName: "CUSTOMER NAME", flex: 1.5 },
    {
      field: "representative",
      headerName: "REPRESENTATIVE",
      flex: 1.2,
      renderCell: ({ row }) => (
        <Box display="flex" alignItems="center" height="100%">
          <Typography>{row.representative?.name}</Typography>
        </Box>
      ),
    },
    { field: "taxCode", headerName: "TAX CODE", flex: 1 },
    {
      field: "status",
      headerName: "STATUS",
      renderCell: ({ value }) => <EnumChip type="recordStatus" value={value} />,
      width: 130,
    },
    {
      field: "action",
      headerName: "",
      width: 60,
      sortable: false,
      filterable: false,
      resizable: false,
      align: "center",
      headerAlign: "center",
      renderCell: ({ row }) => <ActionMenu onEdit={() => handleUpdate(row)} onLockUnlock={() => handleLockToggle(row)} onDelete={() => handleDelete(row)} status={row.status} />,
    },
  ];

  return (
    <Box className="space-y-4 p-6">
      <Box mb={2} display="flex" justifyContent="space-between" alignItems="center" gap={2}>
        <TextField
          className="max-w-[250px] w-full"
          placeholder="Search customer..."
          size="small"
          value={keyword}
          onChange={(e) => debouncedSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && fetchCustomers()}
        />

        <Select size="small" displayEmpty value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} sx={{ minWidth: 150 }}>
          <MenuItem value="">Default</MenuItem>
          <MenuItem value="all">All Status</MenuItem>
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
        <DataGrid
          rowHeight={48}
          rows={customers.map((c) => ({ ...c, id: c._id }))}
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

      <CustomerDetailDialog
        open={openDetailDialog}
        onClose={() => {
          setSelectedCustomer(null);
          setOpenDetailDialog(false);
        }}
        customer={selectedCustomer}
      />
      <CreateCustomerDialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} onCreated={handleCreated} />
      <UpdateCustomerDialog open={openUpdateDialog} onClose={() => setOpenUpdateDialog(false)} onUpdated={handleCreated} customer={selectedCustomer} />
    </Box>
  );
}
