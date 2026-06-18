import { Button, Stack } from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

export const WarehouseMapToolbar = ({ onSave, onReset }) => (
  <Stack direction="row" spacing={1}>
    <Button fullWidth variant="contained" startIcon={<SaveIcon />} onClick={onSave}>Salvar</Button>
    <Button variant="outlined" startIcon={<RestartAltIcon />} onClick={onReset}>Limpar</Button>
  </Stack>
);

