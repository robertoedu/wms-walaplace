import { Box, Paper, Stack, TextField } from "@mui/material";

export const StockFilters = ({ search, onSearchChange }) => {
  return (
    <Paper
      elevation={0}
      sx={{ border: "1px solid", borderColor: "divider", p: 2 }}
    >
      <Stack spacing={1}>
        <Box sx={{ fontWeight: 700 }}>Busca livre</Box>
        <TextField
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          fullWidth
          placeholder="Buscar por descrição, SKU, EAN, localização, quantidade ou outro campo"
        />
      </Stack>
    </Paper>
  );
};
