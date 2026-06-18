import { Button, MenuItem, Paper, Stack, TextField } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { pickingStatusFilterOptions } from "../../../shared/utils/statusCatalog";

export const PickingFilters = ({
  search,
  marketplace,
  status,
  onSearch,
  onMarketplace,
  onStatus,
  onRefresh,
  mode,
}) => (
  <Paper elevation={0} sx={{ p: 2.5, border: "1px solid", borderColor: "divider" }}>
    <Stack direction="row" spacing={2} useFlexGap flexWrap="wrap">
      <TextField
        label="Busca"
        value={search}
        onChange={(event) => onSearch(event.target.value)}
        placeholder={mode === "items"
          ? "Pedido, SKU, EAN, produto, marketplace ou local"
          : "Pedido, marketplace, cliente ou transportadora"}
        sx={{ flex: "1 1 360px" }}
      />
      <TextField select label="Marketplace" value={marketplace}
        onChange={(event) => onMarketplace(event.target.value)} sx={{ minWidth: 190 }}>
        {["Todos", "Mercado Livre", "Shopee", "Amazon", "Site", "Manual"].map(
          (value) => <MenuItem key={value} value={value}>{value}</MenuItem>,
        )}
      </TextField>
      <TextField select label="Status" value={status}
        onChange={(event) => onStatus(event.target.value)} sx={{ minWidth: 220 }}>
        {pickingStatusFilterOptions.map(({ value, label }) => (
          <MenuItem key={value} value={value}>{label}</MenuItem>
        ))}
      </TextField>
      <Button variant="outlined" startIcon={<RefreshIcon />} onClick={onRefresh}>
        Atualizar
      </Button>
    </Stack>
  </Paper>
);
