"use client";

import { useState, useRef, useEffect } from "react";
import { Box, Button, Container, Typography, Grid, Stack, MenuItem, TextField, Paper } from "@mui/material";
import { red } from "@mui/material/colors";
import BillPrintDialog from "./BillPrintDialog";
import BillShippingMarkDialog from "./BillShippingMarkDialog";
import { useNotification } from "@/contexts/NotificationProvider";
import { EPRODUCT_TYPE, ECURRENCY, IDimension, ECountryCode, IBasicContactInfor } from "@/types/typeGlobals";
import { getCarriersApi } from "@/utils/apis/apiCarrier";
import { ICreateOrderRequest, IOrder } from "@/types/typeOrder";
import { createOrderApi } from "@/utils/apis/apiOrder";
import { useSelector } from "react-redux";
import { AppState } from "@/store";
import OrderProductSection from "../Orders/Partials/OrderProductSection";
import OrderAddressSection from "../Orders/Partials/OrderAddressSection";
import OrderDimensionSection from "../Orders/Partials/OrderDimensionSection";

// Tạo type đơn giản cho form, mapping từ IOrder (rút gọn cho Bill)

export default function BillForm() {
  // --- State ---
  const { profile } = useSelector((state: AppState) => state.auth);

  // Dropdown Data
  const [billData, setBillData] = useState<IOrder | null>(null);
  const [carriers, setCarriers] = useState<any[]>([]);

  // Form State
  const [partner, setPartner] = useState({ partnerId: "", partnerName: "" });
  const [carrierId, setCarrierId] = useState("");

  // Billing Info
  const [note, setNote] = useState("");

  // Volume Weight Rate
  const [volWeightRate, setVolWeightRate] = useState(null);

  // Sender
  const [sender, setSender] = useState<IBasicContactInfor>({ fullname: "", address1: "", address2: "", address3: "", phone: "" });

  // Recipient
  const [recipient, setRecipient] = useState<{ attention?: string | null } & IBasicContactInfor>({
    fullname: "",
    attention: "",
    address1: "",
    address2: "",
    address3: "",
    phone: "",
    country: { code: ECountryCode.VN, name: "Vietnam" },
    city: "",
    state: "",
    postCode: "",
  });

  // Product Info
  const [content, setContent] = useState("");
  const [productType, setProductType] = useState(EPRODUCT_TYPE.DOCUMENT);
  const [declaredWeight, setDeclaredWeight] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [declaredValue, setDeclaredValue] = useState("");
  const [currency, setCurrency] = useState(ECURRENCY.USD);

  // Dimension (dùng array cho nhiều kiện nếu cần)
  const [dimensions, setDimensions] = useState<IDimension[] | []>();

  const [loading, setLoading] = useState(false);

  const billPopupRef = useRef<any>(null);
  const billShippingMarkPopupRef = useRef<any>(null);
  const { showNotification } = useNotification();

  useEffect(() => {
    getCarriersApi().then((res) => setCarriers(res?.data?.data?.data || []));
  }, []);
  useEffect(() => {
    if (profile?.companyId) {
      setPartner((pre) => ({
        ...pre,
        partnerId: typeof profile.companyId === "object" ? profile.companyId?._id || "" : String(profile.companyId),
        partnerName: typeof profile.companyId === "object" ? profile.companyId?.name || "" : String(profile.companyId) || "",
      }));
    }
  }, [profile]);

  useEffect(() => {
    if (carrierId) {
      setVolWeightRate(carriers.find((c) => c._id === carrierId)?.volWeightRate || null);
    } else {
      setVolWeightRate(null);
    }
  }, [carrierId]);

  // --- Section UI ---
  const BillingSection = () => (
    <Box mb={2}>
      <Paper>
        <Typography variant="h6" sx={{ bgcolor: "#2196f3", color: "#fff", px: 2, py: 1, mb: 2 }}>
          Billing Information
        </Typography>
        <Grid container spacing={2} alignItems="center" sx={{ px: 2, pb: 2 }}>
          <Grid size={4}>
            <Typography variant="body2">Customer</Typography>
          </Grid>
          <Grid size={8}>
            <TextField disabled value={billData?.partner?.partnerName || partner?.partnerName} size="small" fullWidth placeholder="Auto-generate..." sx={{ fontWeight: "bold" }} />
          </Grid>

          <Grid size={4}>
            <Typography variant="body2">HAWB Code</Typography>
          </Grid>
          <Grid size={8}>
            <TextField disabled value={billData?.trackingCode} size="small" fullWidth placeholder="Auto generate after create" sx={{ fontWeight: "bold" }} />
          </Grid>

          <Grid size={4}>
            <Typography variant="body2">CAWB Code</Typography>
          </Grid>
          <Grid size={8}>
            <TextField disabled value={billData?.carrierAirWaybillCode} size="small" fullWidth placeholder="Auto generate after create" sx={{ fontWeight: "bold" }} />
          </Grid>

          <Grid size={4}>
            <Typography variant="body2">Carrier</Typography>
          </Grid>
          <Grid size={8}>
            <TextField
              disabled={!!billData}
              select
              size="small"
              fullWidth
              value={billData?.carrierId && typeof billData.carrierId === "object" ? billData?.carrierId?._id : billData?.carrierId || carrierId}
              onChange={(e) => setCarrierId(e.target.value)}
            >
              {carriers.map((carrier) => (
                <MenuItem key={carrier._id} value={carrier._id}>
                  {carrier.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );

  const SenderSection = () => (
    <Box className="mb-2 ">
      <Paper>
        <Typography variant="h6" sx={{ background: "#2196f3", color: "#fff", px: 2, py: 1 }}>
          Sender Information
        </Typography>
        <OrderAddressSection label="Sender" data={billData?.sender || sender} setData={setSender} showCountry={false} required disabled={!!billData} />
      </Paper>
    </Box>
  );

  const RecipientSection = () => (
    <Box className="mb-2 ">
      <Paper>
        <Typography variant="h6" sx={{ background: "#2196f3", color: "#fff", px: 2, py: 1 }}>
          Recipient Information
        </Typography>
        <OrderAddressSection label="Recipient" data={billData?.recipient || recipient} setData={setRecipient} showCountry={true} required disabled={!!billData} />
      </Paper>
    </Box>
  );

  const ProductSection = () => (
    <Box className="mb-2">
      <Paper>
        <Typography variant="h6" sx={{ background: "#2196f3", color: "#fff", px: 2, py: 1 }}>
          Product Information
        </Typography>
        <OrderProductSection
          content={billData?.packageDetail?.content ?? content}
          setContent={setContent}
          productType={billData?.productType ?? productType}
          setProductType={setProductType}
          declaredWeight={billData?.packageDetail?.declaredWeight?.toString() ?? declaredWeight}
          setDeclaredWeight={setDeclaredWeight}
          quantity={billData?.packageDetail?.quantity?.toString() ?? quantity}
          setQuantity={setQuantity}
          declaredValue={billData?.packageDetail?.declaredValue?.toString() ?? declaredValue}
          setDeclaredValue={setDeclaredValue}
          currency={billData?.packageDetail?.currency ?? currency}
          setCurrency={setCurrency}
          disabled={!!billData}
        />
      </Paper>
    </Box>
  );

  const DimensionSection = () => (
    <OrderDimensionSection volWeightRate={volWeightRate} dimensions={billData?.packageDetail?.dimensions ?? (dimensions || [])} setDimensions={setDimensions} disabled={!!billData} />
  );

  const NoteSection = () => (
    <Box className="mb-2 ">
      <Paper>
        <Typography variant="h6" sx={{ background: "#2196f3", color: "#fff", px: 2, py: 1 }}>
          Note
        </Typography>
        <Box sx={{ p: 2 }}>
          <TextField label="Note" value={billData?.note ?? note} onChange={(e) => setNote(e.target.value)} fullWidth multiline minRows={3} disabled={!!billData} />
        </Box>
      </Paper>
    </Box>
  );

  // Validate & Submit
  const handleSubmit = async () => {
    if (
      !carrierId ||
      !sender.fullname ||
      !sender.address1 ||
      !sender.phone ||
      !recipient.fullname ||
      !recipient.address1 ||
      !recipient.phone ||
      !recipient.country ||
      !content ||
      !declaredWeight ||
      !quantity
    ) {
      showNotification("Vui lòng nhập đầy đủ thông tin!", "warning");
      return;
    }
    try {
      setLoading(true);
      const payload: ICreateOrderRequest = {
        carrierId,
        sender: {
          fullname: sender.fullname,
          phone: sender.phone,
          address1: sender.address1 || "",
          address2: sender.address2 || "",
          address3: sender.address3 || "",
        },
        recipient: {
          fullname: recipient.fullname,
          phone: recipient.phone,
          address1: recipient.address1 || "",
          address2: recipient.address2 || "",
          address3: recipient.address3 || "",
          country: recipient.country,
          attention: recipient.attention,
          city: recipient.city,
          state: recipient.state,
          postCode: recipient.postCode,
        },
        packageDetail: {
          content,
          declaredWeight: Number(declaredWeight),
          quantity: Number(quantity),
          declaredValue: Number(declaredValue),
          currency,
          dimensions: dimensions || [],
        },
        note,
        productType: productType,
      };
      if (partner?.partnerId) {
        payload.partner = {
          partnerId: partner.partnerId,
          partnerName: partner.partnerName,
        };
      }
      const res = await createOrderApi(payload);
      setBillData(res?.data?.data || null);
      showNotification("Tạo đơn hàng thành công", "success");
    } catch (err: any) {
      showNotification(err.message || "Lỗi tạo đơn hàng", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setPartner({ partnerId: "", partnerName: "" });
    setCarrierId("");
    setNote("");
    setSender({ fullname: "", address1: "", address2: "", address3: "", phone: "" });
    setRecipient({ fullname: "", attention: "", address1: "", address2: "", address3: "", phone: "", country: { code: ECountryCode.VN, name: "Vietnam" }, city: "", state: "", postCode: "" });
    setContent("");
    setProductType(EPRODUCT_TYPE.DOCUMENT);
    setDeclaredWeight("");
    setQuantity("1");
    setDeclaredValue("");
    setCurrency(ECURRENCY.USD);
    setDimensions([]);
    setBillData(null);
    billPopupRef.current?.close();
    billShippingMarkPopupRef.current?.close();
    showNotification("Đã xóa thông tin đơn hàng", "info");
  };

  // --- MAIN UI ---
  return (
    <Container maxWidth="lg">
      <Typography variant="h4" fontWeight={700} color="#1565c0">
        VẬN ĐƠN
      </Typography>
      <Box mb={1} className={`py-4 bg-white transition-all sticky top-[56px] md:top-[64px] z-50`}>
        <Stack direction="row" spacing={2} justifyContent={"end"}>
          <Button variant="contained" color="primary" onClick={handleSubmit} disabled={!!billData?._id} loading={loading}>
            Create Bill
          </Button>
          <Button variant="outlined" sx={{ color: red[500], borderColor: red[500] }} onClick={handleClear}>
            Clear
          </Button>
          <Button variant="outlined" color="info" disabled={!billData?._id} onClick={() => billPopupRef.current?.open()}>
            Print Bill
          </Button>
          <Button variant="outlined" color="info" disabled={!billData?._id} onClick={() => billShippingMarkPopupRef.current?.open()}>
            Print Shipping Mark
          </Button>
        </Stack>
      </Box>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          {BillingSection()}
          {SenderSection()}
          {RecipientSection()}
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          {ProductSection()}
          {DimensionSection()}
          {NoteSection()}
        </Grid>
      </Grid>
      {/* POPUP */}
      <BillPrintDialog ref={billPopupRef} data={billData} />
      <BillShippingMarkDialog ref={billShippingMarkPopupRef} data={billData} />
    </Container>
  );
}
