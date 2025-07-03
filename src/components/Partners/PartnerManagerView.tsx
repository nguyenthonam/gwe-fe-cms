"use client";

import { useEffect, useMemo, useState } from "react";
import { Box, Button, TextField, Typography, CircularProgress, MenuItem, Select, Stack } from "@mui/material";
import { Add, Download } from "@mui/icons-material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import { ActionMenu } from "@/components/Globals/ActionMenu";
import { lockPartnerApi, searchPartnersApi, unlockPartnerApi, deletePartnerApi } from "@/utils/apis/apiPartner";
import { ICompany } from "@/types/typeCompany";
import CreatePartnerDialog from "./CreatePartnerDialog";
import UpdatePartnerDialog from "./UpdatePartnerDialog";
import { ERECORD_STATUS } from "@/types/typeGlobals";
import { useNotification } from "@/contexts/NotificationProvider";
import PartnerDetailDialog from "./PartnerDetailDialog";
import debounce from "lodash/debounce";
import * as XLSX from "sheetjs-style";
import { EnumChip } from "../Globals/EnumChip";
import { recordStatusLabel } from "@/utils/constants/enumLabel";

export default function PartnerManager() {
  const [companies, setCompanies] = useState<ICompany[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<ICompany | null>(null);
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

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const res = await searchPartnersApi({
        keyword,
        page: page + 1,
        perPage: pageSize,
        status: statusFilter || "",
      });
      setCompanies(res?.data?.data?.data || []);
      setTotal(res?.data?.data?.meta?.total || 0);
    } catch (error) {
      console.error("Failed to fetch companies", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [page, pageSize, statusFilter, keyword]);

  const handleLockToggle = async (company: ICompany) => {
    try {
      let res;
      if (!company?._id) throw new Error("Thiếu ID đối tác");

      if (company.status === ERECORD_STATUS.Active) {
        const confirm = window.confirm("Bạn có chắc muốn khoá đối tác này?");
        if (!confirm) return;
        res = await lockPartnerApi(company._id);
      } else if (company.status === ERECORD_STATUS.Locked) {
        const confirm = window.confirm("Bạn có chắc muốn mở khoá đối tác này?");
        if (!confirm) return;
        res = await unlockPartnerApi(company._id);
      }
      if (res) {
        showNotification(res.data.message || "Cập nhật thành công!", "success");
        fetchCompanies();
      }
    } catch (err: any) {
      showNotification(err.message || "Không nhận được phản hồi từ máy chủ!", "error");
    }
  };

  const handleDelete = async (company: ICompany) => {
    try {
      if (!company?._id) throw new Error("Thiếu ID đối tác");
      const confirm = window.confirm("Bạn có chắc muốn xoá đối tác này?");
      if (!confirm) return;
      const res = await deletePartnerApi(company._id);
      showNotification(res?.data?.message || "Đã xoá thành công!", "success");
      fetchCompanies();
    } catch (err: any) {
      showNotification(err.message || "Lỗi khi xoá đối tác", "error");
    }
  };

  const handleExportExcel = () => {
    const data = companies.map((c) => ({
      "MÃ CÔNG TY": c.code || "",
      TÊN: c.name || "",
      MST: c.taxCode || "",
      "NGƯỜI ĐẠI DIỆN": c.representative?.name || "",
      "SĐT ĐẠI DIỆN": c.representative?.phone || "",
      EMAIL: c.contact?.email || "",
      HOTLINE: c.contact?.hotline || "",
      WEBSITE: c.contact?.website || "",
      "ĐỊA CHỈ": c.address || "",
      "TRẠNG THÁI": recordStatusLabel[c.status as keyof typeof recordStatusLabel] || c.status,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    ws["!cols"] = Object.keys(data[0]).map(() => ({ wch: 20 }));

    // Style cho từng cell
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
    XLSX.utils.book_append_sheet(wb, ws, "DANH SÁCH ĐỐI TÁC");
    XLSX.writeFile(wb, "DANH_SACH_DOI_TAC.xlsx");
  };

  const handleCreated = () => {
    setOpenCreateDialog(false);
    fetchCompanies();
  };

  const handleUpdate = (company: ICompany) => {
    setSelectedCompany(company);
    setOpenUpdateDialog(true);
  };

  const columns: GridColDef[] = [
    {
      field: "code",
      headerName: "MÃ CÔNG TY",
      flex: 1.5,
      renderCell: ({ row }: { row: ICompany }) => (
        <Box display="flex" alignItems="center" height="100%">
          <Typography
            sx={{ cursor: "pointer", textDecoration: "underline" }}
            color="primary"
            onClick={() => {
              setSelectedCompany(row);
              setOpenDetailDialog(true);
            }}
          >
            {row.code}
          </Typography>
        </Box>
      ),
    },
    { field: "name", headerName: "TÊN", flex: 1.5 },
    {
      field: "representative",
      headerName: "NGƯỜI ĐẠI DIỆN",
      flex: 1.2,
      renderCell: ({ row }) => (
        <Box display="flex" alignItems="center" height="100%">
          <Typography>{row.representative?.name}</Typography>
        </Box>
      ),
    },
    { field: "taxCode", headerName: "MST", flex: 1 },
    {
      field: "status",
      headerName: "TRẠNG THÁI",
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
          placeholder="Tìm đối tác..."
          size="small"
          value={keyword}
          onChange={(e) => debouncedSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && fetchCompanies()}
        />

        <Select size="small" displayEmpty value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} sx={{ minWidth: 150 }}>
          <MenuItem value="">Mặc đinh</MenuItem>
          <MenuItem value="all">Tất cả trạng thái</MenuItem>
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
          rowHeight={48}
          rows={companies.map((c) => ({ ...c, id: c._id }))}
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

      <PartnerDetailDialog
        open={openDetailDialog}
        onClose={() => {
          setSelectedCompany(null);
          setOpenDetailDialog(false);
        }}
        partner={selectedCompany}
      />
      <CreatePartnerDialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} onCreated={handleCreated} />
      <UpdatePartnerDialog open={openUpdateDialog} onClose={() => setOpenUpdateDialog(false)} onUpdated={handleCreated} company={selectedCompany} />
    </Box>
  );
}
