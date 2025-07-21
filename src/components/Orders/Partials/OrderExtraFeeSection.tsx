"use client";
import ExtraFeeMultiSelect from "@/components/Globals/ExtraFeeSelect";
import NumericInput from "@/components/Globals/NumericInput";
import { Typography } from "@mui/material";

interface Props {
  fscFeePercentage: number;
  setFSCFeePercentage: (v: number) => void;
  extraFeeList: any[];
  extraFeeIds: string[];
  setExtraFeeIds: (ids: string[]) => void;
}

export default function OrderExtraFeeSection({ fscFeePercentage, setFSCFeePercentage, extraFeeList, extraFeeIds, setExtraFeeIds }: Props) {
  return (
    <div>
      <div className="mb-4">
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: "bold" }}>
          Fuel Surcharge (FSC) (%)
        </Typography>
        <NumericInput label="FSC (%)" value={String(fscFeePercentage)} onChange={(value) => setFSCFeePercentage(Number(value))} fullWidth size="small" />
      </div>
      <div>
        <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
          Extra Fees
        </Typography>
        <ExtraFeeMultiSelect extraFeeList={extraFeeList} value={extraFeeIds} onChange={setExtraFeeIds} label="" required={false} />
      </div>
    </div>
  );
}
