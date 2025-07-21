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
} from "@mui/material";
import { Delete } from "@mui/icons-material";
import { useEffect, useState } from "react";
import { ISalePriceGroup, ISalePriceGroupData } from "@/types/typeSalePrice";
import { EPRODUCT_TYPE, ECURRENCY } from "@/types/typeGlobals";
import { updateGroupSalePriceApi } from "@/utils/apis/apiSalePrice";
import { useNotification } from "@/contexts/NotificationProvider";
import { lightBlue } from "@mui/material/colors";

interface Props {
  open: boolean;
  group: ISalePriceGroup;
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

export default function UpdateSalePriceDialog({ open, group, onClose, onUpdated }: Props) {
  const { showNotification } = useNotification();

  const [docRows, setDocRows] = useState<ISalePriceGroupData[]>([]);
  const [parcelRows, setParcelRows] = useState<ISalePriceGroupData[]>([]);
  const [perKgRows, setPerKgRows] = useState<ISalePriceGroupData[]>([]);
  const [currency, setCurrency] = useState<ECURRENCY>(ECURRENCY.VND);
  const [showParcel, setShowParcel] = useState(false);
  const [showPerKg, setShowPerKg] = useState(false);
  const [loadingParcel, setLoadingParcel] = useState(false);
  const [loadingPerKg, setLoadingPerKg] = useState(false);

  useEffect(() => {
    if (!group) return;
    const docs: ISalePriceGroupData[] = [];
    const parcels: ISalePriceGroupData[] = [];
    const perKgs: ISalePriceGroupData[] = [];

    group.datas.forEach((d) => {
      if (d.productType === EPRODUCT_TYPE.DOCUMENT) docs.push(d);
      else if (d.productType === EPRODUCT_TYPE.PARCEL && !d.isPricePerKG) parcels.push(d);
      else if (d.productType === EPRODUCT_TYPE.PARCEL && d.isPricePerKG) perKgs.push(d);
    });

    setDocRows(docs);
    setParcelRows(parcels);
    setPerKgRows(perKgs);
    setCurrency(group.datas[0]?.currency || ECURRENCY.VND);
    setShowParcel(false);
    setShowPerKg(false);
  }, [group, open]);

  const handleDeleteRow = (type: "doc" | "parcel" | "perKg", weight: string) => {
    const updater = type === "doc" ? setDocRows : type === "parcel" ? setParcelRows : setPerKgRows;
    const rows = type === "doc" ? docRows : type === "parcel" ? parcelRows : perKgRows;

    const newRows = rows.filter((r) => {
      const weightKey = type === "perKg" ? `${r.weightMin.toFixed(1)}–${r.weightMax.toFixed(1)}` : r.weightMax.toFixed(1);
      return weightKey !== weight;
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
          carrierId: group.carrierId,
          partnerId: group.partnerId,
          serviceId: group.serviceId,
        },
        datas,
      };
      await updateGroupSalePriceApi(payload);
      showNotification("Sale price table updated successfully", "success");
      onUpdated();
      onClose();
    } catch (err: any) {
      showNotification(err.message || "Error updating sale price", "error");
    }
  };

  const getZones = (rows: ISalePriceGroupData[]) => [...new Set(rows.map((r) => r.zone))].sort((a, b) => a - b);

  const getWeightKeys = (rows: ISalePriceGroupData[], isPerKg = false) =>
    [...new Set(rows.map((r) => (isPerKg ? `${r.weightMin.toFixed(1)}–${r.weightMax.toFixed(1)}` : r.weightMax.toFixed(1))))].sort((a, b) => {
      if (!isPerKg) return Number(a) - Number(b);
      return Number(a.split("–")[0]) - Number(b.split("–")[0]);
    });

  const renderTable = (title: string, rows: ISalePriceGroupData[], type: "doc" | "parcel" | "perKg", isPerKg = false) => {
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

  return (
    <Dialog open={open} maxWidth="lg" fullWidth onClose={onClose}>
      <DialogTitle sx={{ color: lightBlue[500], fontWeight: "bold" }}>UPDATE SALE PRICE TABLE</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          <Paper sx={{ p: 2, mb: 1 }} variant="outlined">
            <Grid container spacing={2}>
              <Grid size={6}>
                <Typography>
                  Sub Carrier: <b>{typeof group.carrierId === "object" ? group.carrierId?.name : group.carrierId}</b>
                </Typography>
              </Grid>
              <Grid size={6}>
                <Typography>
                  Customer: <b>{typeof group.partnerId === "object" ? group.partnerId?.name : group.partnerId}</b>
                </Typography>
              </Grid>
              <Grid size={6}>
                <Typography>
                  Service: <b>{typeof group.serviceId === "object" ? group.serviceId?.code : group.serviceId}</b>
                </Typography>
              </Grid>
              <Grid size={6}>
                <Typography>
                  Currency: <b>{currency}</b>
                </Typography>
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
                Show Non-Document Rates
              </Button>
            )}
            {loadingParcel && (
              <Box display="flex" justifyContent="center" alignItems="center" height={40}>
                <span style={{ color: lightBlue[500] }}>loading...</span>
                <CircularProgress size="18px" sx={{ color: lightBlue[800] }} />
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
                Show Per KG Rates
              </Button>
            )}
            {loadingPerKg && (
              <Box display="flex" justifyContent="center" alignItems="center" height={40}>
                <span style={{ color: lightBlue[500] }}>loading...</span>
                <CircularProgress size="18px" sx={{ color: lightBlue[800] }} />
              </Box>
            )}
            {showPerKg && renderTable("Per KG Rates", perKgRows, "perKg", true)}
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
  );
}
