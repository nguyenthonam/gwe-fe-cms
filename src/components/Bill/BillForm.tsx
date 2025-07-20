"use client";

import { useState, useRef, useEffect } from "react";
import { Box, Button, Container, Typography, Grid, Stack, MenuItem, TextField, Paper } from "@mui/material";
import { red } from "@mui/material/colors";
import BillPrintDialog from "./BillPrintDialog";
import BillShippingMarkDialog from "./BillShippingMarkDialog";
import { useNotification } from "@/contexts/NotificationProvider";
import { EPRODUCT_TYPE, ECURRENCY, IDimension, ECountryCode, IBasicContactInfor } from "@/types/typeGlobals";
import { getCarriersApi } from "@/utils/apis/apiCarrier";
import { getServicesApi } from "@/utils/apis/apiService";
import { ICreateOrderRequest, IOrder } from "@/types/typeOrder";
import { createOrderApi } from "@/utils/apis/apiOrder";
import { useSelector } from "react-redux";
import { AppState } from "@/store";
import OrderProductSection from "../Orders/Partials/OrderProductSection";
import OrderAddressSection from "../Orders/Partials/OrderAddressSection";
import OrderDimensionSection from "../Orders/Partials/OrderDimensionSection";

export default function BillForm() {
  const { profile } = useSelector((state: AppState) => state.auth);

  // Dropdown Data
  const [billData, setBillData] = useState<IOrder | null>(null);
  const [carriers, setCarriers] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [carrierServiceOptions, setCarrierServiceOptions] = useState<{ label: string; value: string; carrier: any; service: any }[]>([]);

  // Form State
  const [partner, setPartner] = useState({ partnerId: "", partnerName: "" });
  const [carrierService, setCarrierService] = useState<{
    carrierId: string;
    serviceId: string;
  } | null>(null);

  // Billing Info
  const [note, setNote] = useState("");
  const [volWeightRate, setVolWeightRate] = useState<number | null>(null);

  // Sender
  const [sender, setSender] = useState<IBasicContactInfor>({
    fullname: "",
    address1: "",
    address2: "",
    address3: "",
    phone: "",
  });

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

  // Dimension (for multi-packages if needed)
  const [dimensions, setDimensions] = useState<IDimension[] | []>();

  const [loading, setLoading] = useState(false);

  const billPopupRef = useRef<any>(null);
  const billShippingMarkPopupRef = useRef<any>(null);
  const { showNotification } = useNotification();

  // --- NEW: Error State ---
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // --- Validate Function ---
  function validateFields() {
    const newErrors: { [key: string]: string } = {};

    // Carrier/Service
    // if (!carrierService?.carrierId) newErrors.carrierService = "Service is required";
    if (!carrierService?.carrierId || !carrierService?.serviceId) newErrors.service = "Service is required";

    // Sender
    // if (!sender.fullname) newErrors.sender_fullname = "Company name is required";
    if (!sender.address1) newErrors.sender_address1 = "Sender address 1 is required";
    if (!sender.address2) newErrors.sender_address2 = "Sender address 2 is required";
    // if (!sender.phone) newErrors.sender_phone = "Contact number is required";

    // Recipient
    if (!recipient.fullname) newErrors.recipient_fullname = "Company name is required";
    if (!recipient.attention) newErrors.recipient_attention = "Attention is required";
    if (!recipient.address1) newErrors.recipient_address1 = "Recipient address 1 is required";
    if (!recipient.address2) newErrors.recipient_address2 = "Recipient address 2 is required";
    if (!recipient.phone) newErrors.recipient_phone = "Contact number is required";
    if (!recipient.country) newErrors.recipient_country = "Recipient country is required";

    // Product
    if (!content) newErrors.content = "Content is required";
    if (!declaredWeight) newErrors.declaredWeight = "Declared weight is required";
    if (!quantity) newErrors.quantity = "Quantity is required";

    return newErrors;
  }

  // Load Carrier/Service and map
  useEffect(() => {
    getCarriersApi().then((res) => setCarriers(res?.data?.data?.data || []));
    getServicesApi().then((res) => setServices(res?.data?.data?.data || []));
  }, []);

  useEffect(() => {
    if (Array.isArray(carriers) && Array.isArray(services) && carriers.length && services.length) {
      const options: any[] = [];
      carriers.forEach((carrier) => {
        if (!carrier || !carrier.companyId) return;
        services.forEach((service) => {
          if (!service || !service.companyId) return;
          const cId = carrier.companyId;
          const sId = service.companyId;
          if ((typeof cId === "object" && typeof sId === "object" && cId._id && sId._id && cId._id === sId._id) || (typeof cId === "string" && typeof sId === "string" && cId === sId)) {
            options.push({
              label: `${carrier.code}-${service.code}`,
              value: `${carrier._id}_${service._id}`,
              carrier,
              service,
            });
          }
        });
      });
      setCarrierServiceOptions(options);
    }
  }, [carriers, services]);

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
    if (partner?.partnerName && !sender.fullname) {
      setSender((prev) => ({ ...prev, fullname: partner.partnerName }));
    }
    // eslint-disable-next-line
  }, [partner.partnerName]);

  useEffect(() => {
    if (carrierService?.carrierId) {
      const carrier = carriers.find((c) => c._id === carrierService.carrierId);
      setVolWeightRate(carrier?.volWeightRate || null);
    } else {
      setVolWeightRate(null);
    }
  }, [carrierService, carriers]);

  useEffect(() => {
    const qty = dimensions && Array.isArray(dimensions) ? dimensions.length : 0;
    const dw = dimensions && Array.isArray(dimensions) ? dimensions.reduce((sum, d) => sum + Number(d.grossWeight || 0), 0) : 0;
    setQuantity(qty.toString());
    setDeclaredWeight(dw > 0 ? dw.toString() : "");
  }, [dimensions]);

  // --- Section UI ---
  const BillingSection = () => (
    <Box mb={2}>
      <Paper>
        <Typography
          variant="h6"
          sx={{
            bgcolor: "#2196f3",
            color: "#fff",
            px: 2,
            py: 1,
            mb: 2,
            textTransform: "uppercase",
          }}
        >
          BILLING INFORMATION
        </Typography>
        <Grid container spacing={2} alignItems="center" sx={{ px: 2, pb: 2 }}>
          <Grid size={4}>
            <Typography variant="body2" sx={{ textTransform: "uppercase" }}>
              HAWB CODE
            </Typography>
          </Grid>
          <Grid size={8}>
            <TextField disabled value={billData?.trackingCode} size="small" fullWidth placeholder="Auto generate..." sx={{ fontWeight: "bold" }} />
          </Grid>
          <Grid size={4}>
            <Typography variant="body2" sx={{ textTransform: "uppercase" }}>
              SERVICE
            </Typography>
          </Grid>
          <Grid size={8}>
            <TextField
              disabled={!!billData}
              select
              size="small"
              fullWidth
              error={!!errors.carrierService}
              helperText={errors.carrierService}
              value={
                billData?.carrierId && billData?.serviceId
                  ? `${typeof billData.carrierId === "object" ? billData.carrierId._id : billData.carrierId}_${typeof billData.serviceId === "object" ? billData.serviceId._id : billData.serviceId}`
                  : carrierService
                  ? `${carrierService.carrierId}_${carrierService.serviceId}`
                  : ""
              }
              onChange={(e) => {
                const [carrierId, serviceId] = e.target.value.split("_");
                setCarrierService({ carrierId, serviceId });
                setErrors((errs) => {
                  const { ...rest } = errs;
                  return rest;
                });
              }}
            >
              {carrierServiceOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
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
        <Typography
          variant="h6"
          sx={{
            background: "#2196f3",
            color: "#fff",
            px: 2,
            py: 1,
            textTransform: "uppercase",
          }}
        >
          SENDER INFORMATION
        </Typography>
        <OrderAddressSection
          label="COMPANY"
          requiredFields={["address1", "address2"]}
          data={billData?.sender || sender}
          setData={(val) => {
            setSender(val);
            setErrors((errs) => {
              const { ...rest } = errs;
              return rest;
            });
          }}
          showCountry={false}
          disabled={!!billData}
          errors={errors}
          fieldPrefix="sender"
        />
      </Paper>
    </Box>
  );

  const RecipientSection = () => (
    <Box className="mb-2 ">
      <Paper>
        <Typography
          variant="h6"
          sx={{
            background: "#2196f3",
            color: "#fff",
            px: 2,
            py: 1,
            textTransform: "uppercase",
          }}
        >
          RECIPIENT INFORMATION
        </Typography>
        <OrderAddressSection
          label="COMPANY"
          data={billData?.recipient || recipient}
          setData={(val) => {
            setRecipient(val);
            setErrors((errs) => {
              const { ...rest } = errs;
              return rest;
            });
          }}
          showCountry={true}
          disabled={!!billData}
          requiredFields={["fullname", "attention", "address1", "address2", "phone", "country"]}
          errors={errors}
          fieldPrefix="recipient"
        />
      </Paper>
    </Box>
  );

  const ProductSection = () => (
    <Box className="mb-2">
      <Paper>
        <Typography
          variant="h6"
          sx={{
            background: "#2196f3",
            color: "#fff",
            px: 2,
            py: 1,
            textTransform: "uppercase",
          }}
        >
          PRODUCT INFORMATION
        </Typography>
        <OrderProductSection
          content={billData?.packageDetail?.content ?? content}
          setContent={(val: string) => {
            setContent(val);
            setErrors((errs) => {
              const { ...rest } = errs;
              return rest;
            });
          }}
          productType={billData?.productType ?? productType}
          setProductType={setProductType}
          declaredWeight={billData?.packageDetail?.declaredWeight?.toString() ?? declaredWeight}
          quantity={billData?.packageDetail?.quantity?.toString() ?? quantity}
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
        <Typography
          variant="h6"
          sx={{
            background: "#2196f3",
            color: "#fff",
            px: 2,
            py: 1,
            textTransform: "uppercase",
          }}
        >
          NOTE
        </Typography>
        <Box sx={{ p: 2 }}>
          <TextField label="NOTE" value={billData?.note ?? note} onChange={(e) => setNote(e.target.value)} fullWidth multiline minRows={3} disabled={!!billData} />
        </Box>
      </Paper>
    </Box>
  );

  // --- Validate & Submit ---
  const handleSubmit = async () => {
    const validationErrors = validateFields();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      showNotification("Please fill all required fields!", "warning");
      return;
    }

    try {
      setLoading(true);
      const payload: ICreateOrderRequest = {
        carrierId: carrierService!.carrierId,
        serviceId: carrierService!.serviceId,
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
      showNotification("Order created successfully!", "success");
    } catch (err: any) {
      showNotification(err.message || "Order creation failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setPartner({ partnerId: "", partnerName: "" });
    setCarrierService(null);
    setNote("");
    setSender({
      fullname: "",
      address1: "",
      address2: "",
      address3: "",
      phone: "",
    });
    setRecipient({
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
    setContent("");
    setProductType(EPRODUCT_TYPE.DOCUMENT);
    setDeclaredWeight("");
    setQuantity("1");
    setDeclaredValue("");
    setCurrency(ECURRENCY.USD);
    setDimensions([]);
    setBillData(null);
    setErrors({});
    billPopupRef.current?.close();
    billShippingMarkPopupRef.current?.close();
    showNotification("Order information cleared!", "info");
  };

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" fontWeight={700} color="#1565c0" sx={{ textTransform: "uppercase" }}>
        WAYBILL
      </Typography>
      <Box mb={1} className={`py-4 bg-white transition-all sticky top-[56px] md:top-[64px] z-50`}>
        <Stack direction="row" spacing={2} justifyContent={"end"}>
          <Button variant="contained" color="primary" onClick={handleSubmit} disabled={!!billData?._id} loading={loading}>
            CREATE BILL
          </Button>
          <Button variant="outlined" sx={{ color: red[500], borderColor: red[500] }} onClick={handleClear}>
            CLEAR
          </Button>
          <Button variant="outlined" color="info" disabled={!billData?._id} onClick={() => billPopupRef.current?.open()}>
            PRINT BILL
          </Button>
          <Button variant="outlined" color="info" disabled={!billData?._id} onClick={() => billShippingMarkPopupRef.current?.open()}>
            PRINT SHIPPING MARK
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
