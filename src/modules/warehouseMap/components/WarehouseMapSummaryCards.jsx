import { Paper, Stack, Typography } from "@mui/material";

export const WarehouseMapSummaryCards = ({ summary }) => (
  <Stack direction="row" spacing={2} useFlexGap flexWrap="wrap">
    {[
      ["Total de locais", summary.totalLocations, "primary"],
      ["Locais ocupados", summary.occupiedLocations, "success"],
      ["Locais livres", summary.freeLocations, "info"],
      ["Ruas cadastradas", summary.aisles, "warning"],
    ].map(([label, value, color]) => (
      <Paper key={label} elevation={0} sx={{ flex: "1 1 190px", p: 2.2, border: "1px solid", borderColor: "divider", borderRadius: 3 }}>
        <Typography variant="body2" color="text.secondary" fontWeight={700}>{label}</Typography>
        <Typography variant="h4" fontWeight={850} color={`${color}.main`}>{value}</Typography>
      </Paper>
    ))}
  </Stack>
);

