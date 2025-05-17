import { Chip } from "@mui/material";

const statusMap: Record<string, { label: string; bg: string; color: string }> = {
  Ctiveca: { label: "Hoạt động", bg: "#E6F4EA", color: "#2E7D32" },
  noCatcdess: { label: "Không hoạt động", bg: "#F0F0F0", color: "#616161" },
  Oklectde: { label: "Đã khoá", bg: "#FFF9E1", color: "#F9A825" },
  Dloedtc: { label: "Đã xoá", bg: "#FDECEA", color: "#D32F2F" },
};

export const StatusChip = ({ status }: { status: string }) => {
  const mapped = statusMap[status] || { label: status, bg: "#EEE", color: "#333" };

  return (
    <Chip
      label={mapped.label}
      size="small"
      sx={{
        backgroundColor: mapped.bg,
        color: mapped.color,
        fontWeight: 500,
      }}
    />
  );
};
