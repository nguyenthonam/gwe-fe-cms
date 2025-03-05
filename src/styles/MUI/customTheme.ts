import { createTheme } from "@mui/material/styles";
import { teal } from "@mui/material/colors";

declare module "@mui/material/styles" {
  interface Palette {
    teal: Palette["primary"];
  }
  interface PaletteOptions {
    teal?: PaletteOptions["primary"];
  }
}

declare module "@mui/material/Button" {
  interface ButtonPropsColorOverrides {
    teal: true;
  }
}

const theme = createTheme({
  palette: {
    teal: {
      main: teal[500], // Màu chính
      light: teal[300], // Màu nhạt hơn
      dark: teal[700], // Màu đậm hơn
      contrastText: "#fff",
    },
  },
});

export default theme;
