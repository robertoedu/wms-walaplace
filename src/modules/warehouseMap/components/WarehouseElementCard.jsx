import { Box, Card, Stack } from "@mui/material";

export const WarehouseElementCard = ({ icon, name, description, onClick }) => (
  <Card
    component="button"
    onClick={onClick}
    sx={{
      width: "100%",
      p: 1.5,
      border: "1px solid #dbe4f0",
      borderRadius: 3,
      bgcolor: "#ffffff",
      textAlign: "left",
      cursor: "pointer",
      transition: "160ms ease",
      "&:hover": {
        borderColor: "#f97316",
        boxShadow: "0 14px 28px rgba(15, 23, 42, 0.10)",
        transform: "translateY(-1px)",
      },
    }}
  >
    <Stack direction="row" spacing={1.5} alignItems="center">
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: 2,
          bgcolor: "#fff7ed",
          color: "#ea580c",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 900,
          fontSize: 18,
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Box sx={{ fontWeight: 900, color: "#0f172a", fontSize: 15 }}>{name}</Box>
        <Box sx={{ color: "#64748b", fontSize: 13 }}>{description}</Box>
      </Box>
    </Stack>
  </Card>
);
