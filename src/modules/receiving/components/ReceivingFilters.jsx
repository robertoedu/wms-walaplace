import { Box, Button, MenuItem, Stack, TextField } from "@mui/material";
import { receivingStatusFilterOptions } from "../../../shared/utils/statusCatalog";

const DateFilterField = ({ label, value, onChange }) => (
  <Stack spacing={0.75}>
    <Box sx={{ color: "text.secondary", fontSize: "0.8rem", fontWeight: 600 }}>
      {label}
    </Box>
    <TextField
      type="date"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      fullWidth
    />
  </Stack>
);

export const ReceivingFilters = ({
  search,
  status,
  dateStart,
  dateEnd,
  onSearchChange,
  onStatusChange,
  onDateStartChange,
  onDateEndChange,
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
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, minmax(0, 1fr))",
            xl: "minmax(260px, 1fr) minmax(190px, 220px) repeat(2, minmax(170px, 190px)) auto",
          },
          gap: 2,
          alignItems: "end",
        }}
      >
        <TextField
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          label="Busca livre"
          placeholder="Nota, produto, SKU ou EAN"
          fullWidth
        />

        <TextField
          select
          label="Status"
          value={status}
          onChange={(event) => onStatusChange(event.target.value)}
          fullWidth
        >
          {receivingStatusFilterOptions.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>

        <DateFilterField
          label="Emissão inicial"
          value={dateStart}
          onChange={onDateStartChange}
        />

        <DateFilterField
          label="Emissão final"
          value={dateEnd}
          onChange={onDateEndChange}
        />

        <Stack
          direction="row"
          spacing={1}
          sx={{
            gridColumn: { xs: "1", sm: "1 / -1", xl: "auto" },
            justifySelf: { xs: "stretch", xl: "end" },
            minWidth: 0,
            "& .MuiButton-root": {
              whiteSpace: "nowrap",
            },
          }}
        >
          <Button
            variant="outlined"
            size="large"
            onClick={onRefresh}
            sx={{
              minWidth: { xs: 0, xl: 140 },
              flex: { xs: 1, xl: "none" },
            }}
          >
            Atualizar
          </Button>
          <Button
            variant="contained"
            size="large"
            onClick={onAddNote}
            sx={{
              minWidth: { xs: 0, xl: 160 },
              flex: { xs: 1, xl: "none" },
            }}
          >
            Adicionar nota
          </Button>
        </Stack>
      </Box>
    </Box>
  );
};
