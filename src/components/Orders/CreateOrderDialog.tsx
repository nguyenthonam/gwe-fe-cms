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
import { getExtraFeesApi } from "@/utils/apis/apiExtraFee";
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
  const [customVATPercentage, setCustomVATPercentage] = useState<number | "">("");

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

      getExtraFeesApi().then((res) => {
        setExtraFeeList(res?.data?.data?.data || []);
      });
      setPartnerId("");
      setCarrierId("");
      setServiceId("");
      setSupplierId("");
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
      await createOrderApi({
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
        extraFees: { extraFeeIds: extraFeeIds },
        vat: { customVATPercentage: Number(customVATPercentage) },
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
          <Box className="mb-2">
            <Paper>
              <Typography variant="h6" sx={{ background: "#2196f3", color: "#fff", px: 2, py: 1 }}>
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
              />
            </Paper>
          </Box>

          {/* Sender */}
          <Box className="mb-2 ">
            <Paper>
              <Typography variant="h6" sx={{ background: "#2196f3", color: "#fff", px: 2, py: 1 }}>
                Sender Information
              </Typography>
              <OrderAddressSection label="Sender" data={sender} setData={setSender} showCountry={false} />
            </Paper>
          </Box>

          {/* Recipient */}
          <Box className="mb-2 ">
            <Paper>
              <Typography variant="h6" sx={{ background: "#2196f3", color: "#fff", px: 2, py: 1 }}>
                Recipient Information
              </Typography>
              <OrderAddressSection label="Recipient" data={recipient} setData={setRecipient} showCountry={true} />
            </Paper>
          </Box>

          {/* Product Info */}
          <Box className="mb-2">
            <Paper>
              <Typography variant="h6" sx={{ background: "#2196f3", color: "#fff", px: 2, py: 1 }}>
                Product Information
              </Typography>
              <OrderProductSection
                content={content}
                setContent={setContent}
                productType={productType}
                setProductType={setProductType}
                declaredWeight={declaredWeight}
                setDeclaredWeight={setDeclaredWeight}
                quantity={quantity}
                setQuantity={setQuantity}
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
              <Typography variant="h6" sx={{ background: "#2196f3", color: "#fff", px: 2, py: 1 }}>
                Note
              </Typography>
              <Box sx={{ p: 2 }}>
                <TextField label="Note" value={note} onChange={(e) => setNote(e.target.value)} fullWidth multiline minRows={3} />
              </Box>
            </Paper>
          </Box>

          {/* Extra Fee, VAT, Surcharges */}
          <OrderExtraFeeSection extraFeeList={extraFeeList} extraFeeIds={extraFeeIds} setExtraFeeIds={setExtraFeeIds} />
          <OrderVATSection customVATPercentage={customVATPercentage} setCustomVATPercentage={setCustomVATPercentage} />
          <OrderSurchargeSection surcharges={surcharges} setSurcharges={setSurcharges} />
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
