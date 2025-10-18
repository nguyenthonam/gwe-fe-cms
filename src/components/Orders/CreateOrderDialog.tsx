"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, TextField, Typography, Box, Paper } from "@mui/material";
import { useNotification } from "@/contexts/NotificationProvider";
import { createOrderApi } from "@/utils/apis/apiOrder";
import { getCarriersApi } from "@/utils/apis/apiCarrier";
import { getPartnersApi } from "@/utils/apis/apiPartner";
import { getSuppliersApi } from "@/utils/apis/apiSupplier";
import { getServicesByCarrierApi } from "@/utils/apis/apiService";
import { getExtraFeesByCarrierServiceApi } from "@/utils/apis/apiExtraFee";

import { ECountryCode, ECURRENCY, EPRODUCT_TYPE, IBasicContactInfor, IDimension } from "@/types/typeGlobals";
import { ISurchargeDetail } from "@/types/typeOrder";

import OrderBillingInfoSection from "./Partials/OrderBillingInfoSection";
import OrderAddressSection from "./Partials/OrderAddressSection";
import OrderProductSection from "./Partials/OrderProductSection";
import OrderDimensionSection from "./Partials/OrderDimensionSection";
import OrderExtraFeeSection from "./Partials/OrderExtraFeeSection";
import OrderVATSection from "./Partials/OrderVATSection";
import OrderSurchargeSection from "./Partials/OrderSurchargeSection";

interface Props {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export default function CreateOrderDialog({ open, onClose, onCreated }: Props) {
  // Dropdown data
  const [partners, setPartners] = useState<{ _id: string; name: string }[]>([]);
  const [carriers, setCarriers] = useState<{ _id: string; name: string; companyId?: any; volWeightRate?: number }[]>([]);
  const [services, setServices] = useState<{ _id: string; code: string; name: string }[]>([]);
  const [suppliers, setSuppliers] = useState<{ _id: string; name: string }[]>([]);
  const [extraFeeList, setExtraFeeList] = useState<any[]>([]);

  // Form state
  const [partnerId, setPartnerId] = useState<string>("");
  const [carrierId, setCarrierId] = useState<string>("");
  const [serviceId, setServiceId] = useState<string>("");
  const [supplierId, setSupplierId] = useState<string>("");
  const [surcharges, setSurcharges] = useState<ISurchargeDetail[]>([]);
  const [extraFeeIds, setExtraFeeIds] = useState<string[]>([]);
  const [customVATPercentage, setCustomVATPercentage] = useState<string>("8");
  const [fscFeePercentage, setFSCFeePercentage] = useState<string>("35");

  // Misc
  const [note, setNote] = useState<string>("");
  const [carrierAirWaybillCode, setCarrierAirWaybillCode] = useState<string>("");

  // Vol weight rate
  const [volWeightRate, setVolWeightRate] = useState<number | null>(null);

  // Sender / Recipient
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

  // Product info
  const [content, setContent] = useState<string>("");
  const [productType, setProductType] = useState<EPRODUCT_TYPE>(EPRODUCT_TYPE.DOCUMENT);
  const [declaredWeight, setDeclaredWeight] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("1");
  const [declaredValue, setDeclaredValue] = useState<string>("");
  const [currency, setCurrency] = useState<ECURRENCY>(ECURRENCY.USD);

  // Dimensions
  const [dimensions, setDimensions] = useState<IDimension[]>([]);

  const [loading, setLoading] = useState<boolean>(false);
  const { showNotification } = useNotification();

  // Helpers
  const fetchServices = async (selectedCarrierId: string) => {
    const selected = carriers.find((c) => c._id === selectedCarrierId);
    const companyId = selected && typeof selected.companyId === "object" ? selected.companyId?._id : (selected as any)?.companyId;

    if (!companyId) return;

    try {
      const res = await getServicesByCarrierApi(companyId);
      setServices(res?.data?.data?.data || []);
    } catch (err: any) {
      showNotification("Failed to load services!", "error");
    }
  };

