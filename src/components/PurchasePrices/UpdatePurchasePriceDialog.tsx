"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Stack,
  Paper,
  Grid,
  Select,
  MenuItem,
  Dialog as MuiDialog,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  useTheme,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Delete as DeleteIcon, Restore as RestoreIcon } from "@mui/icons-material";
import { lightBlue, red, green } from "@mui/material/colors";
import { useEffect, useMemo, useState } from "react";
import { IPurchasePriceGroup, IPurchasePriceGroupData } from "@/types/typePurchasePrice";
import { EPRODUCT_TYPE, ECURRENCY } from "@/types/typeGlobals";
import { updateGroupPurchasePriceApi } from "@/utils/apis/apiPurchasePrice";
import { useNotification } from "@/contexts/NotificationProvider";
import { getCarriersApi } from "@/utils/apis/apiCarrier";
import { getSuppliersApi } from "@/utils/apis/apiSupplier";
import { getServicesApi, getServicesByCarrierApi } from "@/utils/apis/apiService";
import { getId } from "@/utils/hooks/hookGlobals";

// ✅ dùng hookNumber cho định dạng số/weight
import { formatNumberVi, formatWeightVi } from "@/utils/hooks/hookNumber";

/* ---------- Props ---------- */
interface Props {
  open: boolean;
  group: IPurchasePriceGroup;
  onClose: () => void;
  onUpdated: () => void;
}

/* ---------- Format giá: không kèm currency trong từng ô ---------- */
const formatPriceCell = (value: number) => {
  // Default: dùng formatNumberVi, tự xử lý min/maxFractionDigits theo mặc định
  return formatNumberVi(value);
};

