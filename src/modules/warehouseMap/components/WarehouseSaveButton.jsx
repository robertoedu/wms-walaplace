import { Button } from "@mui/material";

export const WarehouseSaveButton = ({ onClick }) => (
  <Button variant="contained" onClick={onClick} sx={{ fontWeight: 900, px: 3, py: 1.15 }}>
    Salvar
  </Button>
);
