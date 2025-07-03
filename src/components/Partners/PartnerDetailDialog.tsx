// PartnerDetailDialog.tsx
"use client";

import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, Typography, Divider, Grid } from "@mui/material";
import { ICompany } from "@/types/typeCompany";
import { EnumChip } from "../Globals/EnumChip";

interface Props {
  open: boolean;
  onClose: () => void;
  partner: ICompany | null;
}

export default function PartnerDetailDialog({ open, onClose, partner }: Props) {
  if (!partner) return null;

  const formatDate = (date?: string | Date | null) => (date ? new Date(date).toLocaleDateString("vi-VN") : "-");

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: "bold" }} color="primary">
        CHI TIẾT THÔNG TIN ĐỐI TÁC
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          {/* THÔNG TIN CHÍNH */}
          <Typography fontWeight={600}>Thông tin chính</Typography>
          <Grid container spacing={2}>
            <Grid size={4}>
              <Typography variant="body2">Mã</Typography>
            </Grid>
            <Grid size={8}>
              <Typography fontWeight={500}>{partner.code}</Typography>
            </Grid>
            <Grid size={4}>
              <Typography variant="body2">Tên</Typography>
            </Grid>
            <Grid size={8}>
              <Typography fontWeight={500}>{partner.name}</Typography>
            </Grid>

            <Grid size={4}>
              <Typography variant="body2">Địa chỉ</Typography>
            </Grid>
            <Grid size={8}>
              <Typography fontWeight={500}>{partner.address}</Typography>
            </Grid>
          </Grid>

          {/* ĐẠI DIỆN */}
          <Divider sx={{ my: 1 }} />
          <Typography fontWeight={600}>Người đại diện</Typography>
          <Grid container spacing={2}>
            <Grid size={4}>
              <Typography variant="body2">Họ tên</Typography>
            </Grid>
            <Grid size={8}>
              <Typography fontWeight={500}>{partner.representative?.name}</Typography>
            </Grid>
            <Grid size={4}>
              <Typography variant="body2">Điện thoại</Typography>
            </Grid>
            <Grid size={8}>
              <Typography fontWeight={500}>{partner.representative?.phone}</Typography>
            </Grid>
          </Grid>

          {/* LIÊN HỆ */}
          <Divider sx={{ my: 1 }} />
          <Typography fontWeight={600}>Thông tin liên hệ</Typography>
          <Grid container spacing={2}>
            <Grid size={4}>
              <Typography variant="body2">Email</Typography>
            </Grid>
            <Grid size={8}>
              <Typography fontWeight={500}>{partner.contact?.email}</Typography>
            </Grid>
            <Grid size={4}>
              <Typography variant="body2">Hotline</Typography>
            </Grid>
            <Grid size={8}>
              <Typography fontWeight={500}>{partner.contact?.hotline}</Typography>
            </Grid>
            <Grid size={4}>
              <Typography variant="body2">Website</Typography>
            </Grid>
            <Grid size={8}>
              <Typography fontWeight={500}>{partner.contact?.website}</Typography>
            </Grid>
          </Grid>

          {/* HỢP ĐỒNG */}

          <Divider sx={{ my: 1 }} />
          <Typography fontWeight={600}>Thông tin hợp đồng</Typography>
          <Grid container spacing={2}>
            <Grid size={4}>
              <Typography variant="body2">Mã số thuế</Typography>
            </Grid>
            <Grid size={8}>
              <Typography fontWeight={500}>{partner.taxCode}</Typography>
            </Grid>
            <Grid size={4}>
              <Typography variant="body2">Trạng thái</Typography>
            </Grid>
            <Grid size={8}>
              <EnumChip type="recordStatus" value={partner.status} />
            </Grid>
          </Grid>

          {/* TẠO LÚC */}
          {partner.createdAt && (
            <>
              <Divider sx={{ my: 1 }} />
              <Grid container spacing={2}>
                <Grid size={4}>
                  <Typography variant="body2">Ngày tạo</Typography>
                </Grid>
                <Grid size={8}>
                  <Typography fontWeight={500}>{formatDate(partner.createdAt)}</Typography>
                </Grid>
              </Grid>
            </>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>
    </Dialog>
  );
}
