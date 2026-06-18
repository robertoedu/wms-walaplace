import { Box, Card, LinearProgress, Stack } from "@mui/material";

export const SelectedLocationCard = ({ location }) => {
  if (!location) {
    return <Card elevation={0} sx={{ border: "1px dashed", borderColor: "divider", p: 2.2, borderRadius: 2 }}>
      <Box sx={{ color: "text.secondary" }}>Nenhum local selecionado. Bipe um endereço válido.</Box>
    </Card>;
  }
  const occupancy = Math.min(100, (location.occupied / location.capacity) * 100);
  const available = Math.max(0, location.capacity - location.occupied);
  return (
    <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", p: 2.2, borderRadius: 2 }}>
      <Stack spacing={1}>
        <Box sx={{ fontWeight: 700 }}>Local selecionado</Box>
        <Box><strong>Código:</strong> {location.code}</Box>
        <Box><strong>Nome:</strong> {location.description}</Box>
        {location.zone && <Box><strong>Zona:</strong> {location.zone}</Box>}
        <Box><strong>Ocupação:</strong> {location.occupied} / {location.capacity}</Box>
        <Box><strong>Disponível:</strong> {available}</Box>
        <LinearProgress variant="determinate" value={occupancy} sx={{ height: 10, borderRadius: 999 }} />
      </Stack>
    </Card>
  );
};