  // Auto-calc quantity & declaredWeight from dimensions
  useEffect(() => {
    const qty = Array.isArray(dimensions) ? dimensions.length : 0;
    const dw = Array.isArray(dimensions) ? dimensions.reduce((sum, d) => sum + Number(d.grossWeight || 0), 0) : 0;

    setQuantity(String(qty));
    setDeclaredWeight(dw > 0 ? String(dw) : "");
  }, [dimensions]);

  // Preload dropdowns
  useEffect(() => {
    if (open) {
      getPartnersApi().then((res) => setPartners(res?.data?.data?.data || []));
      getCarriersApi().then((res) => setCarriers(res?.data?.data?.data || []));
      getSuppliersApi().then((res) => setSuppliers(res?.data?.data?.data || []));
    }
    if (!open) {
      // resetForm();
    }
  }, [open]);

  // Carrier change -> services & volWeightRate
  useEffect(() => {
    if (carrierId) {
      fetchServices(carrierId);
      const vwr = carriers.find((c) => c._id === carrierId)?.volWeightRate ?? null;
      setVolWeightRate(typeof vwr === "number" ? vwr : null);
    } else {
      setServices([]);
      setVolWeightRate(null);
    }
    setServiceId("");
  }, [carrierId, carriers]);

  // Load extra fee list by carrier & service
  useEffect(() => {
    if (carrierId && serviceId) {
      getExtraFeesByCarrierServiceApi(carrierId, serviceId)
        .then((res) => setExtraFeeList(res?.data?.data?.data || []))
        .catch(() => showNotification("Failed to load extra fees!", "error"));
    } else {
      setExtraFeeList([]);
    }
  }, [carrierId, serviceId]);

  // const resetForm = () => {
  //   setCarrierAirWaybillCode("");
  //   setPartnerId("");
  //   setCarrierId("");
  //   setServiceId("");
  //   setSupplierId("");
  //   setNote("");
  //   setSender({ fullname: "", address1: "", address2: "", address3: "", phone: "" });
  //   setRecipient({
  //     fullname: "",
  //     attention: "",
  //     address1: "",
  //     address2: "",
  //     address3: "",
  //     phone: "",
  //     country: { code: ECountryCode.VN, name: "Vietnam" },
  //     city: "",
  //     state: "",
  //     postCode: "",
  //   });
  //   setContent("");
  //   setProductType(EPRODUCT_TYPE.DOCUMENT);
  //   setDeclaredWeight("");
  //   setQuantity("1");
  //   setDeclaredValue("");
  //   setCurrency(ECURRENCY.USD);
  //   setDimensions([]);
  //   setExtraFeeIds([]);
  //   setCustomVATPercentage("8");
  //   setFSCFeePercentage("35");
  //   setSurcharges([]);
  // };

