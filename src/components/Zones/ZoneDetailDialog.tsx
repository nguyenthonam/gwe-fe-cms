"use client";

import { Dialog, DialogTitle, DialogContent, Stack, Typography } from "@mui/material";
import { EnumChip } from "@/components/Globals/EnumChip";
import { IZone } from "@/types/typeZone";
import { recordStatusLabel } from "@/utils/constants/enumLabel";
import { COUNTRIES } from "@/utils/constants";

export default function ZoneDetailDialog({ open, onClose, zone }: { open: boolean; onClose: () => void; zone: IZone | null }) {
  if (!zone) return null;

  const countryName = COUNTRIES.find((c) => c.code === zone.countryCode)?.name || zone.countryCode;
  const carrierName = typeof zone.carrierId === "object" ? zone.carrierId?.name : zone.carrierId;

  return (
    <Dialog open={open} onClose={onClose} fullWidth>
      <DialogTitle>Chi tiết Zone</DialogTitle>
      <DialogContent>
        <Stack spacing={1} mt={1}>
          <Typography>
            <strong>Carrier:</strong> {carrierName}
          </Typography>
          <Typography>
            <strong>Zone:</strong> {zone.zone}
          </Typography>
          <Typography>
            <strong>Quốc gia:</strong> {countryName}
          </Typography>
          <Typography>
            <strong>Trạng thái:</strong> <EnumChip type="recordStatus" value={zone.status} />
          </Typography>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
