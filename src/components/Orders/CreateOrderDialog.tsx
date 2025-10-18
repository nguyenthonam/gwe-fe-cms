"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, TextField, Typography, Box, Paper } from "@mui/material";
import { useNotification } from "@/contexts/NotificationProvider";
import { createOrderApi } from "@/utils/apis/apiOrder";
import { getCarriersApi } from "@/utils/apis/apiCarrier";
import { getPartnersApi } from "@/utils/apis/apiPartner";
import { getSuppliersApi } from "@/utils/apis/apiSupplier";
import { getServicesByCarrierApi } from "@/utils/apis/apiService";
import { ECountryCode, ECURRENCY, EPRODUCT_TYPE, IBasicContactInfor, IDimension } from "@/types/typeGlobals";
import { ISurchargeDetail } from "@/types/typeOrder";
import { getExtraFeesByCarrierServiceApi } from "@/utils/apis/apiExtraFee";
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
  // Dropdown Data
  const [partners, setPartners] = useState<any[]>([]);
  const [carriers, setCarriers] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [extraFeeList, setExtraFeeList] = useState<any[]>([]);

  // Form State
  const [partnerId, setPartnerId] = useState("");
  const [carrierId, setCarrierId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [surcharges, setSurcharges] = useState<ISurchargeDetail[]>([]);
  const [extraFeeIds, setExtraFeeIds] = useState<string[]>([]);
  const [customVATPercentage, setCustomVATPercentage] = useState<string>("8");
  const [fscFeePercentage, setFSCFeePercentage] = useState<string>("35");

  // Billing Info
  const [note, setNote] = useState("");
  const [carrierAirWaybillCode, setCarrierAirWaybillCode] = useState<string>("");

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

  // Dimension (array for multiple packages)
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
      console.log(err.message);
      showNotification("Failed to load services!", "error");
    }
  };
  useEffect(() => {
    // Recalculate quantity (number of dimensions) and total grossWeight
    const qty = dimensions && Array.isArray(dimensions) ? dimensions.length : 0;
    const dw = dimensions && Array.isArray(dimensions) ? dimensions.reduce((sum, d) => sum + Number(d.grossWeight || 0), 0) : 0;
    setQuantity(qty.toString());
    setDeclaredWeight(dw > 0 ? dw.toString() : "");
  }, [dimensions]);

  // Preload Dropdown
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

  useEffect(() => {
    if (carrierId) {
      fetchServices(carrierId);
      setVolWeightRate(carriers.find((c) => c._id === carrierId)?.volWeightRate || null);
    } else {
      setServices([]);
      setVolWeightRate(null);
    }
    setServiceId("");
  }, [carrierId, carriers]);

  useEffect(() => {
    if (carrierId && serviceId) {
      // Load extra fee list by carrier and service
      getExtraFeesByCarrierServiceApi(carrierId, serviceId)
        .then((res) => {
          setExtraFeeList(res?.data?.data?.data || []);
        })
        .catch((err) => {
          console.error("Error fetching extra fees:", err);
          showNotification("Failed to load extra fees!", "error");
        });
    } else {
      setExtraFeeList([]);
    }
  }, [carrierId, serviceId]);

  const resetForm = () => {
    setCarrierAirWaybillCode("");
    setPartnerId("");
    setCarrierId("");
    setServiceId("");
    setSupplierId("");
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
    setExtraFeeIds([]);
    setCustomVATPercentage("8");
    setFSCFeePercentage("35");
    setSurcharges([]);
  };

  // Validate & Submit
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
        serviceId,
        supplierId,
        partner: { partnerId, partnerName: partners.find((p) => p._id === partnerId)?.name || "" },
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
        surcharges,
        extraFees: { extraFeeIds: extraFeeIds, fscFeePercentage: Number(fscFeePercentage) },
        vat: { customVATPercentage: Number(customVATPercentage) },
      });
      showNotification("Order created successfully", "success");
      onCreated();
    } catch (err: any) {
      showNotification(err.message || "Failed to create order", "error");
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
              />
            </Paper>
          </Box>

          {/* Sender */}
          <Box className="mb-2 ">
            <Paper>
              <Typography variant="h6" sx={{ background: "#2196f3", color: "#fff", px: 2, py: 1, textTransform: "uppercase" }}>
                Sender Information
              </Typography>
              <OrderAddressSection label="Company" data={sender} setData={setSender} showCountry={false} />
            </Paper>
          </Box>

          {/* Recipient */}
          <Box className="mb-2 ">
            <Paper>
              <Typography variant="h6" sx={{ background: "#2196f3", color: "#fff", px: 2, py: 1, textTransform: "uppercase" }}>
                Recipient Information
              </Typography>
              <OrderAddressSection label="Company" data={recipient} setData={setRecipient} showCountry={true} />
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
              />
            </Paper>
          </Box>

          {/* Dimension */}
          <OrderDimensionSection volWeightRate={volWeightRate} dimensions={dimensions || []} setDimensions={setDimensions} />

          {/* Note */}
          <Box className="mb-2 ">
            <Paper>
              <Typography variant="h6" sx={{ background: "#2196f3", color: "#fff", px: 2, py: 1, textTransform: "uppercase" }}>
                Note
              </Typography>
              <Box sx={{ p: 2 }}>
                <TextField label="Note" value={note} onChange={(e) => setNote(e.target.value)} fullWidth multiline minRows={3} />
              </Box>
            </Paper>
          </Box>

          {/* Extra Fee, VAT, Surcharges */}
          <OrderVATSection customVATPercentage={customVATPercentage} setCustomVATPercentage={setCustomVATPercentage} />
          <OrderExtraFeeSection fscFeePercentage={fscFeePercentage} setFSCFeePercentage={setFSCFeePercentage} extraFeeList={extraFeeList} extraFeeIds={extraFeeIds} setExtraFeeIds={setExtraFeeIds} />
          <OrderSurchargeSection surcharges={surcharges} setSurcharges={setSurcharges} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          Create
        </Button>
      </DialogActions>
    </Dialog>
  );
}
