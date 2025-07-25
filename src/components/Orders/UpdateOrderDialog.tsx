"use client";

import { useState, useEffect } from "react";
import deepEqual from "fast-deep-equal";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, TextField, Typography, Box, Paper } from "@mui/material";
import { useNotification } from "@/contexts/NotificationProvider";
import { updateOrderApi } from "@/utils/apis/apiOrder";
import { getCarriersApi } from "@/utils/apis/apiCarrier";
import { getPartnersApi } from "@/utils/apis/apiPartner";
import { getSuppliersApi } from "@/utils/apis/apiSupplier";
import { getServicesByCarrierApi } from "@/utils/apis/apiService";
import { getExtraFeesByCarrierServiceApi } from "@/utils/apis/apiExtraFee";
import OrderBillingInfoSection from "./Partials/OrderBillingInfoSection";
import OrderAddressSection from "./Partials/OrderAddressSection";
import OrderProductSection from "./Partials/OrderProductSection";
import OrderDimensionSection from "./Partials/OrderDimensionSection";
import OrderExtraFeeSection from "./Partials/OrderExtraFeeSection";
import OrderVATSection from "./Partials/OrderVATSection";
import OrderSurchargeSection from "./Partials/OrderSurchargeSection";
import { IOrder } from "@/types/typeOrder";
import { ECountryCode, ECURRENCY, EPRODUCT_TYPE, IBasicContactInfor, IDimension } from "@/types/typeGlobals";
import { ISurchargeDetail } from "@/types/typeOrder";

interface Props {
  open: boolean;
  order: IOrder | null;
  onClose: () => void;
  onUpdated: () => void;
}

