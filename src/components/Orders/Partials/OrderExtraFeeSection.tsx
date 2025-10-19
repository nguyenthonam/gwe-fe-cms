"use client";
import ExtraFeeMultiSelect from "@/components/Globals/ExtraFeeSelect";
import NumericInput from "@/components/Globals/NumericInput";
import { Typography } from "@mui/material";

interface Props {
  fscFeePercentage: string;
  setFSCFeePercentage: (v: string) => void;
  extraFeeList: any[];
  extraFeeIds: string[];
  setExtraFeeIds: (ids: string[]) => void;
  disabled?: boolean;
}

export default function OrderExtraFeeSection({ fscFeePercentage, setFSCFeePercentage, extraFeeList, extraFeeIds, setExtraFeeIds, disabled = false }: Props) {
  return (
    <div>
      <div className="mb-4">
        <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: "bold" }}>
          Fuel Surcharge (FSC) (%)
        </Typography>
        <NumericInput label="FSC (%)" value={String(fscFeePercentage)} onChange={setFSCFeePercentage} fullWidth size="small" disabled={disabled} />
      </div>
      <div>
        <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
          Extra Fees
        </Typography>
        <ExtraFeeMultiSelect extraFeeList={extraFeeList} value={extraFeeIds} onChange={setExtraFeeIds} label="" required={false} disabled={disabled} />
      </div>
    </div>
  );
}