  // Submit
  const handleSubmit = async () => {
    if (!carrierId || !recipient.country) {
      showNotification("Please enter all required information!", "warning");
      return;
    }
    try {
      setLoading(true);

      await createOrderApi({
        carrierAirWaybillCode: carrierAirWaybillCode || "",
        carrierId,
        serviceId: serviceId || null,
        supplierId: supplierId || null,
        partner: partnerId
          ? {
              partnerId,
              partnerName: partners.find((p) => p._id === partnerId)?.name || "",
            }
          : null,
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
          country: recipient.country, // object {code, name}
          attention: recipient.attention,
          city: recipient.city,
          state: recipient.state,
          postCode: recipient.postCode,
        },
        packageDetail: {
          content,
          declaredWeight: Number(declaredWeight || 0),
          quantity: Number(quantity || 0),
          declaredValue: Number(declaredValue || 0),
          currency,
          dimensions: dimensions || [],
        },
        note: note || null,
        productType,
        surcharges,
        extraFees: {
          extraFeeIds,
          fscFeePercentage: Number(fscFeePercentage),
        },
        vat: {
          customVATPercentage: Number(customVATPercentage),
        },
        // currency: optional at create; BE defaults to VND
      });

      showNotification("Order created successfully", "success");
      onCreated();
    } catch (err: any) {
      showNotification(err?.message || "Failed to create order", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Create New Order</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          {/* Billing Info */}
          <Box className="mb-2">
            <Paper>
              <Typography variant="h6" sx={{ background: "#2196f3", color: "#fff", px: 2, py: 1, textTransform: "uppercase" }}>
                Billing Information
              </Typography>
              <OrderBillingInfoSection
                partners={partners}
                carriers={carriers}
                suppliers={suppliers}
                services={services}
                partnerId={partnerId}
                setPartnerId={setPartnerId}
                carrierId={carrierId}
                setCarrierId={setCarrierId}
                supplierId={supplierId}
                setSupplierId={setSupplierId}
                serviceId={serviceId}
                setServiceId={setServiceId}
                carrierAirWaybillCode={carrierAirWaybillCode}
                setCarrierAirWaybillCode={setCarrierAirWaybillCode}
                disabled={loading}
              />
            </Paper>
          </Box>

          {/* Sender */}
          <Box className="mb-2 ">
            <Paper>
              <Typography variant="h6" sx={{ background: "#2196f3", color: "#fff", px: 2, py: 1, textTransform: "uppercase" }}>
                Sender Information
              </Typography>
              <OrderAddressSection label="Company" data={sender} setData={setSender} showCountry={false} disabled={loading} />
            </Paper>
          </Box>

          {/* Recipient */}
          <Box className="mb-2 ">
            <Paper>
              <Typography variant="h6" sx={{ background: "#2196f3", color: "#fff", px: 2, py: 1, textTransform: "uppercase" }}>
                Recipient Information
              </Typography>
              <OrderAddressSection label="Company" data={recipient} setData={setRecipient} showCountry disabled={loading} />
            </Paper>
          </Box>

          {/* Product Info */}
          <Box className="mb-2">
            <Paper>
              <Typography variant="h6" sx={{ background: "#2196f3", color: "#fff", px: 2, py: 1, textTransform: "uppercase" }}>
                Product Information
              </Typography>
              <OrderProductSection
                content={content}
                setContent={setContent}
                productType={productType}
                setProductType={setProductType}
                declaredWeight={declaredWeight}
                quantity={quantity}
                declaredValue={declaredValue}
                setDeclaredValue={setDeclaredValue}
                currency={currency}
                setCurrency={setCurrency}
                disabled={loading}
              />
            </Paper>
          </Box>

          {/* Dimensions */}
          <OrderDimensionSection volWeightRate={volWeightRate} dimensions={dimensions} setDimensions={setDimensions} disabled={loading} />

          {/* Note */}
          <Box className="mb-2 ">
            <Paper>
              <Typography variant="h6" sx={{ background: "#2196f3", color: "#fff", px: 2, py: 1, textTransform: "uppercase" }}>
                Note
              </Typography>
              <Box sx={{ p: 2 }}>
                <TextField label="Note" value={note} onChange={(e) => setNote(e.target.value)} fullWidth multiline minRows={3} disabled={loading} />
              </Box>
            </Paper>
          </Box>

          {/* Extra Fee, VAT, Surcharges */}
          <OrderVATSection customVATPercentage={customVATPercentage} setCustomVATPercentage={setCustomVATPercentage} disabled={loading} />
          <OrderExtraFeeSection
            fscFeePercentage={fscFeePercentage}
            setFSCFeePercentage={setFSCFeePercentage}
            extraFeeList={extraFeeList}
            extraFeeIds={extraFeeIds}
            setExtraFeeIds={setExtraFeeIds}
            disabled={loading}
          />
          <OrderSurchargeSection surcharges={surcharges} setSurcharges={setSurcharges} disabled={loading} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}
