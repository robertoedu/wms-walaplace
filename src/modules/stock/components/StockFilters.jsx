import { Box, MenuItem, Paper, Stack, TextField } from "@mui/material";
import { WAREHOUSES } from "../../../shared/utils/warehouseCatalog";

export const StockFilters = ({
  search,
  warehouseId,
  onSearchChange,
  onWarehouseChange,
}) => {
  return (
    <Paper
      elevation={0}
      sx={{ border: "1px solid", borderColor: "divider", p: 2 }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        alignItems={{ xs: "stretch", md: "flex-end" }}
      >
        <Stack spacing={1} sx={{ flex: 1 }}>
          <Box sx={{ fontWeight: 700 }}>Busca livre</Box>
          <TextField
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            fullWidth
            placeholder="Buscar por descricao, SKU, EAN, localizacao, quantidade ou outro campo"
          />
        </Stack>

        <Stack spacing={1} sx={{ width: { xs: "100%", md: 280 } }}>
          <Box sx={{ fontWeight: 700 }}>Estoque</Box>
          <TextField
            select
            value={warehouseId}
            onChange={(event) => onWarehouseChange(event.target.value)}
            fullWidth
          >
            <MenuItem value="all">Todos os estoques</MenuItem>
            {WAREHOUSES.map((warehouse) => (
              <MenuItem key={warehouse.id} value={warehouse.id}>
                {warehouse.label}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </Stack>
    </Paper>
  );
};
