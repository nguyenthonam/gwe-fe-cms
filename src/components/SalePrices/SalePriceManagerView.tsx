"use client";

import { useState, useEffect, useMemo } from "react";
import { Box, Button, Stack, TextField, Select, MenuItem, CircularProgress, Typography, Chip } from "@mui/material";
import { Add, Download } from "@mui/icons-material";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import * as XLSX from "sheetjs-style";
import debounce from "lodash/debounce";
import { ISalePrice } from "@/types/typeSalePrice";
import { ERECORD_STATUS, EPRODUCT_TYPE } from "@/types/typeGlobals";
import { useNotification } from "@/contexts/NotificationProvider";
import { EnumChip } from "@/components/Globals/EnumChip";
import { ActionMenu } from "@/components/Globals/ActionMenu";
import { formatCurrency } from "@/utils/hooks/hookCurrency";
import { getCarriersApi } from "@/utils/apis/apiCarrier";
import { getPartnersApi } from "@/utils/apis/apiPartner";
import { searchSalePricesApi, deleteSalePriceApi, lockSalePriceApi, unlockSalePriceApi } from "@/utils/apis/apiSalePrice";
import CreateSalePriceDialog from "./CreateSalePriceDialog";
import UpdateSalePriceDialog from "./UpdateSalePriceDialog";
import SalePriceDetailDialog from "./SalePriceDetailDialog";
import { green, orange } from "@mui/material/colors";
import { getServicesApi, getServicesByCarrierApi } from "@/utils/apis/apiService";

