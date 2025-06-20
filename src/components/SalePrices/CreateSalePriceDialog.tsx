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

  // Excel paste state
  const [excelInput, setExcelInput] = useState("");
  const [parsedTable, setParsedTable] = useState<ParsedTable | null>(null);
  const [loading, setLoading] = useState(false);

  const { showNotification } = useNotification();

  useEffect(() => {
    if (!open) {
      setExcelInput("");
      setParsedTable(null);
      // Reset thêm các state khác nếu muốn
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

  const fetchCarriers = async () => {
    try {
      const res = await getCarriersApi();
      setCarriers(res?.data?.data?.data || []);
    } catch (err) {
      console.error("Error fetching carriers:", err);
      showNotification("Không thể tải danh sách Hãng", "error");
    }
  };
  const fetchPartners = async () => {
    try {
      const res = await getPartnersApi();
      setPartners(res?.data?.data?.data || []);
    } catch (err) {
      console.error("Error fetching partners:", err);
      showNotification("Không thể tải danh sách Partner", "error");
    }
  };
  const fetchServices = async (carrierId: string) => {
    const selected = carriers.find((c) => c._id === carrierId);
    const companyId = typeof selected?.companyId === "object" ? selected?.companyId?._id : selected?.companyId;
    if (!companyId) return;
    try {
      const res = await getServicesByCarrierApi(companyId);
      setServices(res?.data?.data?.data || []);
    } catch (err) {
      console.error("Error fetching services:", err);
      showNotification("Không thể tải danh sách dịch vụ", "error");
    }
  };
  useEffect(() => {
    if (carrierId) fetchServices(carrierId);
  }, [carrierId]);

  // --- Excel Paste & Parse ---
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

  // Parse both: từng mức hoặc range min-max
  function parseExcelTable(text: string) {
    if (!text.trim()) {
      setParsedTable(null);
      return;
    }
    const lines = text.trim().split(/\r?\n/);
    let zones: number[] = [];
    let weightRanges: WeightRange[] = [];
    const prices: number[][] = [];

    // Kiểm tra tiêu đề có phải là zone không
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
      let arr = lines[i]
        .trim()
        .split(/\t| +/)
        .filter((s) => s !== "");
      // Bỏ dấu phẩy (ngăn cách nghìn)
      arr = arr.map((x) => x.replace(/,/g, ""));
      if (arr.length < 2) continue;

      let min = 0,
        max = 0,
        label = arr[0];
      // Nếu là range dạng 1.1-2.0 hoặc 300.1-1.000
      if (/^\d+(\.\d+)?-\d+(\.\d+)?$/.test(arr[0])) {
        [min, max] = arr[0].split("-").map(Number);
        label = arr[0];
      } else {
        min = Number(arr[0]);
        max = min;
        label = arr[0];
      }
      weightRanges.push({ min, max, label });
      prices.push(arr.slice(1).map(Number));
    }
    if (!zones.length && prices.length > 0) {
      zones = prices[0].map((_, idx) => idx + 1);
    }

    // Nếu là từng mức lẻ (0.5, 1.0, 1.5...), tự động convert thành khoảng (row 1: 0–0.5, row 2: 0.51–1.0, row 3: 1.01–1.5...)
    const isSingle = weightRanges.length > 1 && weightRanges.every((w, i, arr) => w.min === w.max && (i === 0 || arr[i - 1].min < w.min));
    if (isSingle) {
      const newRanges: WeightRange[] = [];
      for (let i = 0; i < weightRanges.length; ++i) {
        let min = 0,
          max = 0;
        const label = lines[startLine + i].trim().split(/\t| +/)[0]; // lấy arr[0] gốc từ dòng paste
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

  // --- Submit ALL parsed data ---
  const handleSubmitAll = async () => {
    if (!carrierId || !serviceId || !partnerId || !parsedTable || !currency) {
      showNotification("Điền đủ thông tin và dán bảng giá!", "warning");
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
      showNotification("Tạo giá bán hàng loạt thành công", "success");
      onCreated();
      setExcelInput("");
      setParsedTable(null);
    } catch (err: any) {
      console.error("Error creating sale prices:", err);
      showNotification(err.message || "Lỗi tạo giá bán", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Tạo giá bán từ bảng Excel</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <Grid container spacing={2}>
            <Grid size={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Loại hàng</InputLabel>
                <Select label="Loại hàng" value={productType} onChange={(e) => setProductType(e.target.value as EPRODUCT_TYPE)}>
                  <MenuItem value={EPRODUCT_TYPE.DOCUMENT}>DOCUMENT</MenuItem>
                  <MenuItem value={EPRODUCT_TYPE.PARCEL}>PARCEL</MenuItem>
                </Select>
              </FormControl>
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
                <InputLabel>Hãng</InputLabel>
                <Select label="Hãng" value={carrierId} onChange={(e) => setCarrierId(e.target.value)}>
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
                <InputLabel>Dịch vụ</InputLabel>
                <Select label="Dịch vụ" value={serviceId} onChange={(e) => setServiceId(e.target.value)}>
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
                <InputLabel>Tiền tệ</InputLabel>
                <Select label="Tiền tệ" value={currency} onChange={(e) => setCurrency(e.target.value as ECURRENCY)}>
                  {Object.values(ECURRENCY).map((cur) => (
                    <MenuItem key={cur} value={cur}>
                      {cur}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid size={6}>
              <FormControlLabel control={<Checkbox checked={isPricePerKG} onChange={(e) => setIsPricePerKG(e.target.checked)} />} label="Giá theo KG" />
            </Grid>
          </Grid>
          <TextField
            label="Paste bảng giá từ Excel (zone theo cột, weight hoặc weightMin-weightMax theo dòng)"
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
                      {parsedTable.weightRanges.some((w) => w.label.includes("-")) ? "Khoảng cân" : "Từ – Đến (kg)"}
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
        <Button onClick={onClose}>Huỷ</Button>
        <Button onClick={handleSubmitAll} variant="contained" disabled={loading || !parsedTable}>
          Tạo từ bảng
        </Button>
      </DialogActions>
    </Dialog>
  );
}
