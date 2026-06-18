import { Box, Button, MenuItem, Stack, TextField } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { addressingStatusFilterOptions } from "../../../shared/utils/statusCatalog";

export const AddressingFilters = ({
  search, status, period, onSearchChange, onStatusChange, onPeriodChange,
  onRefresh, onManualAddress,
}) => (
  <Box sx={{ p: 2.5, border: "1px solid", borderColor: "divider", borderRadius: 2, bgcolor: "white" }}>
    <Stack spacing={2}>
      <Stack direction="row" spacing={1.5} justifyContent="flex-end" flexWrap="wrap">
        <Button variant="outlined" startIcon={<RefreshIcon />} onClick={onRefresh}>Atualizar</Button>
        <Button variant="contained" onClick={onManualAddress}>Endereçar manualmente</Button>
      </Stack>
      <Stack direction="row" spacing={2} useFlexGap flexWrap="wrap">
        <TextField value={search} onChange={(e) => onSearchChange(e.target.value)} label="Busca"
          placeholder="SKU, EAN, produto, NF ou ordem" sx={{ flex: "1 1 360px" }} />
        <TextField select label="Status" value={status} onChange={(e) => onStatusChange(e.target.value)} sx={{ minWidth: 230 }}>
          {addressingStatusFilterOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
          ))}
        </TextField>
        <TextField select label="Período" value={period} onChange={(e) => onPeriodChange(e.target.value)} sx={{ minWidth: 160 }}>
          <MenuItem value="today">Hoje</MenuItem>
          <MenuItem value="week">7 dias</MenuItem>
          <MenuItem value="all">Todos</MenuItem>
        </TextField>
      </Stack>
    </Stack>
  </Box>
);
