import { Box, Button, Dialog, Paper, Stack, TextField } from "@mui/material";
import { getWarehouseLabel } from "../../../shared/utils/warehouseCatalog";

export const StockMoveLocationDialog = ({
  open,
  product,
  location,
  quantity,
  error,
  onLocationChange,
  onQuantityChange,
  onClose,
  onSave,
}) => (
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
    <Paper elevation={0} sx={{ p: 3 }}>
      <Stack spacing={2.5}>
        <Box>
          <Box sx={{ fontSize: "1.35rem", fontWeight: 700 }}>
            Trocar localizacao
          </Box>
          <Box sx={{ color: "text.secondary" }}>
            Informe quanto deste saldo deve ir para a nova localizacao.
          </Box>
        </Box>

        <TextField label="Produto" value={product?.description || ""} disabled />
        <TextField label="Estoque" value={getWarehouseLabel(product?.warehouseId)} disabled />
        <TextField label="Local atual" value={product?.currentLocation || "-"} disabled />
        <TextField label="Saldo atual" value={product?.quantity || 0} disabled />
        <TextField
          label="Quantidade a mover"
          type="number"
          value={quantity}
          onChange={(event) => onQuantityChange(event.target.value)}
          slotProps={{ htmlInput: { min: 1, max: product?.quantity || 0 } }}
          fullWidth
          autoFocus
        />
        <TextField
          label="Nova localizacao"
          value={location}
          onChange={(event) => onLocationChange(event.target.value)}
          fullWidth
        />

        {error && (
          <Paper elevation={0} sx={{ p: 1.5, bgcolor: "error.light", color: "error.contrastText" }}>
            {error}
          </Paper>
        )}

        <Stack direction="row" spacing={1.5} justifyContent="flex-end">
          <Button variant="outlined" onClick={onClose}>Cancelar</Button>
          <Button variant="contained" onClick={onSave}>Salvar localizacao</Button>
        </Stack>
      </Stack>
    </Paper>
  </Dialog>
);
