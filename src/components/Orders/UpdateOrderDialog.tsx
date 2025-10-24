"use client";

import { useState, useEffect } from "react";
import deepEqual from "fast-deep-equal";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, TextField, Typography, Box, Paper, Alert } from "@mui/material";
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
import { IOrder, ISurchargeDetail } from "@/types/typeOrder";
import { ECountryCode, ECURRENCY, EPRODUCT_TYPE, IBasicContactInfor, IDimension, ERECORD_STATUS } from "@/types/typeGlobals";

interface Props {
  open: boolean;
  order: IOrder | null;
  onClose: () => void;
  onUpdated: () => void;
}

// Helper: always get id from string/object
function getId(val: any): string {
  if (!val) return "";
  if (typeof val === "string") return val === "[object Object]" ? "" : val;
  if (typeof val === "object" && typeof val._id === "string") return val._id;
  if (typeof val === "object" && typeof val.id === "string") return val.id;
  return "";
}

export default function UpdateOrderDialog({ open, order, onClose, onUpdated }: Props) {
  // Dropdowns
  const [partners, setPartners] = useState<{ _id: string; name: string }[]>([]);
  const [carriers, setCarriers] = useState<{ _id: string; name: string; companyId?: any; volWeightRate?: number }[]>([]);
  const [services, setServices] = useState<{ _id: string; code: string; name: string }[]>([]);
  const [suppliers, setSuppliers] = useState<{ _id: string; name: string }[]>([]);
  const [extraFeeList, setExtraFeeList] = useState<any[]>([]);

  // Form State
  const [partnerId, setPartnerId] = useState("");
  const [carrierId, setCarrierId] = useState("");
  const [serviceId, setServiceId] = useState("");
  const [supplierId, setSupplierId] = useState("");

  const [surcharges, setSurcharges] = useState<ISurchargeDetail[]>([]);
  const [extraFeeIds, setExtraFeeIds] = useState<string[]>([]);
  const [customVATPercentage, setCustomVATPercentage] = useState<string>("-1"); // -1 = system VAT
  const [fscFeePercentage, setFSCFeePercentage] = useState<string>(""); // "" = system FSC

  const [note, setNote] = useState("");
  const [carrierAirWaybillCode, setCarrierAirWaybillCode] = useState<string>("");

  // Volume Weight Rate
  const [volWeightRate, setVolWeightRate] = useState<number | null>(null);

  // Sender/Recipient
  const [sender, setSender] = useState<IBasicContactInfor>({ fullname: "", address1: "", address2: "", address3: "", phone: "" });
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
  const [dimensions, setDimensions] = useState<IDimension[]>([]);

  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();

  // Status & disabled logic
  const status = order?.status as ERECORD_STATUS | undefined;
  const isDisabled = status !== ERECORD_STATUS.Active;

  // auto calc qty & declaredWeight
  useEffect(() => {
    const qty = Array.isArray(dimensions) ? dimensions.length : 0;
    const dw = Array.isArray(dimensions) ? dimensions.reduce((sum, d) => sum + Number(d.grossWeight || 0), 0) : 0;
    setQuantity(qty.toString());
    setDeclaredWeight(dw > 0 ? dw.toString() : "");
  }, [dimensions]);

  // init theo đúng thứ tự
  useEffect(() => {
    if (!(open && order)) return;

    const init = async () => {
      try {
        // 1) fetch dropdowns song song
        const [partnersRes, carriersRes, suppliersRes] = await Promise.all([getPartnersApi(), getCarriersApi(), getSuppliersApi()]);
        const partnersData = partnersRes?.data?.data?.data || [];
        const carriersData = carriersRes?.data?.data?.data || [];
        const suppliersData = suppliersRes?.data?.data?.data || [];

        setPartners(partnersData);
        setCarriers(carriersData);
        setSuppliers(suppliersData);

        // 2) read ids từ order
        const carrierIdFromOrder = getId(order?.carrierId);
        const serviceIdFromOrder = getId(order?.serviceId);
        const supplierIdFromOrder = getId(order?.supplierId);
        const partnerIdFromOrder = getId(order?.partner?.partnerId);

        // 3) tìm companyId từ carrier để fetch services
        let companyId: string | undefined;
        const selectedCarrier = carriersData.find((c: any) => String(c._id) === carrierIdFromOrder);
        if (selectedCarrier) {
          companyId = typeof selectedCarrier.companyId === "object" ? selectedCarrier.companyId?._id : selectedCarrier.companyId;
        }

        // 4) fetch services
        let servicesData: any[] = [];
        if (companyId) {
          const servicesRes = await getServicesByCarrierApi(companyId);
          servicesData = servicesRes?.data?.data?.data || [];
        }
        setServices(servicesData);

        // 5) set state sau khi có options
        setPartnerId(partnerIdFromOrder);
        setCarrierId(carrierIdFromOrder);
        setSupplierId(supplierIdFromOrder);
        setServiceId(serviceIdFromOrder);

        setNote(order?.note || "");
        setSender(order?.sender || { fullname: "", address1: "", address2: "", address3: "", phone: "" });
        setRecipient(
          order?.recipient || {
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
        setContent(order?.packageDetail?.content || "");
        setProductType(order?.productType || EPRODUCT_TYPE.DOCUMENT);
        setDeclaredWeight(String(order?.packageDetail?.declaredWeight ?? ""));
        setQuantity(String(order?.packageDetail?.quantity ?? "1"));
        setDeclaredValue(String(order?.packageDetail?.declaredValue ?? ""));
        setCurrency(order?.packageDetail?.currency || ECURRENCY.VND);
        setDimensions(order?.packageDetail?.dimensions || []);

        setSurcharges(Array.isArray(order?.surcharges) ? order!.surcharges : []);
        setExtraFeeIds(order?.extraFees?.extraFeeIds || []);
        setCustomVATPercentage(String(order?.vat?.customVATPercentage ?? -1));
        setFSCFeePercentage(String(order?.extraFees?.fscFeePercentage ?? ""));

        setCarrierAirWaybillCode(order?.carrierAirWaybillCode || "");

        const vwr = selectedCarrier?.volWeightRate;
        setVolWeightRate(typeof vwr === "number" ? vwr : null);
      } catch (e: any) {
        console.error(e);
        showNotification(e?.message || "Failed to load dropdowns", "error");
      }
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, order]);

  // change carrier -> fetch services & vwr (không reset serviceId ở đây)
  useEffect(() => {
    const fetchServices = async (carrierId: string) => {
      try {
        const selected = carriers.find((c) => c._id === carrierId);
        const companyId = typeof selected?.companyId === "object" ? selected?.companyId?._id : selected?.companyId;
        if (!companyId) {
          setServices([]);
          return;
        }
        const res = await getServicesByCarrierApi(companyId);
        setServices(res?.data?.data?.data || []);
      } catch (err) {
        console.error("Error fetching services:", err);
        showNotification("Failed to load services!", "error");
      }
    };
    if (carrierId) {
      fetchServices(carrierId);
      const vwr = carriers.find((c) => c._id === carrierId)?.volWeightRate ?? null;
      setVolWeightRate(typeof vwr === "number" ? vwr : null);
    } else {
      setServices([]);
      setVolWeightRate(null);
    }
  }, [carrierId, carriers, showNotification]);

  // extra fee list by carrier & service
  useEffect(() => {
    if (carrierId && serviceId) {
      getExtraFeesByCarrierServiceApi(carrierId, serviceId)
        .then((res) => setExtraFeeList(res?.data?.data?.data || []))
        .catch((err) => {
          console.error("Error fetching extra fees:", err);
          showNotification("Failed to load extra fees!", "error");
        });
    } else {
      setExtraFeeList([]);
    }
  }, [carrierId, serviceId, showNotification]);

  const getUpdatedFieldsDeep = (original: any, current: any) => {
    const updated: any = {};
    for (const key in current) if (!deepEqual(current[key], original[key])) updated[key] = current[key];
    return updated;
  };

  const handleSubmit = async () => {
    if (!order?._id || !recipient.country) return void showNotification("Please fill in all required fields!", "warning");
    if (isDisabled) return void showNotification("Cannot update order when it is locked or deleted.", "warning");
    try {
      setLoading(true);

      const surchargeTotalComputed = (surcharges || []).reduce((sum, x) => sum + Number(x?.amount || 0), 0);

      const currentPayload = {
        carrierAirWaybillCode: carrierAirWaybillCode?.trim() || null,
        carrierId: carrierId || null,
        serviceId: serviceId || null,
        supplierId: supplierId || null,
        partner: { partnerId: partnerId || null, partnerName: partnerId ? partners.find((p) => p._id === partnerId)?.name || "" : "" },

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

        // BE cũ:
        surcharges,
        surchargeTotal: surchargeTotalComputed,
        extraFees: {
          extraFeeIds,
          fscFeePercentage: Number.isFinite(Number(fscFeePercentage)) ? Number(fscFeePercentage) : null,
        },
        vat: {
          customVATPercentage: Number.isFinite(Number(customVATPercentage)) ? Number(customVATPercentage) : -1,
        },
      };

      const originalPayload = {
        carrierAirWaybillCode: order?.carrierAirWaybillCode || null,
        carrierId: getId(order?.carrierId) || null,
        serviceId: getId(order?.serviceId) || null,
        supplierId: getId(order?.supplierId) || null,
        partner: { partnerId: getId(order?.partner?.partnerId), partnerName: order?.partner?.partnerName || "" },
        sender: order?.sender,
        recipient: order?.recipient,
        packageDetail: order?.packageDetail,
        note: order?.note,
        productType: order?.productType,
        surcharges: Array.isArray(order?.surcharges) ? order?.surcharges : [],
        surchargeTotal: Number(order?.surchargeTotal ?? 0),
        extraFees: {
          extraFeeIds: order?.extraFees?.extraFeeIds || [],
          fscFeePercentage: order?.extraFees?.fscFeePercentage !== undefined ? Number(order?.extraFees?.fscFeePercentage) : null,
        },
        vat: {
          customVATPercentage: order?.vat?.customVATPercentage !== undefined ? Number(order?.vat?.customVATPercentage) : -1,
        },
      };

      const diffPayload = getUpdatedFieldsDeep(originalPayload, currentPayload);
      if (Object.keys(diffPayload).length === 0) {
        showNotification("No changes to update!", "info");
        setLoading(false);
        return;
      }

      diffPayload._id = order._id;
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
        {isDisabled && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            This order is <b>{status === ERECORD_STATUS.Locked ? "LOCKED" : "DELETED"}</b>. You cannot edit any fields.
          </Alert>
        )}
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
                disabled={isDisabled}
              />
            </Paper>
          </Box>

          {/* Sender */}
          <Box className="mb-2 ">
            <Paper>
              <Typography variant="h6" sx={{ background: "#2196f3", color: "#fff", px: 2, py: 1, textTransform: "uppercase" }}>
                Sender Information
              </Typography>
              <OrderAddressSection label="Sender" data={sender} setData={setSender} showCountry={false} disabled={isDisabled} />
            </Paper>
          </Box>

          {/* Recipient */}
          <Box className="mb-2 ">
            <Paper>
              <Typography variant="h6" sx={{ background: "#2196f3", color: "#fff", px: 2, py: 1, textTransform: "uppercase" }}>
                Recipient Information
              </Typography>
              <OrderAddressSection label="Recipient" data={recipient} setData={setRecipient} showCountry={true} disabled={isDisabled} />
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
                disabled={isDisabled}
              />
            </Paper>
          </Box>

          {/* Dimension */}
          <OrderDimensionSection volWeightRate={volWeightRate} dimensions={dimensions || []} setDimensions={setDimensions} disabled={isDisabled} />

          {/* Note */}
          <Box className="mb-2 ">
            <Paper>
              <Typography variant="h6" sx={{ background: "#2196f3", color: "#fff", px: 2, py: 1, textTransform: "uppercase" }}>
                Note
              </Typography>
              <Box sx={{ p: 2 }}>
                <TextField label="Note" value={note} onChange={(e) => setNote(e.target.value)} fullWidth multiline minRows={3} disabled={isDisabled} />
              </Box>
            </Paper>
          </Box>

          {/* Extra Fee, VAT, Surcharges */}
          <OrderVATSection customVATPercentage={customVATPercentage} setCustomVATPercentage={setCustomVATPercentage} disabled={isDisabled} />
          <OrderExtraFeeSection
            fscFeePercentage={fscFeePercentage}
            setFSCFeePercentage={setFSCFeePercentage}
            extraFeeList={extraFeeList}
            extraFeeIds={extraFeeIds}
            setExtraFeeIds={setExtraFeeIds}
            disabled={isDisabled}
          />
          <OrderSurchargeSection surcharges={surcharges} setSurcharges={setSurcharges} disabled={isDisabled} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading || isDisabled}>
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
}
