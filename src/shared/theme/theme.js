import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    primary: {
      main: "#f97316",
      light: "#fb923c",
      dark: "#c2410c",
      contrastText: "#fff",
    },
    secondary: {
      main: "#2563eb",
      light: "#60a5fa",
      dark: "#1d4ed8",
      contrastText: "#fff",
    },
    success: { main: "#15803d", light: "#dcfce7", dark: "#166534" },
    warning: { main: "#d97706", light: "#fef3c7", dark: "#92400e" },
    error: { main: "#dc2626", light: "#fee2e2", dark: "#991b1b" },
    info: { main: "#2563eb", light: "#dbeafe", dark: "#1e40af" },
    background: { default: "#f5f7fa", paper: "#ffffff" },
    text: { primary: "#172033", secondary: "#5f6b7a" },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { borderRadius: 8, minHeight: 40 },
        contained: {
          boxShadow: "none",
          "&:hover": { boxShadow: "0 2px 8px rgba(249, 115, 22, 0.28)" },
        },
      },
    },
    MuiPaper: { styleOverrides: { root: { borderRadius: 8 } } },
    MuiChip: { styleOverrides: { root: { borderRadius: 6, fontWeight: 700 } } },
    MuiAlert: { styleOverrides: { root: { borderRadius: 8, fontWeight: 600 } } },
    MuiTableHead: { styleOverrides: { root: { backgroundColor: "#eef2f7" } } },
    MuiOutlinedInput: {
      styleOverrides: {
        root: { "&.Mui-focused": { backgroundColor: "#fff7ed" } },
      },
    },
  },
});
