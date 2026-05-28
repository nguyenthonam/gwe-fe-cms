"use client";

import { useEffect, useRef, useState } from "react";
import { Box, Button, Container, MenuItem, Paper, Stack, TextField, Typography, Alert } from "@mui/material";
import { red } from "@mui/material/colors";
import { useSelector } from "react-redux";

import BillPrintDialog from "./BillPrintDialog";
import BillShippingMarkDialog from "./BillShippingMarkDialog";
import { useNotification } from "@/contexts/NotificationProvider";
import { EPRODUCT_TYPE, ECURRENCY, IDimension, ECountryCode, IBasicContactInfor } from "@/types/typeGlobals";
import { getCarriersApi } from "@/utils/apis/apiCarrier";
import { getServicesApi } from "@/utils/apis/apiService";
import { ICreateOrderRequest, IOrder } from "@/types/typeOrder";
import { createOrderApi } from "@/utils/apis/apiOrder";
import { AppState } from "@/store";
import OrderProductSection from "../Orders/Partials/OrderProductSection";
import OrderAddressSection from "../Orders/Partials/OrderAddressSection";
import OrderDimensionSection from "../Orders/Partials/OrderDimensionSection";

type IdLike = string | { _id?: string; id?: string; name?: string } | null | undefined;
type NumericLike = string | number | null | undefined;

type FormErrors = Record<string, string>;

const toIdString = (value: IdLike): string | null => {
  if (!value) return null;
  if (typeof value === "string") return value;
  return value._id ?? value.id ?? null;
};

const trimText = (value: unknown): string => String(value ?? "").trim();

const toNumberSafe = (value: NumericLike, fallback = 0): number => {
  if (value === null || value === undefined || value === "") return fallback;
  const normalized = String(value).trim().replace(/\s/g, "").replace(/,/g, ".");
  const numberValue = Number(normalized);
  return Number.isFinite(numberValue) ? numberValue : fallback;
};

const getApiErrorMessage = (error: any, fallback = "Order creation failed") => {
  return error?.response?.data?.message || error?.response?.data?.error || error?.message || fallback;
};

const dimensionErrorKey = (index: number, field: keyof IDimension) => `dimensions_${index}_${String(field)}`;

const normalizeDimension = (dimension: IDimension, index: number): IDimension => ({
  no: index + 1,
  length: toNumberSafe(dimension.length),
  width: toNumberSafe(dimension.width),
  height: toNumberSafe(dimension.height),
  grossWeight: toNumberSafe(dimension.grossWeight),
  volumeWeight: toNumberSafe(dimension.volumeWeight),
});

const useClearErrors = (setErrorsFn: React.Dispatch<React.SetStateAction<FormErrors>>) => {
  return (...keys: string[]) =>
    setErrorsFn((prev) => {
      const next = { ...prev };
      for (const key of keys) delete next[key];
      return next;
    });
};