/* ---------- PriceTable (preview giống Detail, nhưng không cho sửa) ---------- */
function PriceTable({
  label,
  currencyLabel,
  zones,
  rows,
  headerTitle = "Weight (kg)",
}: {
  label: string;
  currencyLabel: string;
  zones: number[];
  rows: Array<[string, ...string[]]>;
  headerTitle?: string;
}) {
  const theme = useTheme();
  return (
    <Box sx={{ my: 1.5, overflowX: "auto" }}>
      <Typography fontWeight={700} fontSize={15} color="primary.dark" mb={0.5} letterSpacing={0.5}>
        {label}
      </Typography>
      <Typography fontWeight={600} fontSize={13} color="#1b4786" mb={1}>
        Currency: {currencyLabel}
      </Typography>
      <Table
        size="small"
        sx={{
          minWidth: 800,
          border: "1px solid #f1f1f1",
          background: "#fff",
          borderRadius: 2,
          overflow: "hidden",
          boxShadow: theme.shadows[1],
        }}
      >
        <TableHead>
          <TableRow>
            <TableCell
              sx={{
                fontWeight: 700,
                background: "#FFFACD",
                color: "#C65911",
                border: "1px solid #f1f1f1",
                textAlign: "center",
                minWidth: 120,
              }}
            >
              {headerTitle}
            </TableCell>
            {zones.map((z) => (
              <TableCell
                key={z}
                sx={{
                  fontWeight: 700,
                  background: "#FFFACD",
                  color: "#C65911",
                  border: "1px solid #f1f1f1",
                  textAlign: "center",
                  minWidth: 90,
                }}
              >
                Zone {z}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, i) => (
            <TableRow key={i}>
              <TableCell
                sx={{
                  border: "1px solid #f1f1f1",
                  background: "#fafbfc",
                  fontWeight: 600,
                  textAlign: "center",
                  width: 130,
                }}
              >
                {row[0]}
              </TableCell>
              {row.slice(1).map((cell, idx) => (
                <TableCell
                  key={idx}
                  sx={{
                    border: "1px solid #f1f1f1",
                    textAlign: "right",
                    fontFamily: "inherit",
                    background: "#fff",
                  }}
                >
                  {cell}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
}

/* ---------- Component ---------- */
export default function UpdatePurchasePriceDialog({ open, group, onClose, onUpdated }: Props) {
  const { showNotification } = useNotification();

  // master
  const [carriers, setCarriers] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loadingCarriers, setLoadingCarriers] = useState(false);
  const [loadingSuppliers, setLoadingSuppliers] = useState(false);
  const [loadingServices, setLoadingServices] = useState(false);

  // selections (vẫn cho phép chỉnh group info)
  const [carrierId, setCarrierId] = useState<string>("");
  const [supplierId, setSupplierId] = useState<string>("");
  const [serviceId, setServiceId] = useState<string>("");

  // currency (chung cho cả group)
  const [currency, setCurrency] = useState<ECURRENCY>(ECURRENCY.VND);

  // split data
  const [docDatas, setDocDatas] = useState<IPurchasePriceGroupData[]>([]);
  const [parcelDatas, setParcelDatas] = useState<IPurchasePriceGroupData[]>([]);
  const [perKgDatas, setPerKgDatas] = useState<IPurchasePriceGroupData[]>([]);

  // delete toggles
  const [delDoc, setDelDoc] = useState(false);
  const [delParcel, setDelParcel] = useState(false);
  const [delPerKg, setDelPerKg] = useState(false);
  const [confirm, setConfirm] = useState<{ open: boolean; which?: "doc" | "parcel" | "perKg" }>({ open: false });

  // ✅ popup success
  const [openSuccess, setOpenSuccess] = useState(false);

  const currencyOptions = useMemo(() => Object.values(ECURRENCY).filter((v) => typeof v === "string") as ECURRENCY[], []);

  // init master
  useEffect(() => {
    if (!open) return;
    setLoadingCarriers(true);
    setLoadingSuppliers(true);
    setLoadingServices(true);

    getCarriersApi()
      .then((r) => setCarriers(r?.data?.data?.data || []))
      .finally(() => setLoadingCarriers(false));

    getSuppliersApi()
      .then((r) => setSuppliers(r?.data?.data?.data || []))
      .finally(() => setLoadingSuppliers(false));

    getServicesApi()
      .then((r) => setServices(r?.data?.data?.data || []))
      .finally(() => setLoadingServices(false));
  }, [open]);

  // init data
  useEffect(() => {
    if (!group || !open) return;

    setCarrierId(getId(group.carrierId) || "");
    setSupplierId(getId(group.supplierId) || "");
    setServiceId(getId(group.serviceId) || "");

    const docs: IPurchasePriceGroupData[] = [];
    const parcels: IPurchasePriceGroupData[] = [];
    const perKgs: IPurchasePriceGroupData[] = [];

    (group.datas || []).forEach((d) => {
      if (d.productType === EPRODUCT_TYPE.DOCUMENT) docs.push(d);
      else if (d.productType === EPRODUCT_TYPE.PARCEL && !d.isPricePerKG) parcels.push(d);
      else if (d.productType === EPRODUCT_TYPE.PARCEL && d.isPricePerKG) perKgs.push(d);
    });

    setDocDatas(docs);
    setParcelDatas(parcels);
    setPerKgDatas(perKgs);

    // lấy currency đầu tiên trong group (nếu có), default VND
    const allDatas = group.datas || [];
    const firstCurrency = allDatas[0]?.currency || ECURRENCY.VND;
    setCurrency(firstCurrency as ECURRENCY);

    setDelDoc(false);
    setDelParcel(false);
    setDelPerKg(false);
    setOpenSuccess(false);
  }, [group, open]);

  // reload services when carrier changes
  useEffect(() => {
    if (!carrierId) {
      setLoadingServices(true);
      getServicesApi()
        .then((r) => setServices(r?.data?.data?.data || []))
        .finally(() => setLoadingServices(false));
      return;
    }
    const c = carriers.find((x) => x._id === carrierId);
    const companyId = typeof c?.companyId === "object" ? c?.companyId?._id : c?.companyId;
    if (!companyId) return;
    setLoadingServices(true);
    getServicesByCarrierApi(companyId)
      .then((r) => {
        const arr = r?.data?.data?.data || [];
        setServices(arr);
        // nếu serviceId hiện tại không thuộc company mới thì chọn service đầu tiên
        if (!arr.some((s: any) => getId(s) === serviceId)) {
          setServiceId(arr[0]?._id || "");
        }
      })
      .finally(() => setLoadingServices(false));
  }, [carrierId, carriers, serviceId]);

  // Fix Select "out-of-range value" khi options chưa load xong
  const carrierValue = useMemo(() => (carriers.some((c) => c._id === carrierId) ? carrierId : ""), [carrierId, carriers]);
  const supplierValue = useMemo(() => (suppliers.some((s) => s._id === supplierId) ? supplierId : ""), [supplierId, suppliers]);
  const serviceValue = useMemo(() => (services.some((s) => s._id === serviceId) ? serviceId : ""), [serviceId, services]);

  /* ---------- Build preview rows (dùng hookNumber, currency theo state) ---------- */
  const buildDocOrParcelPreview = (datas: IPurchasePriceGroupData[]) => {
    if (!datas.length) return null;
    const zones = [...new Set(datas.map((d) => d.zone))].sort((a, b) => a - b);
    const weightKeys = [...new Set(datas.map((d) => d.weightMax))].sort((a, b) => (a ?? 0) - (b ?? 0));

    const rows: Array<[string, ...string[]]> = weightKeys.map((w) => {
      const first = formatWeightVi(w ?? 0); // 2,0 ; 2,5 ; ...
      const cells = zones.map((z) => {
        const d = datas.find((x) => x.zone === z && x.weightMax === w);
        return d ? formatPriceCell(d.price) : "";
      });
      return [first, ...cells] as [string, ...string[]];
    });

    return { zones, rows, currencyLabel: currency };
  };

  const buildPerKgPreview = (datas: IPurchasePriceGroupData[]) => {
    if (!datas.length) return null;
    const zones = [...new Set(datas.map((d) => d.zone))].sort((a, b) => a - b);

    const ranges = [...new Set(datas.map((d) => `${d.weightMin}-${d.weightMax}`))].sort((a, b) => {
      const [aMin, aMax] = a.split("-").map(Number);
      const [bMin, bMax] = b.split("-").map(Number);
      return aMin - bMin || aMax - bMax;
    });

    const rows: Array<[string, ...string[]]> = ranges.map((key) => {
      const [min, max] = key.split("-").map(Number);
      const first = `${formatWeightVi(min)}–${formatWeightVi(max)}`;
      const cells = zones.map((z) => {
        const d = datas.find((x) => x.zone === z && x.weightMin === min && x.weightMax === max);
        return d ? formatPriceCell(d.price) : "";
      });
      return [first, ...cells] as [string, ...string[]];
    });

    return { zones, rows, currencyLabel: currency };
  };

  const docPreview = useMemo(() => buildDocOrParcelPreview(docDatas), [docDatas, currency]);
  const parcelPreview = useMemo(() => buildDocOrParcelPreview(parcelDatas), [parcelDatas, currency]);
  const perKgPreview = useMemo(() => buildPerKgPreview(perKgDatas), [perKgDatas, currency]);

  /* ---------- Delete confirm ---------- */
  const openConfirm = (which: "doc" | "parcel" | "perKg") => setConfirm({ open: true, which });
  const applyDelete = () => {
    if (!confirm.which) return setConfirm({ open: false });
    if (confirm.which === "doc") setDelDoc(true);
    if (confirm.which === "parcel") setDelParcel(true);
    if (confirm.which === "perKg") setDelPerKg(true);
    setConfirm({ open: false });
  };

  const restore = (which: "doc" | "parcel" | "perKg") => {
    if (which === "doc") setDelDoc(false);
    if (which === "parcel") setDelParcel(false);
    if (which === "perKg") setDelPerKg(false);
  };

  /* ---------- Submit ---------- */
  const handleSubmit = async () => {
    try {
      // Giữ / xóa theo từng bảng
      const keptDatas: IPurchasePriceGroupData[] = (group.datas || [])
        .filter((d) => {
          if (d.productType === EPRODUCT_TYPE.DOCUMENT) return !delDoc;
          if (d.productType === EPRODUCT_TYPE.PARCEL && !d.isPricePerKG) return !delParcel;
          if (d.productType === EPRODUCT_TYPE.PARCEL && d.isPricePerKG) return !delPerKg;
          return true;
        })
        // ⚠️ set currency mới cho toàn bộ datas còn lại
        .map((d) => ({ ...d, currency }));

      const payload = {
        group: { carrierId, supplierId, serviceId },
        datas: keptDatas,
      };

      await updateGroupPurchasePriceApi(payload);
      showNotification("Purchase price updated successfully", "success");
      onUpdated();
      setOpenSuccess(true); // ✅ show popup
    } catch (err: any) {
      showNotification(err?.message || "Update error", "error");
    }
  };

  /* ---------- UI: Accordion section ---------- */
  const Section = ({
    title,
    preview,
    deleted,
    onDelete,
    onRestore,
    headerTitle,
    color,
  }: {
    title: string;
    preview: { zones: number[]; rows: Array<[string, ...string[]]>; currencyLabel: string } | null;
    deleted: boolean;
    onDelete: () => void;
    onRestore: () => void;
    headerTitle: "Weight (kg)" | "Range (kg)";
    color: string;
  }) => {
    const rowsCount = preview?.rows?.length ?? 0;
    const zoneCount = preview?.zones?.length ?? 0;

    return (
      <Accordion defaultExpanded sx={{ borderRadius: 2, overflow: "hidden", border: "1px solid #eef2f6" }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ bgcolor: "#fafbfc" }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ width: "100%", pr: 1 }}>
            <Box sx={{ flexGrow: 1 }}>
              <Typography fontWeight={700} color={color}>
                {title}
              </Typography>
              <Stack direction="row" spacing={1} mt={0.5}>
                <Chip size="small" label={`${rowsCount} rows`} />
                <Chip size="small" label={`${zoneCount} zones`} />
                {preview?.currencyLabel && <Chip size="small" label={`Currency: ${preview.currencyLabel}`} />}
                {deleted && <Chip size="small" color="error" label="Marked for deletion" />}
              </Stack>
            </Box>
            {!deleted ? (
              <Button
                component="span"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
              >
                Delete
              </Button>
            ) : (
              <Button
                component="span"
                color="success"
                startIcon={<RestoreIcon />}
                onClick={(e) => {
                  e.stopPropagation();
                  onRestore();
                }}
              >
                Restore
              </Button>
            )}
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          {preview ? (
            <Box sx={{ opacity: deleted ? 0.5 : 1 }}>
              <PriceTable label={title} currencyLabel={preview.currencyLabel} zones={preview.zones} rows={preview.rows} headerTitle={headerTitle} />
              {deleted && (
                <Typography variant="body2" sx={{ color: red[600], mt: 1 }}>
                  This whole table will be removed after you click <b>Update</b>.
                </Typography>
              )}
            </Box>
          ) : (
            <Paper variant="outlined" sx={{ p: 2, textAlign: "center", color: "#777" }}>
              No data.
            </Paper>
          )}
        </AccordionDetails>
      </Accordion>
    );
  };

  return (
    <>
      <Dialog open={open} maxWidth="xl" fullWidth onClose={onClose}>
        <DialogTitle sx={{ color: lightBlue[500], fontWeight: "bold" }}>UPDATE PURCHASE PRICE</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            {/* selections */}
            <Paper sx={{ p: 2, mb: 1 }} variant="outlined">
              <Grid container spacing={2}>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography sx={{ mb: 0.5 }}>Sub Carrier</Typography>
                  <Select size="small" value={carrierValue} onChange={(e) => setCarrierId(String(e.target.value))} fullWidth displayEmpty>
                    <MenuItem value="" disabled>
                      {loadingCarriers ? "Loading..." : "Select a sub carrier"}
                    </MenuItem>
                    {carriers.map((c) => (
                      <MenuItem key={c._id} value={c._id}>
                        {c.name}
                      </MenuItem>
                    ))}
                  </Select>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography sx={{ mb: 0.5 }}>Supplier</Typography>
                  <Select size="small" value={supplierValue} onChange={(e) => setSupplierId(String(e.target.value))} fullWidth displayEmpty>
                    <MenuItem value="" disabled>
                      {loadingSuppliers ? "Loading..." : "Select a supplier"}
                    </MenuItem>
                    {suppliers.map((s) => (
                      <MenuItem key={s._id} value={s._id}>
                        {s.name}
                      </MenuItem>
                    ))}
                  </Select>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography sx={{ mb: 0.5 }}>Service</Typography>
                  <Select size="small" value={serviceValue} onChange={(e) => setServiceId(String(e.target.value))} fullWidth displayEmpty>
                    <MenuItem value="" disabled>
                      {loadingServices ? "Loading..." : "Select a service"}
                    </MenuItem>
                    {services.map((s) => (
                      <MenuItem key={s._id} value={s._id}>
                        {s.code || s.name}
                      </MenuItem>
                    ))}
                  </Select>
                </Grid>
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography sx={{ mb: 0.5 }}>Currency</Typography>
                  <Select size="small" value={currency} onChange={(e) => setCurrency(e.target.value as ECURRENCY)} fullWidth>
                    {currencyOptions.map((c) => (
                      <MenuItem key={c} value={c}>
                        {c}
                      </MenuItem>
                    ))}
                  </Select>
                </Grid>
              </Grid>
            </Paper>

            {/* Sections */}
            <Section title="Document Rates" preview={docPreview} deleted={delDoc} onDelete={() => openConfirm("doc")} onRestore={() => restore("doc")} headerTitle="Weight (kg)" color={green[700]} />

            <Section
              title="Non-Document Rates"
              preview={parcelPreview}
              deleted={delParcel}
              onDelete={() => openConfirm("parcel")}
              onRestore={() => restore("parcel")}
              headerTitle="Weight (kg)"
              color="#1b4786"
            />

            <Section title="Rates per KG" preview={perKgPreview} deleted={delPerKg} onDelete={() => openConfirm("perKg")} onRestore={() => restore("perKg")} headerTitle="Range (kg)" color="#C65911" />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} variant="outlined">
            Close
          </Button>
          <Button onClick={handleSubmit} variant="contained">
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirm delete */}
      <MuiDialog open={confirm.open} onClose={() => setConfirm({ open: false })}>
        <DialogTitle>Confirm deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Delete this entire table from the price group? It will be removed after you click <b>Update</b>.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirm({ open: false })}>Cancel</Button>
          <Button onClick={applyDelete} color="error" variant="contained" startIcon={<DeleteIcon />}>
            Delete
          </Button>
        </DialogActions>
      </MuiDialog>

      {/* ✅ Popup báo Updated thành công */}
      <MuiDialog open={openSuccess} onClose={() => setOpenSuccess(false)}>
        <DialogTitle>Updated</DialogTitle>
        <DialogContent>
          <Typography>Purchase price group has been updated successfully.</Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenSuccess(false);
            }}
            variant="contained"
          >
            OK
          </Button>
        </DialogActions>
      </MuiDialog>
    </>
  );
}
