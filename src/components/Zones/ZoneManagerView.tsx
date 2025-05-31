// ZoneManagerView.tsx (đã cập nhật thêm Carrier)
"use client";

import { useEffect, useMemo, useState } from "react";
import { Box, Button, CircularProgress, MenuItem, Select, Stack, TextField, Typography } from "@mui/material";
import { Add, Download } from "@mui/icons-material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import debounce from "lodash/debounce";
import * as XLSX from "sheetjs-style";
import { EnumChip } from "@/components/Globals/EnumChip";
import { ActionMenu } from "@/components/Globals/ActionMenu";
import { useNotification } from "@/contexts/NotificationProvider";
import { recordStatusLabel } from "@/utils/constants/enumLabel";
import { ERECORD_STATUS } from "@/types/typeGlobals";
import { IZone } from "@/types/typeZone";
import { getCarriersApi } from "@/utils/apis/apiCarrier";
import { searchZonesApi, deleteZoneApi, lockZoneApi, unlockZoneApi } from "@/utils/apis/apiZone";
import { ICarrier } from "@/types/typeCarrier";
import CreateZoneDialog from "./CreateZoneDialog";
import UpdateZoneDialog from "./UpdateZoneDialog";
import ZoneDetailDialog from "./ZoneDetailDialog";
import { COUNTRIES } from "@/utils/constants";
import { orange } from "@mui/material/colors";

export default function ZoneManagerView() {
  const [zones, setZones] = useState<IZone[]>([]);
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | "all" | ERECORD_STATUS>("");
  const [carrierFilter, setCarrierFilter] = useState("");
  const [carriers, setCarriers] = useState<ICarrier[]>([]);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [selectedZone, setSelectedZone] = useState<IZone | null>(null);

  const { showNotification } = useNotification();
  const debouncedSearch = useMemo(() => debounce((v) => setKeyword(v), 500), []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await searchZonesApi({ keyword, page: page + 1, perPage: pageSize, status: statusFilter, carrierId: carrierFilter });
      setZones(res?.data?.data?.data || []);
      setTotal(res?.data?.data?.meta?.total || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCarriers = async () => {
    try {
      const res = await getCarriersApi();
      setCarriers(res?.data?.data?.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCarriers();
  }, []);

  useEffect(() => {
    fetchData();
  }, [keyword, page, pageSize, statusFilter, carrierFilter]);

  const handleLockToggle = async (item: IZone) => {
    try {
      if (!item._id) return;
      const confirm = window.confirm(item.status === ERECORD_STATUS.Active ? "Khoá Zone này?" : "Mở khoá Zone này?");
      if (!confirm) return;

      const res = item.status === ERECORD_STATUS.Active ? await lockZoneApi(item._id) : await unlockZoneApi(item._id);
      showNotification(res?.data?.message || "Cập nhật trạng thái thành công", "success");
      fetchData();
    } catch (err: any) {
      showNotification(err.message || "Lỗi cập nhật trạng thái", "error");
    }
  };

  const handleDelete = async (item: IZone) => {
    if (!item._id) return;
    if (!window.confirm("Bạn có chắc muốn xoá?")) return;
    try {
      await deleteZoneApi(item._id);
      showNotification("Đã xoá thành công", "success");
      fetchData();
    } catch (err: any) {
      showNotification(err.message || "Lỗi khi xoá", "error");
    }
  };

  const handleExportExcel = () => {
    const data = zones.map((z) => ({
      CARRIER: typeof z.carrierId === "object" ? z.carrierId?.name || "" : String(z.carrierId),
      ZONE: z.zone,
      COUNTRY: z.countryCode,
      STATUS: recordStatusLabel[z.status as keyof typeof recordStatusLabel] || z.status,
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
    XLSX.utils.book_append_sheet(wb, ws, "ZONE");
    XLSX.writeFile(wb, "DANH_SACH_ZONE.xlsx");
  };

  const handleCreated = () => {
    setOpenCreateDialog(false);
    fetchData();
  };

  const columns: GridColDef[] = [
    {
      field: "code",
      headerName: "ID",
      flex: 1.2,
      renderCell: ({ row }: { row: IZone }) => (
        <Box display="flex" alignItems="center" height="100%">
          <Typography
            sx={{ cursor: "pointer", textDecoration: "underline" }}
            color="primary"
            onClick={() => {
              setSelectedZone(row);
              setOpenDetailDialog(true);
            }}
          >
            #{row._id?.slice(-8)}
          </Typography>
        </Box>
      ),
    },
    {
      field: "carrierId",
      headerName: "CARRIER",
      flex: 1,
      renderCell: ({ row }) => (typeof row.carrierId === "object" ? row.carrierId?.name : row.carrierId),
    },
    {
      field: "countryCode",
      headerName: "QUỐC GIA",
      flex: 1,
      renderCell: ({ value }) => (
        <Box display="flex" alignItems="center" height="100%">
          <Typography color={orange[500]}>{value}</Typography>
        </Box>
      ),
    },
    {
      field: "zone",
      headerName: "ZONE",
      flex: 0.6,
    },
    {
      field: "status",
      headerName: "TRẠNG THÁI",
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
            setSelectedZone(row);
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
      <Box mb={2} display="flex" gap={2} alignItems="center" justifyContent="flex-end">
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<Download />} onClick={handleExportExcel}>
            Xuất Excel
          </Button>
          <Button variant="contained" startIcon={<Add />} onClick={() => setOpenCreateDialog(true)}>
            Tạo Zone
          </Button>
        </Stack>
      </Box>
      <Box mb={2} display="flex" gap={2} alignItems="center" justifyContent="space-between">
        <TextField placeholder="Tìm mã Zone..." size="small" onChange={(e) => debouncedSearch(e.target.value)} className="max-w-[250px] w-full" />

        <Select size="small" displayEmpty value={carrierFilter} onChange={(e) => setCarrierFilter(e.target.value)} sx={{ minWidth: 200 }}>
          <MenuItem value="">Tất cả Carrier</MenuItem>
          {carriers.map((c) => (
            <MenuItem key={c._id} value={c._id}>
              {c.name}
            </MenuItem>
          ))}
        </Select>

        <Select size="small" displayEmpty value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} sx={{ minWidth: 150 }}>
          <MenuItem value="">Mặc định</MenuItem>
          <MenuItem value="all">Tất cả</MenuItem>
          <MenuItem value={ERECORD_STATUS.Active}>Hoạt động</MenuItem>
          <MenuItem value={ERECORD_STATUS.Locked}>Đã khoá</MenuItem>
          <MenuItem value={ERECORD_STATUS.NoActive}>Không hoạt động</MenuItem>
          <MenuItem value={ERECORD_STATUS.Deleted}>Đã xoá</MenuItem>
        </Select>
      </Box>

      {loading ? (
        <Box textAlign="center">
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ width: "100%", overflow: "auto" }}>
          <DataGrid
            rows={zones.map((z) => ({ ...z, id: z._id }))}
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

      <ZoneDetailDialog open={openDetailDialog} onClose={() => setOpenDetailDialog(false)} zone={selectedZone} />
      <CreateZoneDialog open={openCreateDialog} onClose={() => setOpenCreateDialog(false)} onCreated={handleCreated} carriers={carriers} />
      <UpdateZoneDialog open={openUpdateDialog} onClose={() => setOpenUpdateDialog(false)} onUpdated={handleCreated} zone={selectedZone} carriers={carriers} />
    </Box>
  );
}