export default function UpdateOrderDialog({ open, order, onClose, onUpdated }: Props) {
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
  const [customVATPercentage, setCustomVATPercentage] = useState<number>(8);
  const [fscFeePercentage, setFSCFeePercentage] = useState<number>(35);

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
  const [productType, setProductType] = useState<EPRODUCT_TYPE>(EPRODUCT_TYPE.DOCUMENT);
  const [declaredWeight, setDeclaredWeight] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [declaredValue, setDeclaredValue] = useState("");
  const [currency, setCurrency] = useState<ECURRENCY>(ECURRENCY.VND);

  // Dimension
  const [dimensions, setDimensions] = useState<IDimension[] | []>();

  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();

  useEffect(() => {
    // Calculate quantity and grossWeight
    const qty = dimensions && Array.isArray(dimensions) ? dimensions.length : 0;
    const dw = dimensions && Array.isArray(dimensions) ? dimensions.reduce((sum, d) => sum + Number(d.grossWeight || 0), 0) : 0;
    setQuantity(qty.toString());
    setDeclaredWeight(dw > 0 ? dw.toString() : "");
  }, [dimensions]);

  // Fill data on dialog open
  useEffect(() => {
    if (open && order) {
      getPartnersApi().then((res) => setPartners(res?.data?.data?.data || []));
      getCarriersApi().then((res) => setCarriers(res?.data?.data?.data || []));
      getSuppliersApi().then((res) => setSuppliers(res?.data?.data?.data || []));

      setPartnerId(typeof order?.partner?.partnerId === "object" ? order.partner?.partnerId?._id || "" : order.partner?.partnerId || "");
      setCarrierId(typeof order.carrierId === "object" ? order.carrierId?._id || "" : order.carrierId || "");
      setSupplierId(typeof order.supplierId === "object" ? order.supplierId?._id || "" : order.supplierId || "");
      setServiceId(typeof order.serviceId === "object" ? order.serviceId?._id || "" : order.serviceId || "");
      setNote(order.note || "");
      setSender(order.sender || { fullname: "", address1: "", address2: "", address3: "", phone: "" });
      setRecipient(
        order.recipient || {
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
        }
      );
      setContent(order.packageDetail?.content || "");
      setProductType(order.productType || EPRODUCT_TYPE.DOCUMENT);
      setDeclaredWeight(String(order.packageDetail?.declaredWeight));
      setQuantity(String(order.packageDetail?.quantity));
      setDeclaredValue(String(order.packageDetail?.declaredValue));
      setCurrency(order.packageDetail?.currency || ECURRENCY.VND);
      setDimensions(order.packageDetail?.dimensions || []);
      setSurcharges(order.surcharges || []);
      setExtraFeeIds(order.extraFees?.extraFeeIds || []);
      setCustomVATPercentage(order.vat?.customVATPercentage ?? 8);
      setCarrierAirWaybillCode(order.carrierAirWaybillCode || "");
    }
  }, [order, open]);

  // Fetch services on carrier change
  useEffect(() => {
    if (carrierId) {
      fetchServices(carrierId);
      setVolWeightRate(carriers.find((c) => c._id === carrierId)?.volWeightRate || null);
    } else {
      setServices([]);
      setVolWeightRate(null);
    }
  }, [carrierId, carriers]);

  useEffect(() => {
    if (carrierId && serviceId) {
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

  const fetchServices = async (carrierId: string) => {
    const selected = carriers.find((c) => c._id === carrierId);
    const companyId = typeof selected?.companyId === "object" ? selected?.companyId?._id : selected?.companyId;

    if (!companyId) return;

    try {
      const res = await getServicesByCarrierApi(companyId);
      setServices(res?.data?.data?.data || []);
      // eslint-disable-next-line
    } catch (err: any) {
      showNotification("Failed to load services!", "error");
    }
  };

  const getUpdatedFieldsDeep = (original: any, current: any) => {
    const updated: any = {};
    for (const key in current) {
      if (!deepEqual(current[key], original[key])) {
        updated[key] = current[key];
      }
    }
    return updated;
  };

  // Validate & Submit
  const handleSubmit = async () => {
    if (!order?._id || !recipient.country) {
      showNotification("Please fill in all required fields!", "warning");
      return;
    }
    try {
      setLoading(true);

      // Build current & original payload
      const currentPayload = {
        carrierAirWaybillCode: carrierAirWaybillCode || null,
        carrierId: carrierId || null,
        serviceId: serviceId || null,
        supplierId: supplierId || null,
        partner: partnerId ? { partnerId, partnerName: partners.find((p) => p._id === partnerId)?.name || "" } : null,
        sender,
        recipient,
        packageDetail: {
          content,
          declaredWeight: Number(declaredWeight),
          quantity: Number(quantity),
          declaredValue: Number(declaredValue),
          currency,
          dimensions: dimensions || [],
        },
        note,
        productType,
        surcharges,
        extraFees: { extraFeeIds, fscFeePercentage: Number(fscFeePercentage) },
        vat: { customVATPercentage: Number(customVATPercentage) },
      };

      const originalPayload = {
        carrierAirWaybillCode: order.carrierAirWaybillCode || null,
        carrierId: typeof order.carrierId === "object" ? order.carrierId?._id : order.carrierId,
        serviceId: typeof order.serviceId === "object" ? order.serviceId?._id : order.serviceId,
        supplierId: typeof order.supplierId === "object" ? order.supplierId?._id : order.supplierId,
        partner: {
          partnerId: typeof order.partner?.partnerId === "object" ? order.partner.partnerId?._id : order.partner?.partnerId,
          partnerName: order.partner?.partnerName || "",
        },
        sender: order.sender,
        recipient: order.recipient,
        packageDetail: order.packageDetail,
        note: order.note,
        productType: order.productType,
        surcharges: order.surcharges,
        extraFees: order.extraFees,
        vat: order.vat,
      };

      // Get changed fields only
      const diffPayload = getUpdatedFieldsDeep(originalPayload, currentPayload);

      if (Object.keys(diffPayload).length === 0) {
        showNotification("No changes to update!", "info");
        setLoading(false);
        return;
      }
      diffPayload._id = order._id; // Ensure order ID present
      await updateOrderApi(order._id, diffPayload);
      showNotification("Order updated successfully", "success");
      onUpdated();
      onClose();
    } catch (err: any) {
      showNotification(err.message || "Failed to update order", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Update Order</DialogTitle>
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
              <OrderAddressSection label="Sender" data={sender} setData={setSender} showCountry={false} />
            </Paper>
          </Box>

          {/* Recipient */}
          <Box className="mb-2 ">
            <Paper>
              <Typography variant="h6" sx={{ background: "#2196f3", color: "#fff", px: 2, py: 1, textTransform: "uppercase" }}>
                Recipient Information
              </Typography>
              <OrderAddressSection label="Recipient" data={recipient} setData={setRecipient} showCountry={true} />
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
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
}
