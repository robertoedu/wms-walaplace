import { Button } from "@mui/material";

export const WarehouseBackButton = ({ onClick }) => (
  <Button variant="outlined" onClick={onClick} sx={{ bgcolor: "#ffffff", fontWeight: 900, px: 3, py: 1.15 }}>
    Voltar
  </Button>
);
