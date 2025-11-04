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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  IconButton,
  Grid,
  CircularProgress,
  Select,
  MenuItem,
  Dialog as MuiDialog,
} from "@mui/material";
import { Delete } from "@mui/icons-material";
import { useEffect, useMemo, useState } from "react";
import { IPurchasePriceGroup, IPurchasePriceGroupData } from "@/types/typePurchasePrice";
import { EPRODUCT_TYPE, ECURRENCY } from "@/types/typeGlobals";
import { updateGroupPurchasePriceApi } from "@/utils/apis/apiPurchasePrice";
import { useNotification } from "@/contexts/NotificationProvider";
import { lightBlue } from "@mui/material/colors";
import { getCarriersApi } from "@/utils/apis/apiCarrier";
import { getSuppliersApi } from "@/utils/apis/apiSupplier";
import { getServicesApi, getServicesByCarrierApi } from "@/utils/apis/apiService";
import { getId } from "@/utils/hooks/hookGlobals";

interface Props {
  open: boolean;
  group: IPurchasePriceGroup;
  onClose: () => void;
  onUpdated: () => void;
}

const tableTitleStyle = {
  fontWeight: 700,
  fontSize: 16,
  color: "#1b4786",
  textAlign: "center",
  background: "#f6f8fc",
  padding: "12px 0",
  margin: "18px 0 6px 0",
} as const;

