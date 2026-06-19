import { Box, Button, Dialog, MenuItem, Paper, Stack, TextField } from "@mui/material";
import { WAREHOUSES, getWarehouseLabel } from "../../../shared/utils/warehouseCatalog";

export const StockTransferDialog = ({
  open,
  product,
  targetWarehouseId,
  quantity,
  error,
  onTargetWarehouseChange,
  onQuantityChange,
  onClose,
  onConfirm,
}) => {
  const availableWarehouses = WAREHOUSES.filter(
    (warehouse) => warehouse.id !== product?.warehouseId,
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <Paper elevation={0} sx={{ p: 3 }}>
        <Stack spacing={2.5}>
          <Box>
            <Box sx={{ fontSize: "1.35rem", fontWeight: 700 }}>
              Transferir de estoque
            </Box>
            <Box sx={{ color: "text.secondary" }}>
              A quantidade informada sai do estoque atual e fica pendente para confirmacao do estoque destino.
            </Box>
          </Box>

          <TextField label="Produto" value={product?.description || ""} disabled />
          <TextField label="Estoque atual" value={getWarehouseLabel(product?.warehouseId)} disabled />
          <TextField label="Saldo atual" value={product?.quantity || 0} disabled />
          <TextField
            label="Quantidade a transferir"
            type="number"
            value={quantity}
            onChange={(event) => onQuantityChange(event.target.value)}
            slotProps={{ htmlInput: { min: 1, max: product?.quantity || 0 } }}
            fullWidth
            autoFocus
          />
          <TextField
            select
            label="Estoque destino"
            value={targetWarehouseId}
            onChange={(event) => onTargetWarehouseChange(event.target.value)}
            fullWidth
          >
            {availableWarehouses.map((warehouse) => (
              <MenuItem key={warehouse.id} value={warehouse.id}>
                {warehouse.label}
              </MenuItem>
            ))}
          </TextField>

          {error && (
            <Paper elevation={0} sx={{ p: 1.5, bgcolor: "error.light", color: "error.contrastText" }}>
              {error}
            </Paper>
          )}

          <Stack direction="row" spacing={1.5} justifyContent="flex-end">
            <Button variant="outlined" onClick={onClose}>Cancelar</Button>
            <Button variant="contained" onClick={onConfirm}>Transferir</Button>
          </Stack>
        </Stack>
      </Paper>
    </Dialog>
  );
};
