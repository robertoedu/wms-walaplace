import { Box, Button, Dialog, Paper, Stack, TextField } from "@mui/material";

export const StockEditDialog = ({
  open,
  product,
  quantity,
  error,
  onQuantityChange,
  onClose,
  onSave,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <Paper elevation={0} sx={{ p: 3 }}>
        <Stack spacing={2.5}>
          <Box>
            <Box sx={{ fontSize: "1.35rem", fontWeight: 700 }}>
              Editar quantidade
            </Box>
            <Box sx={{ color: "text.secondary" }}>
              Ajuste a quantidade do produto selecionado
            </Box>
          </Box>

          <TextField label="Descrição" value={product?.description || ""} disabled />
          <TextField label="SKU" value={product?.sku || ""} disabled />
          <TextField label="EAN" value={product?.ean || ""} disabled />
          <TextField
            label="Localização"
            value={product?.currentLocation || ""}
            disabled
          />
          <TextField
            label="Quantidade"
            value={quantity}
            onChange={(event) => onQuantityChange(event.target.value)}
            type="number"
            fullWidth
          />

          {error && (
            <Paper
              elevation={0}
              sx={{
                p: 1.5,
                bgcolor: "error.light",
                color: "error.contrastText",
              }}
            >
              {error}
            </Paper>
          )}

          <Stack direction="row" spacing={1.5} justifyContent="flex-end">
            <Button variant="outlined" onClick={onClose}>
              Cancelar
            </Button>
            <Button variant="contained" onClick={onSave}>
              Salvar
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Dialog>
  );
};
