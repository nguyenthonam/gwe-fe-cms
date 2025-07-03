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

  // Form State (điền lại data khi open)
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
  const [productType, setProductType] = useState<EPRODUCT_TYPE>(EPRODUCT_TYPE.DOCUMENT); // Mặc định là DOCUMENT
  const [declaredWeight, setDeclaredWeight] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [declaredValue, setDeclaredValue] = useState("");
  const [currency, setCurrency] = useState<ECURRENCY>(ECURRENCY.VND); // Mặc định là VND

  // Dimension (dùng array cho nhiều kiện nếu cần)
  const [dimensions, setDimensions] = useState<IDimension[] | []>();

  const [loading, setLoading] = useState(false);
  const { showNotification } = useNotification();

  useEffect(() => {
    // Tính lại quantity (số dòng dimension) và tổng grossWeight
    const qty = dimensions && Array.isArray(dimensions) ? dimensions.length : 0;
    const dw = dimensions && Array.isArray(dimensions) ? dimensions.reduce((sum, d) => sum + Number(d.grossWeight || 0), 0) : 0;
    setQuantity(qty.toString());
    setDeclaredWeight(dw > 0 ? dw.toString() : "");
  }, [dimensions]);
  // Fill lại dữ liệu khi order thay đổi
  useEffect(() => {
    if (open && order) {
      console.log(" ===== Updating order data in dialog: =====", order);
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
    }
  }, [order, open]);

  // Fetch lại services khi đổi carrier
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
      // Lấy danh sách phụ phí theo carrier và service đã chọn
      getExtraFeesByCarrierServiceApi(carrierId, serviceId)
        .then((res) => {
          setExtraFeeList(res?.data?.data?.data || []);
        })
        .catch((err) => {
          console.error("Error fetching extra fees:", err);
          showNotification("Không thể tải phụ phí!", "error");
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
    } catch (err: any) {
      console.log(err.massage);
      showNotification("Không thể tải dịch vụ!", "error");
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
    if (
      !order?._id ||
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

      // Build payload hiện tại & gốc (original lấy từ order prop truyền vào dialog)
      const currentPayload = {
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

      // Lấy các field đã đổi
      const diffPayload = getUpdatedFieldsDeep(originalPayload, currentPayload);

      console.log("Diff Payload:", diffPayload);
      console.log("Original Payload:", originalPayload);
      console.log("Current Payload:", currentPayload);

      if (Object.keys(diffPayload).length === 0) {
        showNotification("Không có thay đổi nào để cập nhật!", "info");
        setLoading(false);
        return;
      }
      diffPayload._id = order._id; // Đảm bảo có ID của đơn hàng
      await updateOrderApi(order._id, diffPayload);
      showNotification("Cập nhật đơn hàng thành công", "success");
      onUpdated();
      onClose();
    } catch (err: any) {
      showNotification(err.message || "Lỗi cập nhật đơn hàng", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Cập nhật đơn hàng</DialogTitle>
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
              <Typography variant="h6" sx={{ background: "#2196f3", color: "#fff", px: 2, py: 1 }}>
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
        <Button onClick={onClose}>Huỷ</Button>
        <Button onClick={handleSubmit} variant="contained" disabled={loading}>
          Lưu thay đổi
        </Button>
      </DialogActions>
    </Dialog>
  );
}