export default function BillForm() {
  const { profile } = useSelector((state: AppState) => state.auth);
  const { showNotification } = useNotification();

  const [billData, setBillData] = useState<IOrder | null>(null);
  const [carriers, setCarriers] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [carrierServiceOptions, setCarrierServiceOptions] = useState<{ label: string; value: string; carrier: any; service: any }[]>([]);

  const [partner, setPartner] = useState<{ partnerId: string; partnerName: string }>({ partnerId: "", partnerName: "" });
  const [carrierService, setCarrierService] = useState<{ carrierId: string; serviceId: string } | null>(null);
  const [note, setNote] = useState<string>("");
  const [volWeightRate, setVolWeightRate] = useState<number | null>(null);

  const [sender, setSender] = useState<IBasicContactInfor>({
    fullname: "",
    address1: "",
    address2: "",
    address3: "",
    phone: "",
  });

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

  const [content, setContent] = useState("");
  const [productType, setProductType] = useState(EPRODUCT_TYPE.DOCUMENT);
  const [declaredWeight, setDeclaredWeight] = useState("");
  const [quantity, setQuantity] = useState("0");
  const [declaredValue, setDeclaredValue] = useState("");
  const [currency, setCurrency] = useState(ECURRENCY.USD);
  const [dimensions, setDimensions] = useState<IDimension[]>([]);

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const clearErrors = useClearErrors(setErrors);

  const billPopupRef = useRef<any>(null);
  const billShippingMarkPopupRef = useRef<any>(null);

  const validateFields = (): FormErrors => {
    const newErrors: FormErrors = {};

    if (!carrierService?.carrierId || !carrierService?.serviceId) {
      newErrors.carrierService = "Service is required";
    }

    if (!trimText(sender.fullname)) newErrors.sender_fullname = "Sender name is required";
    if (!trimText(sender.phone)) newErrors.sender_phone = "Sender phone is required";
    if (!trimText(sender.address1)) newErrors.sender_address1 = "Sender address line 1 is required";

    if (!trimText(recipient.fullname)) newErrors.recipient_fullname = "Recipient company/name is required";
    if (!trimText(recipient.attention)) newErrors.recipient_attention = "Attention is required";
    if (!trimText(recipient.phone)) newErrors.recipient_phone = "Recipient phone is required";
    if (!trimText(recipient.address1)) newErrors.recipient_address1 = "Recipient address line 1 is required";
    if (!recipient.country?.code) newErrors.recipient_country = "Recipient country is required";

    if (!trimText(content)) newErrors.content = "Shipment content is required";
    if (!productType) newErrors.productType = "Product type is required";

    const normalizedDimensions = Array.isArray(dimensions) ? dimensions.map(normalizeDimension) : [];
    if (normalizedDimensions.length === 0) {
      newErrors.dimensions = "Please add at least one package";
      newErrors.quantity = "PCEs must be greater than 0";
      newErrors.declaredWeight = "Declared weight must be greater than 0";
    }

    normalizedDimensions.forEach((dimension, index) => {
      if (dimension.length <= 0) newErrors[dimensionErrorKey(index, "length")] = "Required";
      if (dimension.width <= 0) newErrors[dimensionErrorKey(index, "width")] = "Required";
      if (dimension.height <= 0) newErrors[dimensionErrorKey(index, "height")] = "Required";
      if (dimension.grossWeight <= 0) newErrors[dimensionErrorKey(index, "grossWeight")] = "Required";
    });

    const qty = normalizedDimensions.length;
    const totalGrossWeight = normalizedDimensions.reduce((sum, dimension) => sum + dimension.grossWeight, 0);

    if (qty <= 0) newErrors.quantity = "PCEs must be greater than 0";
    if (totalGrossWeight <= 0) newErrors.declaredWeight = "Declared weight must be greater than 0";

    const declaredValueNumber = toNumberSafe(declaredValue, 0);
    if (declaredValue && declaredValueNumber < 0) newErrors.declaredValue = "Declared value cannot be negative";

    return newErrors;
  };

  useEffect(() => {
    const loadMasterData = async () => {
      try {
        const [carrierRes, serviceRes] = await Promise.all([getCarriersApi(), getServicesApi()]);
        setCarriers(carrierRes?.data?.data?.data || []);
        setServices(serviceRes?.data?.data?.data || []);
      } catch (error: any) {
        showNotification(getApiErrorMessage(error, "Failed to load carrier/service data"), "error");
      }
    };

    loadMasterData();
  }, [showNotification]);

  useEffect(() => {
    if (!Array.isArray(carriers) || !Array.isArray(services)) return;

    const options: { label: string; value: string; carrier: any; service: any }[] = [];

    carriers.forEach((carrier) => {
      if (!carrier?._id || !carrier?.companyId) return;

      services.forEach((service) => {
        if (!service?._id || !service?.companyId) return;

        const carrierCompanyId = typeof carrier.companyId === "object" ? carrier.companyId?._id : carrier.companyId;
        const serviceCompanyId = typeof service.companyId === "object" ? service.companyId?._id : service.companyId;

        if (carrierCompanyId && serviceCompanyId && carrierCompanyId === serviceCompanyId) {
          options.push({
            label: `${carrier.code || carrier.name || "Carrier"}-${service.code || service.name || "Service"}`,
            value: `${carrier._id}_${service._id}`,
            carrier,
            service,
          });
        }
      });
    });

    setCarrierServiceOptions(options);
  }, [carriers, services]);

  useEffect(() => {
    if (profile?.companyId) {
      const partnerId = toIdString(profile.companyId) || "";
      const partnerName = typeof profile.companyId === "object" ? profile.companyId?.name || "" : "";
      setPartner({ partnerId, partnerName });
    }
  }, [profile]);

  useEffect(() => {
    if (partner?.partnerName && !sender.fullname) {
      setSender((prev) => ({ ...prev, fullname: partner.partnerName }));
    }
  }, [partner.partnerName, sender.fullname]);

  useEffect(() => {
    if (!carrierService?.carrierId) {
      setVolWeightRate(null);
      return;
    }

    const carrier = carriers.find((item) => item._id === carrierService.carrierId);
    setVolWeightRate(carrier?.volWeightRate || null);
  }, [carrierService, carriers]);

  useEffect(() => {
    const normalizedDimensions = Array.isArray(dimensions) ? dimensions.map(normalizeDimension) : [];
    const qty = normalizedDimensions.length;
    const totalGrossWeight = normalizedDimensions.reduce((sum, dimension) => sum + dimension.grossWeight, 0);

    setQuantity(String(qty));
    setDeclaredWeight(totalGrossWeight > 0 ? String(totalGrossWeight) : "");
  }, [dimensions]);

  const BillingSection = () => {
    const selectValue = (() => {
      const c = toIdString(billData?.carrierId as IdLike) ?? carrierService?.carrierId ?? "";
      const s = toIdString(billData?.serviceId as IdLike) ?? carrierService?.serviceId ?? "";
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
              required
              error={!!errors.carrierService}
              helperText={errors.carrierService || "Select carrier-service pair"}
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
    <Box className="mb-2">
      <Paper>
        <Typography variant="h6" sx={{ background: "#2196f3", color: "#fff", px: 2, py: 1, textTransform: "uppercase" }}>
          SENDER INFORMATION
        </Typography>
        <OrderAddressSection
          label="COMPANY"
          requiredFields={["fullname", "phone", "address1"]}
          data={billData?.sender || sender}
          setData={(updater: any) => {
            setSender(updater);
            clearErrors("sender_fullname", "sender_phone", "sender_address1");
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
    <Box className="mb-2">
      <Paper>
        <Typography variant="h6" sx={{ background: "#2196f3", color: "#fff", px: 2, py: 1, textTransform: "uppercase" }}>
          RECIPIENT INFORMATION
        </Typography>
        <OrderAddressSection
          label="COMPANY"
          data={billData?.recipient || recipient}
          setData={(updater: any) => {
            setRecipient(updater);
            clearErrors("recipient_fullname", "recipient_attention", "recipient_phone", "recipient_address1", "recipient_country");
          }}
          showCountry
          disabled={!!billData}
          requiredFields={["fullname", "attention", "phone", "address1", "country"]}
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
          setProductType={(value) => {
            setProductType(value);
            clearErrors("productType");
          }}
          declaredWeight={billData?.packageDetail?.declaredWeight?.toString() ?? declaredWeight}
          quantity={billData?.packageDetail?.quantity?.toString() ?? quantity}
          declaredValue={billData?.packageDetail?.declaredValue?.toString() ?? declaredValue}
          setDeclaredValue={(value) => {
            setDeclaredValue(value);
            clearErrors("declaredValue");
          }}
          currency={billData?.packageDetail?.currency ?? currency}
          setCurrency={setCurrency}
          disabled={!!billData}
          errors={errors}
          requiredFields={["content", "productType", "quantity", "declaredWeight", "currency"]}
        />
      </Paper>
    </Box>
  );

  const DimensionSection = () => (
    <OrderDimensionSection
      volWeightRate={volWeightRate}
      dimensions={billData?.packageDetail?.dimensions ?? dimensions}
      setDimensions={setDimensions}
      disabled={!!billData}
      errors={errors}
      onClearErrors={clearErrors}
    />
  );

  const NoteSection = () => (
    <Box className="mb-2">
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

  const handleSubmit = async () => {
    const validationErrors = validateFields();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      const firstError = Object.values(validationErrors)[0];
      showNotification(firstError || "Please fill all required fields!", "warning");
      return;
    }

    try {
      setLoading(true);

      const normalizedDimensions = dimensions.map(normalizeDimension);
      const normalizedDeclaredWeight = normalizedDimensions.reduce((sum, dimension) => sum + dimension.grossWeight, 0);

      const payload: ICreateOrderRequest = {
        carrierAirWaybillCode: null,
        carrierId: carrierService!.carrierId,
        serviceId: carrierService!.serviceId,
        supplierId: null,

        partner: partner.partnerId
          ? {
              partnerId: partner.partnerId,
              partnerName: partner.partnerName || "",
            }
          : null,

        sender: {
          fullname: trimText(sender.fullname),
          phone: trimText(sender.phone),
          address1: trimText(sender.address1),
          address2: trimText(sender.address2),
          address3: trimText(sender.address3),
        } as IBasicContactInfor,

        recipient: {
          fullname: trimText(recipient.fullname),
          phone: trimText(recipient.phone),
          address1: trimText(recipient.address1),
          address2: trimText(recipient.address2),
          address3: trimText(recipient.address3),
          country: recipient.country,
          attention: trimText(recipient.attention),
          city: trimText(recipient.city),
          state: trimText(recipient.state),
          postCode: trimText(recipient.postCode),
        },

        packageDetail: {
          content: trimText(content),
          declaredWeight: normalizedDeclaredWeight,
          quantity: normalizedDimensions.length,
          declaredValue: toNumberSafe(declaredValue, 0),
          currency,
          dimensions: normalizedDimensions,
        },

        note: trimText(note) || null,
        productType,
        surcharges: [],
        extraFees: { extraFeeIds: [], fscFeePercentage: null },
        vat: { customVATPercentage: -1 },
      };

      const createdOrder = await createOrderApi(payload);
      setBillData(createdOrder || null);
      showNotification("Order created successfully!", "success");
    } catch (err: any) {
      showNotification(getApiErrorMessage(err, "Order creation failed"), "error");
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
    setQuantity("0");
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

      {Object.keys(errors).length > 0 && !billData && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          Please complete required fields marked with * before creating the bill.
        </Alert>
      )}

      <Box mb={1} className="py-4 bg-white sticky top-[56px] md:top-[64px] z-50">
        <Stack direction="row" spacing={2} justifyContent="end">
          <Button variant="contained" color="primary" onClick={handleSubmit} disabled={!!billData?._id || loading}>
            {loading ? "CREATING..." : "CREATE BILL"}
          </Button>
          <Button variant="outlined" sx={{ color: red[500], borderColor: red[500] }} onClick={handleClear} disabled={loading}>
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

      <BillPrintDialog ref={billPopupRef} data={billData} />
      <BillShippingMarkDialog ref={billShippingMarkPopupRef} data={billData} />
    </Container>
  );
}
