import { Box, Button, Dialog, Paper, Stack, TextField } from "@mui/material";

export const StockCreateDialog = ({
  open,
  form,
  error,
  onChange,
  onClose,
  onSave,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <Paper elevation={0} sx={{ p: 3 }}>
        <Stack spacing={2.5}>
          <Box>
            <Box sx={{ fontSize: "1.35rem", fontWeight: 700 }}>
              Adicionar produto
            </Box>
            <Box sx={{ color: "text.secondary" }}>
              Cadastre um novo produto no estoque
            </Box>
          </Box>

          <TextField
            label="Descrição"
            value={form.description}
            onChange={(event) => onChange("description", event.target.value)}
            fullWidth
          />
          <TextField
            label="SKU"
            value={form.sku}
            onChange={(event) => onChange("sku", event.target.value)}
            fullWidth
          />
          <TextField
            label="EAN opcional"
            value={form.ean}
            onChange={(event) => onChange("ean", event.target.value)}
            fullWidth
          />
          <TextField
            label="Localização opcional"
            value={form.currentLocation}
            onChange={(event) =>
              onChange("currentLocation", event.target.value)
            }
            fullWidth
          />
          <TextField
            label="Quantidade"
            value={form.quantity}
            onChange={(event) => onChange("quantity", event.target.value)}
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
              Salvar produto
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Dialog>
  );
};
