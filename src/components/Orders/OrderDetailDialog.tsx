"use client";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, Divider } from "@mui/material";
import { IOrder } from "@/types/typeOrder";
import { formatCurrency } from "@/utils/hooks/hookCurrency";
import { formatDate } from "@/utils/hooks/hookDate";
import { EnumChip } from "../Globals/EnumChip";

interface Props {
  open: boolean;
  order: IOrder | null;
  onClose: () => void;
}

export default function OrderDetailDialog({ open, order, onClose }: Props) {
  if (!order) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>Chi tiết Đơn hàng</DialogTitle>
      <DialogContent>
        <Box>
          <Typography variant="subtitle2" color="primary">
            Thông tin chung
          </Typography>
          <Divider sx={{ my: 1 }} />
          <Box mb={2}>
            <b>HAWB:</b> {order.trackingCode} &nbsp;
            <b>CAWB:</b> {order.carrierAirWaybillCode} &nbsp;
            <b>Ngày tạo:</b> {formatDate(order.createdAt || "")} <br />
            <br />
            <b>Trạng thái:</b> <EnumChip type="orderStatus" value={order.orderStatus} />
          </Box>
          <Box mb={2}>
            <b>Customer:</b> {order.partner?.partnerName} <br />
            <b>Supplier:</b> {typeof order.supplierId === "object" ? order.supplierId?.name : order.supplierId} <br />
            <b>Carrier:</b> {typeof order.carrierId === "object" ? order.carrierId?.name : order.carrierId} <br />
            <b>Service:</b> {typeof order.serviceId === "object" ? order.serviceId?.code : order.serviceId}
          </Box>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2">Người gửi</Typography>
          <Box mb={2}>
            <div>
              <b>Họ tên:</b> {order.sender?.fullname}
            </div>
            <div>
              <b>Phone:</b> {order.sender?.phone}
            </div>
            <div>
              <b>Địa chỉ:</b> {order.sender?.address1} {order.sender?.address2} {order.sender?.address3}
            </div>
          </Box>
          <Typography variant="subtitle2">Người nhận</Typography>
          <Box mb={2}>
            <div>
              <b>Họ tên:</b> {order.recipient?.fullname}
            </div>
            <div>
              <b>Phone:</b> {order.recipient?.phone}
            </div>
            <div>
              <b>Địa chỉ:</b> {order.recipient?.address1} {order.recipient?.address2} {order.recipient?.address3}
            </div>
            <div>
              <b>Quốc gia:</b> {order.recipient?.country?.name} ({order.recipient?.country?.code})
            </div>
            <div>
              <b>City/State:</b> {order.recipient?.city} / {order.recipient?.state}
            </div>
            <div>
              <b>Post Code:</b> {order.recipient?.postCode}
            </div>
          </Box>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2">Thông tin hàng hóa</Typography>
          <Box mb={2}>
            <div>
              <b>Loại hàng:</b> {order.productType}
            </div>
            <div>
              <b>Nội dung:</b> {order.packageDetail?.content}
            </div>
            <div>
              <b>Trọng lượng khai báo:</b> {order.packageDetail?.declaredWeight}
            </div>
            <div>
              <b>Số lượng:</b> {order.packageDetail?.quantity}
            </div>
            <div>
              <b>Giá trị khai báo:</b> {formatCurrency(order.packageDetail?.declaredValue || 0, order.packageDetail?.currency)}
            </div>
            <div>
              <b>Kích thước:</b> {order.packageDetail?.dimensions?.map((d) => `${d.length}x${d.width}x${d.height}`).join(", ")}
            </div>
          </Box>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2">Giá trị & Chi phí</Typography>
          <Box mb={2}>
            <div>
              <b>Base rate (buy):</b> {formatCurrency(order.basePrice?.purchasePrice?.value || 0, order.currency)}
            </div>
            <div>
              <b>Base rate (sell):</b> {formatCurrency(order.basePrice?.salePrice?.value || 0, order.currency)}
            </div>
            <div>
              <b>VAT (buy):</b> {formatCurrency(order.vat?.purchaseVATTotal || 0, order.currency)}
            </div>
            <div>
              <b>VAT (sell):</b> {formatCurrency(order.vat?.saleVATTotal, order.currency)}
            </div>
            <div>
              <b>Extra fees:</b> {formatCurrency(order.extraFees?.extraFeesTotal, order.currency)}
            </div>
            <div>
              <b>Total (buy):</b> {formatCurrency(order.totalPrice?.purchaseTotal, order.currency)}
            </div>
            <div>
              <b>Total (sell):</b> {formatCurrency(order.totalPrice?.saleTotal, order.currency)}
            </div>
            <div>
              <b>Lợi nhuận:</b> {formatCurrency((order.totalPrice?.saleTotal || 0) - (order.totalPrice?.purchaseTotal || 0), order.currency)}
            </div>
          </Box>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle2">Ghi chú</Typography>
          <Box>{order.note}</Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          Đóng
        </Button>
      </DialogActions>
    </Dialog>
  );
}