export default function UpdatePurchasePriceDialog({ open, group, onClose, onUpdated }: Props) {
  const { showNotification } = useNotification();

  // master data
  const [carriers, setCarriers] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);

  // selections
  const [carrierId, setCarrierId] = useState<string>("");
  const [supplierId, setSupplierId] = useState<string>("");
  const [serviceId, setServiceId] = useState<string>("");
  const [currency, setCurrency] = useState<ECURRENCY>(ECURRENCY.VND);

  // rows
  const [docRows, setDocRows] = useState<IPurchasePriceGroupData[]>([]);
  const [parcelRows, setParcelRows] = useState<IPurchasePriceGroupData[]>([]);
  const [perKgRows, setPerKgRows] = useState<IPurchasePriceGroupData[]>([]);

  // lazy & success
  const [showParcel, setShowParcel] = useState(false);
  const [showPerKg, setShowPerKg] = useState(false);
  const [loadingParcel, setLoadingParcel] = useState(false);
  const [loadingPerKg, setLoadingPerKg] = useState(false);
  const [openSuccess, setOpenSuccess] = useState(false);

  // init master data
  useEffect(() => {
    if (!open) return;
    getCarriersApi().then((r) => setCarriers(r?.data?.data?.data || []));
    getSuppliersApi().then((r) => setSuppliers(r?.data?.data?.data || []));
    getServicesApi().then((r) => setServices(r?.data?.data?.data || []));
  }, [open]);

  // init selections + rows
  useEffect(() => {
    if (!group || !open) return;

    setCarrierId(getId(group.carrierId) || "");
    setSupplierId(getId(group.supplierId) || "");
    setServiceId(getId(group.serviceId) || "");
    setCurrency(group.datas?.[0]?.currency || ECURRENCY.VND);

    const docs: IPurchasePriceGroupData[] = [];
    const parcels: IPurchasePriceGroupData[] = [];
    const perKgs: IPurchasePriceGroupData[] = [];
    group.datas.forEach((d) => {
      if (d.productType === EPRODUCT_TYPE.DOCUMENT) docs.push(d);
      else if (d.productType === EPRODUCT_TYPE.PARCEL && !d.isPricePerKG) parcels.push(d);
      else if (d.productType === EPRODUCT_TYPE.PARCEL && d.isPricePerKG) perKgs.push(d);
    });

    setDocRows(docs);
    setParcelRows(parcels);
    setPerKgRows(perKgs);
    setShowParcel(false);
    setShowPerKg(false);
  }, [group, open]);

  // reload services when carrier changes
  useEffect(() => {
    if (!carrierId) {
      getServicesApi().then((r) => setServices(r?.data?.data?.data || []));
      return;
    }
    const c = carriers.find((x) => x._id === carrierId);
    const companyId = typeof c?.companyId === "object" ? c?.companyId?._id : c?.companyId;
    if (!companyId) return;
    getServicesByCarrierApi(companyId).then((r) => {
      const arr = r?.data?.data?.data || [];
      setServices(arr);
      if (!arr.some((s: any) => getId(s) === serviceId)) {
        setServiceId(arr[0]?._id || "");
      }
    });
  }, [carrierId, carriers]);

  const handleDeleteRow = (type: "doc" | "parcel" | "perKg", weight: string) => {
    const updater = type === "doc" ? setDocRows : type === "parcel" ? setParcelRows : setPerKgRows;
    const rows = type === "doc" ? docRows : type === "parcel" ? parcelRows : perKgRows;
    const newRows = rows.filter((r) => {
      const key = type === "perKg" ? `${r.weightMin.toFixed(1)}–${r.weightMax.toFixed(1)}` : r.weightMax.toFixed(1);
      return key !== weight;
    });
    updater(newRows);
  };

  const handleCellChange = (type: "doc" | "parcel" | "perKg", idx: number, value: number) => {
    const updater = type === "doc" ? setDocRows : type === "parcel" ? setParcelRows : setPerKgRows;
    const rows = type === "doc" ? docRows : type === "parcel" ? parcelRows : perKgRows;
    updater(rows.map((r, i) => (i === idx ? { ...r, price: value } : r)));
  };

  const handleSubmit = async () => {
    try {
      const datas = [...docRows, ...parcelRows, ...perKgRows].map((d) => ({ ...d, currency }));
      const payload = {
        group: {
          carrierId,
          supplierId,
          serviceId,
        },
        datas,
      };
      await updateGroupPurchasePriceApi(payload);
      showNotification("Purchase price updated successfully", "success");
      setOpenSuccess(true);
      onUpdated();
    } catch (err: any) {
      showNotification(err?.message || "Update error", "error");
    }
  };

  const getZones = (rows: IPurchasePriceGroupData[]) => [...new Set(rows.map((r) => r.zone))].sort((a, b) => a - b);
  const getWeightKeys = (rows: IPurchasePriceGroupData[], isPerKg = false) =>
    [...new Set(rows.map((r) => (isPerKg ? `${r.weightMin.toFixed(1)}–${r.weightMax.toFixed(1)}` : r.weightMax.toFixed(1))))].sort((a, b) => {
      if (!isPerKg) return Number(a) - Number(b);
      return Number(a.split("–")[0]) - Number(b.split("–")[0]);
    });

  const renderTable = (title: string, rows: IPurchasePriceGroupData[], type: "doc" | "parcel" | "perKg", isPerKg = false) => {
    if (!rows.length) return null;
    const zones = getZones(rows);
    const weights = getWeightKeys(rows, isPerKg);

    return (
      <Box mb={3}>
        <Box sx={tableTitleStyle}>{title}</Box>
        <Paper variant="outlined" sx={{ overflowX: "auto" }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700, background: "#FFFACD", textAlign: "center" }}>{isPerKg ? "Weight (kg-range)" : "Weight (kg)"}</TableCell>
                {zones.map((z) => (
                  <TableCell key={z} sx={{ fontWeight: 700, background: "#FFFACD", textAlign: "center" }}>
                    Zone {z}
                  </TableCell>
                ))}
                <TableCell sx={{ bgcolor: "#f8d7da", width: 36 }} />
              </TableRow>
            </TableHead>
            <TableBody>
              {weights.map((w) => (
                <TableRow key={w}>
                  <TableCell align="center">{w}</TableCell>
                  {zones.map((z) => {
                    const idx = rows.findIndex((r) => r.zone === z && (isPerKg ? `${r.weightMin.toFixed(1)}–${r.weightMax.toFixed(1)}` === w : r.weightMax.toFixed(1) === w));
                    const val = idx > -1 ? rows[idx].price : "";
                    return (
                      <TableCell key={z} sx={{ p: 0, minWidth: 90 }}>
                        {idx > -1 ? (
                          <TextField
                            value={val}
                            type="number"
                            variant="standard"
                            onChange={(e) => handleCellChange(type, idx, Number(e.target.value))}
                            inputProps={{ style: { textAlign: "center" }, min: 0 }}
                          />
                        ) : null}
                      </TableCell>
                    );
                  })}
                  <TableCell align="center" sx={{ p: 0 }}>
                    <IconButton color="error" size="small" onClick={() => handleDeleteRow(type, w)}>
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
      </Box>
    );
  };

  const currencyOptions = useMemo(() => Object.values(ECURRENCY).filter((v) => typeof v === "string") as string[], []);

  return (
    <>
      <Dialog open={open} maxWidth="lg" fullWidth onClose={onClose}>
        <DialogTitle sx={{ color: lightBlue[500], fontWeight: "bold" }}>UPDATE PURCHASE PRICE</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <Paper sx={{ p: 2, mb: 1 }} variant="outlined">
              <Grid container spacing={2}>
                <Grid size={6}>
                  <Typography sx={{ mb: 0.5 }}>Sub Carrier</Typography>
                  <Select size="small" value={carrierId} onChange={(e) => setCarrierId(String(e.target.value))} fullWidth>
                    {carriers.map((c) => (
                      <MenuItem key={c._id} value={c._id}>
                        {c.name}
                      </MenuItem>
                    ))}
                  </Select>
                </Grid>
                <Grid size={6}>
                  <Typography sx={{ mb: 0.5 }}>Supplier</Typography>
                  <Select size="small" value={supplierId} onChange={(e) => setSupplierId(String(e.target.value))} fullWidth>
                    {suppliers.map((s) => (
                      <MenuItem key={s._id} value={s._id}>
                        {s.name}
                      </MenuItem>
                    ))}
                  </Select>
                </Grid>
                <Grid size={6}>
                  <Typography sx={{ mb: 0.5 }}>Service</Typography>
                  <Select size="small" value={serviceId} onChange={(e) => setServiceId(String(e.target.value))} fullWidth>
                    {services.map((s) => (
                      <MenuItem key={s._id} value={s._id}>
                        {s.code || s.name}
                      </MenuItem>
                    ))}
                  </Select>
                </Grid>
                <Grid size={6}>
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

            {renderTable("Document Rates", docRows, "doc")}

            <Box sx={{ minHeight: 50 }}>
              {!showParcel && parcelRows.length > 0 && (
                <Button
                  variant="outlined"
                  onClick={() => {
                    setLoadingParcel(true);
                    setTimeout(() => {
                      setShowParcel(true);
                      setLoadingParcel(false);
                    }, 0);
                  }}
                >
                  Show Non-Document Rates Table
                </Button>
              )}
              {loadingParcel && (
                <Box display="flex" justifyContent="center" alignItems="center" height={40}>
                  <span style={{ color: lightBlue[500] }}>Loading...</span>
                  <CircularProgress size="18px" sx={{ color: lightBlue[800], ml: 1 }} />
                </Box>
              )}
              {showParcel && renderTable("Non-Document Rates", parcelRows, "parcel")}
            </Box>

            <Box sx={{ minHeight: 50 }}>
              {!showPerKg && perKgRows.length > 0 && (
                <Button
                  variant="outlined"
                  onClick={() => {
                    setLoadingPerKg(true);
                    setTimeout(() => {
                      setShowPerKg(true);
                      setLoadingPerKg(false);
                    }, 0);
                  }}
                >
                  Show Per KG Rates Table
                </Button>
              )}
              {loadingPerKg && (
                <Box display="flex" justifyContent="center" alignItems="center" height={40}>
                  <span style={{ color: lightBlue[500] }}>Loading...</span>
                  <CircularProgress size="18px" sx={{ color: lightBlue[800], ml: 1 }} />
                </Box>
              )}
              {showPerKg && renderTable("Rates per KG", perKgRows, "perKg", true)}
            </Box>
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

      {/* Success popup for user confirmation */}
      <MuiDialog open={openSuccess} onClose={() => setOpenSuccess(false)}>
        <DialogTitle>Updated</DialogTitle>
        <DialogContent>
          <Typography>Purchase price group has been updated successfully.</Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenSuccess(false);
              onClose();
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
