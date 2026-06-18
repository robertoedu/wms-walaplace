import { Box, Button, MenuItem, Select, Stack, TextField } from "@mui/material";
import { receivingStatusFilterOptions } from "../../../shared/utils/statusCatalog";

export const ReceivingFilters = ({
  search,
  status,
  onSearchChange,
  onStatusChange,
  onRefresh,
  onAddNote,
}) => {
  return (
    <Box
      sx={{
        bgcolor: "white",
        p: 2.5,
        borderRadius: 2,
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Stack
        direction="row"
        spacing={2}
        useFlexGap
        flexWrap="wrap"
        alignItems="center"
      >
        <TextField
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          label="Busca livre"
          placeholder="Chave da nota, produto, SKU ou EAN"
          fullWidth
          sx={{ flex: "1 1 360px" }}
        />
        <Select
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          displayEmpty
          sx={{ minWidth: 180, flex: "0 0 220px" }}
        >
          {receivingStatusFilterOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
          ))}
        </Select>
        <Stack direction="row" spacing={1} sx={{ flex: "0 0 auto" }}>
          <Button
            variant="outlined"
            size="large"
            onClick={onRefresh}
            sx={{ minWidth: 140 }}
          >
            Atualizar
          </Button>
          <Button
            variant="contained"
            size="large"
            onClick={onAddNote}
            sx={{ minWidth: 160 }}
          >
            Adicionar nota
          </Button>
        </Stack>
      </Stack>
    </Box>
  );
};
