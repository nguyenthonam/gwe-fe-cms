// components/Globals/RequiredLabel.tsx
import { Typography } from "@mui/material";

interface RequiredLabelProps {
  children: React.ReactNode;
  required?: boolean;
}

export function RequiredLabel({ children, required = false }: RequiredLabelProps) {
  return (
    <Typography
      variant="body2"
      sx={{
        textTransform: "uppercase",
        display: "inline-flex",
        alignItems: "center",
        fontWeight: 500,
      }}
      component="label"
    >
      {children}
      {required && <span style={{ color: "#f44336", marginLeft: 2 }}>*</span>}
    </Typography>
  );
}
