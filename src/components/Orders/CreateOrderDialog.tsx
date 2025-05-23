"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Grid, Stack, TextField, MenuItem, InputLabel, FormControl, Typography, Box, Select } from "@mui/material";
import { useNotification } from "@/contexts/NotificationProvider";
import { createOrderApi } from "@/utils/apis/apiOrder";
import { getCarriersApi } from "@/utils/apis/apiCarrier";
import { getPartnersApi } from "@/utils/apis/apiPartner";
import { getSuppliersApi } from "@/utils/apis/apiSupplier";
import { getServicesByCarrierApi } from "@/utils/apis/apiService";
import NumericInput from "../Globals/NumericInput";
import { ECountryCode, ECURRENCY, EPRODUCT_TYPE, IDimension } from "@/types/typeGlobals";
import { COUNTRIES } from "@/utils/constants";
import DimensionTable from "../Bill/DimensionTable";
import CountrySelect from "../Globals/CountrySelect";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateOrderDialog({ open, onClose, onCreated }: Props) {
  // Dropdown Data
  const [partners, setPartners] = useState<any[]>([]);
  const [carriers, setCarriers] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);

  // Form State
  const [partnerId, setPartnerId] = useState("");
  const [carrierId, setCarrierId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [supplierId, setSupplierId] = useState("");

  // Billing Info
  const [note, setNote] = useState("");

  // Volume Weight Rate
  const [volWeightRate, setVolWeightRate] = useState(null);

  // Sender
  const [sender, setSender] = useState({ name: "", address1: "", address2: "", address3: "", phone: "" });

  // Recipient
  const [recipient, setRecipient] = useState({
    name: "",
    attention: "",
    address1: "",
    address2: "",
    address3: "",
    phone: "",
    country: "",
    city: "",
    state: "",
    postCode: "",
  });

  // Product Info
  const [content, setContent] = useState("");
  const [productType, setProductType] = useState(EPRODUCT_TYPE.DOCUMENT);
  const [grossWeight, setGrossWeight] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [declaredValue, setDeclaredValue] = useState("");
  const [currency, setCurrency] = useState(ECURRENCY.USD);

  // Dimension (dùng array cho nhiều kiện nếu cần)
  const [dimensions, setDimensions] = useState<IDimension[] | []>();

  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();

  const fetchServices = async (carrierId: string) => {
    const selected = carriers.find((c) => c._id === carrierId);
    const companyId = typeof selected?.companyId === "object" ? selected?.companyId?._id : selected?.companyId;

    if (!companyId) return;

    try {
      const res = await getServicesByCarrierApi(companyId);
      setServices(res?.data?.data?.data || []);
    } catch (err: any) {
      console.log(err.massage);
      showNotification("Không thể tải dịch vụ!", "error");
    }
  };

  // Preload Dropdown
  useEffect(() => {
    if (open) {
      getPartnersApi().then((res) => setPartners(res?.data?.data?.data || []));
      getCarriersApi().then((res) => setCarriers(res?.data?.data?.data || []));
      getSuppliersApi().then((res) => setSuppliers(res?.data?.data?.data || []));
      setPartnerId("");
      setCarrierId("");
      setServiceId("");
      setSupplierId("");
      setNote("");
      setSender({ name: "", address1: "", address2: "", address3: "", phone: "" });
      setRecipient({ name: "", attention: "", address1: "", address2: "", address3: "", phone: "", country: "", city: "", state: "", postCode: "" });
      setContent("");
      setProductType(EPRODUCT_TYPE.DOCUMENT);
      setGrossWeight("");
      setQuantity("1");
      setDeclaredValue("");
      setCurrency(ECURRENCY.USD);
      setDimensions([]);
    }
  }, [open]);

  useEffect(() => {
    if (carrierId) {
      fetchServices(carrierId);
      setVolWeightRate(carriers.find((c) => c._id === carrierId)?.volWeightRate || null);
    } else {
      setServices([]);
      setVolWeightRate(null);
    }
    setServiceId("");
  }, [carrierId]);

  // Add/Remove dimensions
  const handleDimensionChange = (rows: IDimension[]) => {
    setDimensions(rows || []);
  };

  // Validate & Submit
  const handleSubmit = async () => {
    if (
      !partnerId ||
      !carrierId ||
      !serviceId ||
      !supplierId ||
      !sender.name ||
      !sender.address1 ||
      !sender.phone ||
      !recipient.name ||
      !recipient.address1 ||
      !recipient.phone ||
      !recipient.country ||
      !content ||
      !grossWeight ||
      !quantity
    ) {
      showNotification("Vui lòng nhập đầy đủ thông tin!", "warning");
      return;
    }
    try {
      setLoading(true);
      await createOrderApi({
        carrierId,
        serviceId,
        supplierId,
        partner: { partnerId, partnerName: partners.find((p) => p._id === partnerId)?.name || "" },
        sender: {
          fullname: sender.name,
          phone: sender.phone,
          address1: sender.address1 || "",
          address2: sender.address2 || "",
          address3: sender.address3 || "",
        },
        recipient: {
          fullname: recipient.name,
          phone: recipient.phone,
          address1: sender.address1 || "",
          address2: sender.address2 || "",
          address3: sender.address3 || "",
          country: { code: recipient.country as ECountryCode, name: COUNTRIES.find((c) => c.code === recipient.country)?.name || "" },
          attention: recipient.attention,
          city: recipient.city,
          state: recipient.state,
          postCode: recipient.postCode,
        },
        packageDetail: {
          content,
          declaredWeight: Number(grossWeight),
          quantity: Number(quantity),
          declaredValue: Number(declaredValue),
          currency,
          dimensions: dimensions || [],
        },
        note,
        productType: productType,
      });
      showNotification("Tạo đơn hàng thành công", "success");
      onCreated();
    } catch (err: any) {
      showNotification(err.message || "Lỗi tạo đơn hàng", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Tạo đơn hàng mới</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          {/* Billing Info */}
          <Box className="mb-2 bg-gray-100 border rounded-sm">
            <Typography variant="h6" sx={{ background: "#2196f3", color: "#fff", px: 2, py: 1 }}>
              Billing Information
            </Typography>
            <Grid container spacing={2} sx={{ p: 2 }}>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Partner</InputLabel>
                  <Select value={partnerId} label="Partner" onChange={(e) => setPartnerId(e.target.value)}>
                    {partners.map((p) => (
                      <MenuItem key={p._id} value={p._id}>
                        {p.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Hãng</InputLabel>
                  <Select value={carrierId} label="Hãng" onChange={(e) => setCarrierId(e.target.value)}>
                    {carriers.map((c) => (
                      <MenuItem key={c._id} value={c._id}>
                        {c.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Supplier</InputLabel>
                  <Select value={supplierId} label="Supplier" onChange={(e) => setSupplierId(e.target.value)}>
                    {suppliers.map((s) => (
                      <MenuItem key={s._id} value={s._id}>
                        {s.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Dịch vụ</InputLabel>
                  <Select value={serviceId} label="Dịch vụ" onChange={(e) => setServiceId(e.target.value)}>
                    {services.map((s) => (
                      <MenuItem key={s._id} value={s._id}>
                        {s.code}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>

          {/* Sender */}
          <Box className="mb-2 bg-gray-100 border rounded-sm">
            <Typography variant="h6" sx={{ background: "#2196f3", color: "#fff", px: 2, py: 1 }}>
              Sender Information
            </Typography>
            <Grid container spacing={2} sx={{ p: 2 }}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField label="Sender" value={sender.name} onChange={(e) => setSender((s) => ({ ...s, name: e.target.value }))} fullWidth size="small" required />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField label="Phone" value={sender.phone} onChange={(e) => setSender((s) => ({ ...s, phone: e.target.value }))} fullWidth size="small" required />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField label="Address 1" value={sender.address1} onChange={(e) => setSender((s) => ({ ...s, address1: e.target.value }))} fullWidth size="small" required />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField label="Address 2" value={sender.address2} onChange={(e) => setSender((s) => ({ ...s, address2: e.target.value }))} fullWidth size="small" />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField label="Address 3" value={sender.address3} onChange={(e) => setSender((s) => ({ ...s, address3: e.target.value }))} fullWidth size="small" />
              </Grid>
            </Grid>
          </Box>

          {/* Recipient */}
          <Box className="mb-2 bg-gray-100 border rounded-sm">
            <Typography variant="h6" sx={{ background: "#2196f3", color: "#fff", px: 2, py: 1 }}>
              Recipient Information
            </Typography>
            <Grid container spacing={2} sx={{ p: 2 }}>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField label="Name" value={recipient.name} onChange={(e) => setRecipient((s) => ({ ...s, name: e.target.value }))} fullWidth size="small" required />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField label="Attention" value={recipient.attention} onChange={(e) => setRecipient((s) => ({ ...s, attention: e.target.value }))} fullWidth size="small" />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField label="Phone" value={recipient.phone} onChange={(e) => setRecipient((s) => ({ ...s, phone: e.target.value }))} fullWidth size="small" required />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField label="Address 1" value={recipient.address1} onChange={(e) => setRecipient((s) => ({ ...s, address1: e.target.value }))} fullWidth size="small" required />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField label="Address 2" value={recipient.address2} onChange={(e) => setRecipient((s) => ({ ...s, address2: e.target.value }))} fullWidth size="small" />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField label="Address 3" value={recipient.address3} onChange={(e) => setRecipient((s) => ({ ...s, address3: e.target.value }))} fullWidth size="small" />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField label="City" value={recipient.city} onChange={(e) => setRecipient((s) => ({ ...s, city: e.target.value }))} fullWidth size="small" required />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField label="State" value={recipient.state} onChange={(e) => setRecipient((s) => ({ ...s, state: e.target.value }))} fullWidth size="small" required />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField label="Post Code" value={recipient.postCode} onChange={(e) => setRecipient((s) => ({ ...s, postCode: e.target.value }))} fullWidth size="small" />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Country</InputLabel>
                  <CountrySelect value={recipient.country} onChange={(val) => setRecipient((s) => ({ ...s, country: val || "" }))} label="Quốc gia" required />
                </FormControl>
              </Grid>
            </Grid>
          </Box>

          {/* Product Info */}
          <Box className="mb-2 bg-gray-100 border rounded-sm">
            <Typography variant="h6" sx={{ background: "#2196f3", color: "#fff", px: 2, py: 1 }}>
              Product Information
            </Typography>
            <Grid container spacing={2} sx={{ p: 2 }}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField label="Contents" value={content} onChange={(e) => setContent(e.target.value)} fullWidth size="small" required />
              </Grid>
              <Grid size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Product Code</InputLabel>
                  <Select label="Product Code" value={productType} onChange={(e) => setProductType(e.target.value as EPRODUCT_TYPE)}>
                    <MenuItem value={EPRODUCT_TYPE.DOCUMENT}>DOCUMENT</MenuItem>
                    <MenuItem value={EPRODUCT_TYPE.PARCEL}>PARCEL</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <NumericInput label="Gross Weight (kg)" value={grossWeight} onChange={setGrossWeight} fullWidth size="small" required />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <NumericInput label="PCEs" value={quantity} onChange={setQuantity} fullWidth size="small" required />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <NumericInput label="Declared Value" value={declaredValue} onChange={setDeclaredValue} fullWidth size="small" />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <FormControl fullWidth size="small">
                  <InputLabel>Currency</InputLabel>
                  <Select value={currency} label="Currency" onChange={(e) => setCurrency(e.target.value as ECURRENCY)}>
                    {Object.values(ECURRENCY).map((cur) => (
                      <MenuItem key={cur} value={cur}>
                        {cur}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>

          {/* Dimension Info */}
          <Box className="mb-2 bg-gray-100 border rounded-sm">
            <Typography variant="h6" sx={{ background: "#2196f3", color: "#fff", px: 2, py: 1 }}>
              Dimension
            </Typography>
            <DimensionTable className="px-2 mb-2" volWeightRate={volWeightRate} onRowsChange={(rows) => handleDimensionChange(rows)} />

            {/* <Stack spacing={1} sx={{ px: 2, pt: 1, pb: 2 }}>
              {dimensions.map((d, idx) => (
                <Grid container spacing={1} key={idx}>
                  <Grid size={3}>
                    <NumericInput label="Dài (cm)" value={d.length} onChange={(v) => handleDimensionChange(idx, "length", v)} fullWidth size="small" />
                  </Grid>
                  <Grid size={3}>
                    <NumericInput label="Rộng (cm)" value={d.width} onChange={(v) => handleDimensionChange(idx, "width", v)} fullWidth size="small" />
                  </Grid>
                  <Grid size={3}>
                    <NumericInput label="Cao (cm)" value={d.height} onChange={(v) => handleDimensionChange(idx, "height", v)} fullWidth size="small" />
                  </Grid>
                  <Grid size={3}>
                    <Button color="error" size="small" onClick={() => removeDimensionRow(idx)} disabled={dimensions.length === 1}>
                      Xoá
                    </Button>
                  </Grid>
                </Grid>
              ))}
              <Button variant="outlined" size="small" onClick={addDimensionRow}>
                + Thêm kiện
              </Button>
            </Stack> */}
          </Box>

          {/* Note */}
          <Box className="mb-2 bg-gray-100 border rounded-sm">
            <Typography variant="h6" sx={{ background: "#2196f3", color: "#fff", px: 2, py: 1 }}>
              Note
            </Typography>
            <Box sx={{ p: 2 }}>
              <TextField label="Note" value={note} onChange={(e) => setNote(e.target.value)} fullWidth multiline minRows={3} />
            </Box>
          </Box>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Huỷ</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          Tạo
        </Button>
      </DialogActions>
    </Dialog>
  );
}
