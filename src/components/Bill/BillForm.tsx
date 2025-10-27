"use client";

import { useState, useRef, useEffect } from "react";
import { Box, Button, Container, Typography, Stack, MenuItem, TextField, Paper } from "@mui/material";
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

/* ========= Helpers ========= */
type IdLike = string | { _id?: string; id?: string } | null | undefined;
const toIdString = (v: IdLike): string | null => (typeof v === "string" ? v : v && typeof v === "object" ? v._id ?? v.id ?? null : null);

// Xóa nhiều key lỗi trong errors mà không tạo biến "unused"
const useClearErrors = (setErrorsFn: React.Dispatch<React.SetStateAction<Record<string, string>>>) => {
  return (...keys: string[]) =>
    setErrorsFn((prev) => {
      const next = { ...prev };
      for (const k of keys) delete next[k];
      return next;
    });
};

export default function BillForm() {
  const { profile } = useSelector((state: AppState) => state.auth);
  const { showNotification } = useNotification();

  // Dropdown Data
  const [billData, setBillData] = useState<IOrder | null>(null);
  const [carriers, setCarriers] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [carrierServiceOptions, setCarrierServiceOptions] = useState<{ label: string; value: string; carrier: any; service: any }[]>([]);

  // Form State
  const [partner, setPartner] = useState<{ partnerId: string; partnerName: string }>({ partnerId: "", partnerName: "" });
  const [carrierService, setCarrierService] = useState<{ carrierId: string; serviceId: string } | null>(null);

  // Billing Info
  const [note, setNote] = useState<string>("");
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

  // Dimensions: luôn là mảng rỗng mặc định
  const [dimensions, setDimensions] = useState<IDimension[]>([]);

  const [loading, setLoading] = useState(false);

  const billPopupRef = useRef<any>(null);
  const billShippingMarkPopupRef = useRef<any>(null);

  // Error State
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const clearErrors = useClearErrors(setErrors);

  // --- Validate Function ---
  function validateFields() {
    const newErrors: { [key: string]: string } = {};

    // Carrier/Service
    if (!carrierService?.carrierId || !carrierService?.serviceId) newErrors.carrierService = "Service is required";

    // Sender
    if (!sender.address1) newErrors.sender_address1 = "Sender address 1 is required";
    if (!sender.address2) newErrors.sender_address2 = "Sender address 2 is required";

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

  /* ===== Load Carrier/Service and map ===== */
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
          const sameCompany =
            (typeof cId === "object" && typeof sId === "object" && cId?._id && sId?._id && cId._id === sId._id) || (typeof cId === "string" && typeof sId === "string" && cId === sId);
          if (sameCompany) {
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

  // Prefill partner from profile
  useEffect(() => {
    if (profile?.companyId) {
      setPartner({
        partnerId: toIdString(profile.companyId) || "",
        partnerName: typeof profile.companyId === "object" ? profile.companyId?.name || "" : String(profile.companyId) || "",
      });
    }
  }, [profile]);

  // Default sender name from partner name
  useEffect(() => {
    if (partner?.partnerName && !sender.fullname) {
      setSender((prev) => ({ ...prev, fullname: partner.partnerName }));
    }
    // eslint-disable-next-line
  }, [partner.partnerName]);

  // Vol weight rate when carrier changes
  useEffect(() => {
    if (carrierService?.carrierId) {
      const carrier = carriers.find((c) => c._id === carrierService.carrierId);
      setVolWeightRate(carrier?.volWeightRate || null);
    } else {
      setVolWeightRate(null);
    }
  }, [carrierService, carriers]);

  // Auto quantity & declaredWeight from dimensions
  useEffect(() => {
    const qty = Array.isArray(dimensions) ? dimensions.length : 0;
    const dw = Array.isArray(dimensions) ? dimensions.reduce((sum, d) => sum + Number(d.grossWeight || 0), 0) : 0;
    setQuantity(qty.toString());
    setDeclaredWeight(dw > 0 ? dw.toString() : "");
  }, [dimensions]);

  /* ===== Sections ===== */
  const BillingSection = () => {
    // Value cho Select SERVICE (ưu tiên billData, fallback form state)
    const selectValue = (() => {
      const c = billData?.carrierId ?? carrierService?.carrierId ?? "";
      const s = billData?.serviceId ?? carrierService?.serviceId ?? "";
      return c && s ? `${c}_${s}` : "";
    })();

    return (
      <Box mb={2}>
        <Paper>
          <Typography variant="h6" sx={{ bgcolor: "#2196f3", color: "#fff", px: 2, py: 1, mb: 2, textTransform: "uppercase" }}>
            BILLING INFORMATION
          </Typography>

          <Stack spacing={2} sx={{ px: 2, pb: 2 }}>
            <TextField disabled value={billData?.trackingCode || ""} size="small" fullWidth label="HAWB CODE" placeholder="Auto generate..." />
            <TextField
              disabled={!!billData}
              select
              size="small"
              fullWidth
              error={!!errors.carrierService}
              helperText={errors.carrierService}
              label="SERVICE"
              value={selectValue}
              onChange={(e) => {
                const [carrierId, serviceId] = e.target.value.split("_");
                setCarrierService({ carrierId, serviceId });
                clearErrors("carrierService");
              }}
            >
              {carrierServiceOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </Paper>
      </Box>
    );
  };

  const SenderSection = () => (
    <Box className="mb-2 ">
      <Paper>
        <Typography variant="h6" sx={{ background: "#2196f3", color: "#fff", px: 2, py: 1, textTransform: "uppercase" }}>
          SENDER INFORMATION
        </Typography>
        <OrderAddressSection
          label="COMPANY"
          requiredFields={["address1", "address2"]}
          data={billData?.sender || sender}
          setData={(val) => {
            setSender(val);
            clearErrors("sender_address1", "sender_address2");
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
        <Typography variant="h6" sx={{ background: "#2196f3", color: "#fff", px: 2, py: 1, textTransform: "uppercase" }}>
          RECIPIENT INFORMATION
        </Typography>
        <OrderAddressSection
          label="COMPANY"
          data={billData?.recipient || recipient}
          setData={(val) => {
            setRecipient(val);
            clearErrors("recipient_fullname", "recipient_attention", "recipient_address1", "recipient_address2", "recipient_phone", "recipient_country");
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
        <Typography variant="h6" sx={{ background: "#2196f3", color: "#fff", px: 2, py: 1, textTransform: "uppercase" }}>
          PRODUCT INFORMATION
        </Typography>
        <OrderProductSection
          content={billData?.packageDetail?.content ?? content}
          setContent={(val: string) => {
            setContent(val);
            clearErrors("content");
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
    <OrderDimensionSection volWeightRate={volWeightRate} dimensions={billData?.packageDetail?.dimensions ?? dimensions} setDimensions={setDimensions} disabled={!!billData} />
  );

  const NoteSection = () => (
    <Box className="mb-2 ">
      <Paper>
        <Typography variant="h6" sx={{ background: "#2196f3", color: "#fff", px: 2, py: 1, textTransform: "uppercase" }}>
          NOTE
        </Typography>
        <Box sx={{ p: 2 }}>
          <TextField label="NOTE" value={billData?.note ?? note} onChange={(e) => setNote(e.target.value)} fullWidth multiline minRows={3} disabled={!!billData} />
        </Box>
      </Paper>
    </Box>
  );

  /* ===== Validate & Submit ===== */
  const handleSubmit = async () => {
    const validationErrors = validateFields();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      showNotification("Please fill all required fields!", "warning");
      return;
    }

    try {
      setLoading(true);

      // BẮT BUỘC theo ICreateOrderRequest (đủ field)
      const payload: ICreateOrderRequest = {
        carrierAirWaybillCode: null,
        carrierId: carrierService!.carrierId, // string id
        serviceId: carrierService!.serviceId, // string id
        supplierId: null, // chưa chọn supplier -> null

        partner: {
          partnerId: partner.partnerId || null, // id-thuần (string) hoặc null
          partnerName: partner.partnerName || "",
        },

        sender: {
          fullname: sender.fullname,
          phone: sender.phone,
          address1: sender.address1 || "",
          address2: sender.address2 || "",
          address3: sender.address3 || "",
        } as IBasicContactInfor,

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
          declaredValue: Number(declaredValue || 0),
          currency,
          dimensions: dimensions || [],
        },

        note: note || null,
        productType,

        // BẮT BUỘC: mảng phụ thu
        surcharges: [],

        // BẮT BUỘC: extra fee input
        extraFees: { extraFeeIds: [], fscFeePercentage: null },

        // BẮT BUỘC: VAT custom, -1 để BE tự áp hệ thống
        vat: { customVATPercentage: -1 },
      };

      const res = await createOrderApi(payload);
      setBillData(res?.data?.data || null);
      showNotification("Order created successfully!", "success");
    } catch (err: any) {
      showNotification(err?.message || "Order creation failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setPartner({ partnerId: "", partnerName: "" });
    setCarrierService(null);
    setNote("");
    setSender({ fullname: "", address1: "", address2: "", address3: "", phone: "" });
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
    billPopupRef.current?.close?.();
    billShippingMarkPopupRef.current?.close?.();
    showNotification("Order information cleared!", "info");
  };

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" fontWeight={700} color="#1565c0" sx={{ textTransform: "uppercase" }}>
        WAYBILL
      </Typography>

      <Box mb={1} className={`py-4 bg-white sticky top-[56px] md:top-[64px] z-50`}>
        <Stack direction="row" spacing={2} justifyContent="end">
          <Button variant="contained" color="primary" onClick={handleSubmit} disabled={!!billData?._id || loading}>
            CREATE BILL
          </Button>
          <Button variant="outlined" sx={{ color: red[500], borderColor: red[500] }} onClick={handleClear}>
            CLEAR
          </Button>
          <Button variant="outlined" color="info" disabled={!billData?._id} onClick={() => billPopupRef.current?.open?.()}>
            PRINT BILL
          </Button>
          <Button variant="outlined" color="info" disabled={!billData?._id} onClick={() => billShippingMarkPopupRef.current?.open?.()}>
            PRINT SHIPPING MARK
          </Button>
        </Stack>
      </Box>

      <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
        <Stack flex={1} spacing={2}>
          {BillingSection()}
          {SenderSection()}
          {RecipientSection()}
        </Stack>
        <Stack flex={1} spacing={2}>
          {ProductSection()}
          {DimensionSection()}
          {NoteSection()}
        </Stack>
      </Stack>

      {/* POPUP */}
      <BillPrintDialog ref={billPopupRef} data={billData} />
      <BillShippingMarkDialog ref={billShippingMarkPopupRef} data={billData} />
    </Container>
  );
}
