"use client";
import ExtraFeeMultiSelect from "@/components/Globals/ExtraFeeSelect";
import { Typography } from "@mui/material";

interface Props {
  extraFeeList: any[];
  extraFeeIds: string[];
  setExtraFeeIds: (ids: string[]) => void;
}

export default function OrderExtraFeeSection({ extraFeeList, extraFeeIds, setExtraFeeIds }: Props) {
  return (
    <div>
      <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: "bold" }}>
        Phụ Phí
      </Typography>
      <ExtraFeeMultiSelect extraFeeList={extraFeeList} value={extraFeeIds} onChange={setExtraFeeIds} label="Phụ phí" required={false} />
    </div>
  );
}