export default function SalePriceManagerView() {
  const [prices, setPrices] = useState<ISalePrice[]>([]);
  const [keyword, setKeyword] = useState("");
  const [carrierIdFilter, setCarrierIdFilter] = useState("");
  const [serviceIdFilter, setServiceIdFilter] = useState("");
  const [partnerIdFilter, setPartnerIdFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | "all" | ERECORD_STATUS>("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const [carriers, setCarriers] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [partners, setPartners] = useState<any[]>([]);

  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openUpdateDialog, setOpenUpdateDialog] = useState(false);
  const [openDetailDialog, setOpenDetailDialog] = useState(false);
  const [selected, setSelected] = useState<ISalePrice | null>(null);

  const { showNotification } = useNotification();
  const debouncedSearch = useMemo(() => debounce((v) => setKeyword(v), 500), []);

  const fetchCarriers = async () => {
    try {
      const res = await getCarriersApi();
      setCarriers(res?.data?.data?.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchServices = async () => {
    if (carrierIdFilter) {
      const selected = carriers.find((c) => c._id === carrierIdFilter);
      const companyId = typeof selected?.companyId === "object" ? selected?.companyId?._id : selected?.companyId;
      if (!companyId) return;
      try {
        const res = await getServicesByCarrierApi(companyId);
        setServices(res?.data?.data?.data || []);
      } catch (err) {
        showNotification("Không thể tải danh sách dịch vụ", "error");
      }
    } else {
      try {
        const res = await getServicesApi();
        setServices(res?.data?.data?.data || []);
      } catch (err) {
        showNotification("Không thể tải danh sách dịch vụ", "error");
      }
    }
  };

  useEffect(() => {
    fetchServices();
  }, [carrierIdFilter]);

  const fetchPartners = async () => {
    try {
      const res = await getPartnersApi();
      setPartners(res?.data?.data?.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await searchSalePricesApi({
        keyword,
        page: page + 1,
        perPage: pageSize,
        carrierId: carrierIdFilter,
        serviceId: serviceIdFilter,
        partnerId: partnerIdFilter,
        status: statusFilter,
      });
      setPrices(res?.data?.data?.data || []);
      setTotal(res?.data?.data?.meta?.total || 0);
    } catch (err) {
      showNotification("Không thể tải danh sách giá bán", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCarriers();
    fetchPartners();
    fetchData();
  }, []);

  useEffect(() => {
    fetchData();
  }, [keyword, page, pageSize, carrierIdFilter, serviceIdFilter, partnerIdFilter, statusFilter]);

  const handleLockToggle = async (item: ISalePrice) => {
    try {
      if (!item._id) return;
      const confirm = window.confirm(item.status === ERECORD_STATUS.Active ? "Khoá giá này?" : "Mở khoá giá này?");
      if (!confirm) return;
      const res = item.status === ERECORD_STATUS.Active ? await lockSalePriceApi(item._id) : await unlockSalePriceApi(item._id);
      showNotification(res?.data?.message || "Cập nhật thành công", "success");
      fetchData();
    } catch (err: any) {
      showNotification(err.message || "Lỗi cập nhật trạng thái", "error");
    }
  };

  const handleDelete = async (item: ISalePrice) => {
    if (!item._id) return;
    if (!window.confirm("Bạn có chắc muốn xoá giá này?")) return;
    try {
      await deleteSalePriceApi(item._id);
      showNotification("Đã xoá thành công", "success");
      fetchData();
    } catch (err: any) {
      showNotification(err.message || "Lỗi khi xoá", "error");
    }
  };

  const handleExportExcel = () => {
    const documentData = prices
      .filter((p) => p.productType === EPRODUCT_TYPE.DOCUMENT)
      .map((p) => ({
        "PRODUCT TYPE": "DOCUMENT",
        CARRIER: typeof p.carrierId === "object" ? p.carrierId?.name : p.carrierId,
        SERVICE: typeof p.serviceId === "object" ? p.serviceId?.code : p.serviceId,
        PARTNER: typeof p.partnerId === "object" ? p.partnerId?.name : p.partnerId,
        ZONE: p.zone,
        "FROM WEIGHT": p.weightMin,
        "TO WEIGHT": p.weightMax,
        PRICE: formatCurrency(p.price, p.currency),
        CURRENCY: p.currency,
        "PRICE BY KG": p.isPricePerKG ? "YES" : "",
      }));

    const parcelData = prices
      .filter((p) => p.productType === EPRODUCT_TYPE.PARCEL)
      .map((p) => ({
        "PRODUCT TYPE": "PARCEL",
        CARRIER: typeof p.carrierId === "object" ? p.carrierId?.name : p.carrierId,
        SERVICE: typeof p.serviceId === "object" ? p.serviceId?.code : p.serviceId,
        PARTNER: typeof p.partnerId === "object" ? p.partnerId?.name : p.partnerId,
        ZONE: p.zone,
        "FROM WEIGHT": p.weightMin,
        "TO WEIGHT": p.weightMax,
        PRICE: formatCurrency(p.price, p.currency),
        CURRENCY: p.currency,
        "PRICE BY KG": p.isPricePerKG ? "YES" : "",
      }));

    const allData = [...documentData, {}, ...parcelData]; // empty row between tables
    const ws = XLSX.utils.json_to_sheet(allData);
    ws["!cols"] = Object.keys(allData[0]).map(() => ({ wch: 20 }));

    // Style cho từng cell
    const range = XLSX.utils.decode_range(ws["!ref"] || "");
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cell = XLSX.utils.encode_cell({ r: R, c: C });
        if (!ws[cell]) continue;
        const isHeader = R === 0 || (documentData.length > 0 && R === documentData.length + 1); // cả 2 header

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
    XLSX.utils.book_append_sheet(wb, ws, "BANG_GIA_BAN");
    XLSX.writeFile(wb, "Bang_Gia_Ban.xlsx");
  };

  const columns: GridColDef[] = [
    {
      field: "_id",
      headerName: "ID",
      flex: 1.2,
      minWidth: 120,
      renderCell: ({ row }: { row: ISalePrice }) => (
        <Box display="flex" alignItems="center" height="100%">
          <Typography
            sx={{ cursor: "pointer", textDecoration: "underline" }}
            color="primary"
            onClick={() => {
              setSelected(row);
              setOpenDetailDialog(true);
            }}
          >
            #{row._id?.slice(-10)}
          </Typography>
        </Box>
      ),
    },
    {
      field: "partnerId",
      headerName: "PARTNER",
      flex: 1,
      minWidth: 150,
      renderCell: ({ row }) => (typeof row.partnerId === "object" ? row.partnerId?.name : row.partnerId),
    },
    {
      field: "carrierId",
      headerName: "HÃNG",
      minWidth: 150,
      flex: 1,
      renderCell: ({ row }) => (typeof row.carrierId === "object" ? row.carrierId?.name : row.carrierId),
    },
    {
      field: "serviceId",
      headerName: "DỊCH VỤ",
      flex: 1,
      minWidth: 100,
      renderCell: ({ row }) => (typeof row.serviceId === "object" ? row.serviceId?.code : row.serviceId),
    },
    {
      field: "zone",
      headerName: "ZONE",
      flex: 0.5,
      minWidth: 80,
      align: "center",
    },
    {
      field: "weightMin",
      headerName: "TỪ KG",
      flex: 0.7,
      minWidth: 100,
      align: "center",
      renderCell: ({ value }) => value + " KG",
    },
    {
      field: "weightMax",
      headerName: "ĐẾN KG",
      flex: 0.7,
      minWidth: 100,
      align: "center",
      renderCell: ({ value }) => value + " KG",
    },
    {
      field: "price",
      headerName: "GIÁ",
      minWidth: 150,
      flex: 1,
      renderCell: ({ row }) => formatCurrency(row.price, row.currency),
    },
    {
      field: "currency",
      headerName: "TIỀN TỆ",
      flex: 0.5,
      minWidth: 80,
      align: "center",
    },
    {
      field: "isPricePerKG",
      headerName: "LOẠI GIÁ",
      flex: 1,
      minWidth: 120,
      renderCell: ({ value }) => <Chip label={value ? "Giá theo KG" : "Giá theo Gói"} sx={{ color: value ? orange[500] : green[500] }} size="small" />,
    },
    {
      field: "status",
      headerName: "TRẠNG THÁI",
      flex: 0.8,
      minWidth: 120,
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
          status={row.status}
        />
      ),
    },
  ];

  const renderDataGrid = (title: string, data: ISalePrice[]) => (
    <Box>
      <Typography variant="h6" sx={{ mb: 1, fontWeight: "bold", color: orange[500] }}>
        {title}
      </Typography>
      <DataGrid
        rows={data.map((r) => ({ ...r, id: r._id }))}
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
    </Box>
  );

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
        <Stack direction="row" spacing={1}>
          <Select size="small" value={partnerIdFilter} onChange={(e) => setPartnerIdFilter(e.target.value)} displayEmpty sx={{ minWidth: 160 }}>
            <MenuItem value="">Tất cả Partner</MenuItem>
            {partners.map((p) => (
              <MenuItem key={p._id} value={p._id}>
                {p.name}
              </MenuItem>
            ))}
          </Select>
          <Select size="small" value={carrierIdFilter} onChange={(e) => setCarrierIdFilter(e.target.value)} displayEmpty sx={{ minWidth: 160 }}>
            <MenuItem value="">Tất cả Hãng</MenuItem>
            {carriers.map((c) => (
              <MenuItem key={c._id} value={c._id}>
                {c.name}
              </MenuItem>
            ))}
          </Select>
          <Select size="small" value={serviceIdFilter} onChange={(e) => setServiceIdFilter(e.target.value)} displayEmpty sx={{ minWidth: 160 }}>
            <MenuItem value="">Tất cả Dịch vụ</MenuItem>
            {services.map((s) => (
              <MenuItem key={s._id} value={s._id}>
                {s.code}
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
        <Stack spacing={4}>
          {renderDataGrid(
            "DOCUMENT",
            prices.filter((p) => p.productType === EPRODUCT_TYPE.DOCUMENT)
          )}
          {renderDataGrid(
            "PARCEL",
            prices.filter((p) => p.productType === EPRODUCT_TYPE.PARCEL)
          )}
        </Stack>
      )}

      <CreateSalePriceDialog
        open={openCreateDialog}
        onClose={() => setOpenCreateDialog(false)}
        onCreated={() => {
          fetchData();
          setOpenCreateDialog(false);
        }}
      />
      <UpdateSalePriceDialog open={openUpdateDialog} onClose={() => setOpenUpdateDialog(false)} onUpdated={fetchData} salePrice={selected} />
      <SalePriceDetailDialog open={openDetailDialog} onClose={() => setOpenDetailDialog(false)} salePrice={selected} />
    </Box>
  );
}
