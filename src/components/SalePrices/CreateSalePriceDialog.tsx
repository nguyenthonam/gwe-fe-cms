"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  MenuItem,
  Select,
  Stack,
  Grid,
  InputLabel,
  FormControl,
  FormControlLabel,
  Checkbox,
  TextField,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useState, useEffect } from "react";
import { useNotification } from "@/contexts/NotificationProvider";
import { createSalePriceApi } from "@/utils/apis/apiSalePrice";
import { getCarriersApi } from "@/utils/apis/apiCarrier";
import { getServicesByCarrierApi } from "@/utils/apis/apiService";
import { getPartnersApi } from "@/utils/apis/apiPartner";
import { ECURRENCY, EPRODUCT_TYPE } from "@/types/typeGlobals";
import { ISalePrice } from "@/types/typeSalePrice";
import { formatCurrency } from "@/utils/hooks/hookCurrency";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

interface WeightRange {
  min: number;
  max: number;
  label: string;
}

interface ParsedTable {
  weightRanges: WeightRange[];
  zones: number[];
  prices: number[][];
}

export default function CreateSalePriceDialog({ open, onClose, onCreated }: Props) {
  const [carriers, setCarriers] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [partners, setPartners] = useState<any[]>([]);
  const [carrierId, setCarrierId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [partnerId, setPartnerId] = useState("");
  const [productType, setProductType] = useState(EPRODUCT_TYPE.DOCUMENT);
  const [currency, setCurrency] = useState(ECURRENCY.VND);
  const [isPricePerKG, setIsPricePerKG] = useState(false);

  const [excelInput, setExcelInput] = useState("");
  const [parsedTable, setParsedTable] = useState<ParsedTable | null>(null);
  const [loading, setLoading] = useState(false);

  const { showNotification } = useNotification();

  useEffect(() => {
    if (!open) {
      setExcelInput("");
      setParsedTable(null);
      setCarrierId("");
      setServiceId("");
      setPartnerId("");
      setProductType(EPRODUCT_TYPE.DOCUMENT);
      setCurrency(ECURRENCY.VND);
      setIsPricePerKG(false);
    }

    if (open) {
      fetchCarriers();
      fetchPartners();
    }
  }, [open]);

  useEffect(() => {
    if (isPricePerKG && productType !== EPRODUCT_TYPE.PARCEL) {
      setProductType(EPRODUCT_TYPE.PARCEL);
    }
  }, [isPricePerKG]);

  const fetchCarriers = async () => {
    try {
      const res = await getCarriersApi();
      setCarriers(res?.data?.data?.data || []);
    } catch {
      showNotification("Failed to load carriers", "error");
    }
  };

  const fetchPartners = async () => {
    try {
      const res = await getPartnersApi();
      setPartners(res?.data?.data?.data || []);
    } catch {
      showNotification("Failed to load partners", "error");
    }
  };

  const fetchServices = async (carrierId: string) => {
    const selected = carriers.find((c) => c._id === carrierId);
    const companyId = typeof selected?.companyId === "object" ? selected?.companyId?._id : selected?.companyId;
    if (!companyId) return;
    try {
      const res = await getServicesByCarrierApi(companyId);
      setServices(res?.data?.data?.data || []);
    } catch {
      showNotification("Failed to load services", "error");
    }
  };

  useEffect(() => {
    if (carrierId) fetchServices(carrierId);
  }, [carrierId]);

  const handlePasteExcel = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pasted = e.clipboardData.getData("text");
    setExcelInput(pasted);
    parseExcelTable(pasted);
    e.preventDefault();
  };

  const handleChangeExcelInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setExcelInput(e.target.value);
    parseExcelTable(e.target.value);
  };

  function parseExcelTable(text: string) {
    if (!text.trim()) {
      setParsedTable(null);
      return;
    }
    const lines = text.trim().split(/\r?\n/);
    let zones: number[] = [];
    let weightRanges: WeightRange[] = [];
    const prices: number[][] = [];

    let isZoneHeader = false;
    if (lines.length && isNaN(Number(lines[0].trim().split(/\t| +/)[0].replace("-", "")))) {
      isZoneHeader = true;
      zones = lines[0]
        .trim()
        .split(/\t| +/)
        .slice(1)
        .map((x, zidx) => Number(x.replace(/,/g, "")) || zidx + 1);
    }
    const startLine = isZoneHeader ? 1 : 0;

    for (let i = startLine; i < lines.length; ++i) {
      const arr = lines[i]
        .trim()
        .split(/\t| +/)
        .filter((s) => s !== "")
        .map((x) => x.replace(/,/g, ""));
      if (arr.length < 2) continue;

      let min = 0,
        max = 0;
      const label = arr[0];
      if (/^\d+(\.\d+)?-\d+(\.\d+)?$/.test(arr[0])) {
        [min, max] = arr[0].split("-").map(Number);
      } else {
        min = Number(arr[0]);
        max = min;
      }
      weightRanges.push({ min, max, label });
      prices.push(arr.slice(1).map(Number));
    }

    if (!zones.length && prices.length > 0) {
      zones = prices[0].map((_, idx) => idx + 1);
    }

    const isSingle = weightRanges.length > 1 && weightRanges.every((w, i, arr) => w.min === w.max && (i === 0 || arr[i - 1].min < w.min));
    if (isSingle) {
      const newRanges: WeightRange[] = [];
      for (let i = 0; i < weightRanges.length; ++i) {
        let min = 0,
          max = 0;
        const label = lines[startLine + i].trim().split(/\t| +/)[0];
        if (i === 0) {
          min = 0;
          max = weightRanges[0].min;
        } else {
          min = parseFloat((weightRanges[i - 1].min + 0.01).toFixed(2));
          max = weightRanges[i].min;
        }
        newRanges.push({ min, max, label });
      }
      weightRanges = newRanges;
    }

    setParsedTable({ weightRanges, zones, prices });
  }

  const handleSubmitAll = async () => {
    if (!carrierId || !serviceId || !partnerId || !parsedTable || !currency) {
      showNotification("Please fill all fields and paste rate table!", "warning");
      return;
    }
    try {
      setLoading(true);
      const data: ISalePrice[] = [];
      for (let wi = 0; wi < parsedTable.weightRanges.length; wi++) {
        const { min, max } = parsedTable.weightRanges[wi];
        for (let zi = 0; zi < parsedTable.zones.length; zi++) {
          data.push({
            carrierId,
            serviceId,
            partnerId,
            productType,
            zone: parsedTable.zones[zi],
            weightMin: min,
            weightMax: max,
            price: parsedTable.prices[wi][zi],
            currency,
            isPricePerKG,
          });
        }
      }
      await createSalePriceApi(data);
      showNotification("Batch sale price created successfully", "success");
      onCreated();
      setExcelInput("");
      setParsedTable(null);
    } catch (err: any) {
      showNotification(err.message || "Error creating sale price", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Create Sale Price from Excel Table</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <Grid container spacing={2}>
            <Grid size={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Product Type</InputLabel>
                <Select label="Product Type" value={productType} onChange={(e) => setProductType(e.target.value as EPRODUCT_TYPE)} disabled={isPricePerKG}>
                  <MenuItem value={EPRODUCT_TYPE.DOCUMENT}>DOCUMENT</MenuItem>
                  <MenuItem value={EPRODUCT_TYPE.PARCEL}>PARCEL</MenuItem>
                </Select>
              </FormControl>
              {isPricePerKG && (
                <Typography variant="caption" color="warning.main" sx={{ mt: 0.5, ml: 1 }}>
                  {`If "Price per KG" is selected, product type will be automatically set to "Parcel"`}
                </Typography>
              )}
            </Grid>
            <Grid size={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Partner</InputLabel>
                <Select label="Partner" value={partnerId} onChange={(e) => setPartnerId(e.target.value)}>
                  {partners?.map((p) => (
                    <MenuItem key={p._id} value={p._id}>
                      {p.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Sub Carrier</InputLabel>
                <Select label="Sub Carrier" value={carrierId} onChange={(e) => setCarrierId(e.target.value)}>
                  {carriers?.map((c) => (
                    <MenuItem key={c._id} value={c._id}>
                      {c.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Service</InputLabel>
                <Select label="Service" value={serviceId} onChange={(e) => setServiceId(e.target.value)}>
                  {services?.map((s) => (
                    <MenuItem key={s._id} value={s._id}>
                      {s.code}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Currency</InputLabel>
                <Select label="Currency" value={currency} onChange={(e) => setCurrency(e.target.value as ECURRENCY)}>
                  {Object.values(ECURRENCY).map((cur) => (
                    <MenuItem key={cur} value={cur}>
                      {cur}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={6}>
              <FormControlLabel control={<Checkbox checked={isPricePerKG} onChange={(e) => setIsPricePerKG(e.target.checked)} />} label="Price per KG" />
            </Grid>
          </Grid>

          <TextField
            label="Paste rate table from Excel (zones as columns, weight or weightMin-weightMax as rows)"
            fullWidth
            multiline
            minRows={4}
            value={excelInput}
            placeholder={`0.5\t696,900\t764,267...\n30.1-70\t99,889\t103,374...`}
            onPaste={(e: React.ClipboardEvent<any>) => handlePasteExcel(e)}
            onChange={handleChangeExcelInput}
            variant="outlined"
            size="small"
            sx={{ mt: 2 }}
          />

          {parsedTable && (
            <Paper sx={{ mt: 2, maxHeight: 350, overflow: "auto" }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell align="center" sx={{ fontWeight: 700, bgcolor: "#f5f5dc" }}>
                      {parsedTable.weightRanges.some((w) => w.label.includes("-")) ? "Weight Range" : "From – To (kg)"}
                    </TableCell>
                    {parsedTable.zones.map((zone) => (
                      <TableCell align="center" key={zone} sx={{ fontWeight: 700, bgcolor: "#fffde7" }}>
                        Zone {zone}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {parsedTable.weightRanges.map((w, wi) => (
                    <TableRow key={wi}>
                      <TableCell align="center" sx={{ fontWeight: 700, bgcolor: "#f5f5dc" }}>
                        {w.label}
                      </TableCell>
                      {parsedTable.zones.map((zone, zi) => (
                        <TableCell align="center" key={zone}>
                          {formatCurrency(parsedTable.prices[wi][zi], currency)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmitAll} variant="contained" disabled={loading || !parsedTable}>
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}
