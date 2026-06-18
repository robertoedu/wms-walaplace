import { Box, Card, Stack } from "@mui/material";

const cardSx = { flex: "1 1 220px", minWidth: 220, p: 2.5, borderRadius: 2, border: "1px solid", borderColor: "divider" };

export const AddressingSummaryCards = ({ summary }) => {
  const cards = [
    { label: "Aguardando endereçamento", value: summary.aguardando },
    { label: "Endereçados parcialmente", value: summary.parcial },
    { label: "Endereçados hoje", value: summary.enderecadosHoje },
    { label: "Com problema no recebimento", value: summary.comProblema },
  ];
  return (
    <Stack direction="row" spacing={2} useFlexGap flexWrap="wrap">
      {cards.map((card) => (
        <Card key={card.label} sx={cardSx} elevation={0}>
          <Box sx={{ color: "text.secondary", fontSize: "0.9rem", mb: 1 }}>{card.label}</Box>
          <Box sx={{ fontSize: "2rem", fontWeight: 700, color: "primary.main" }}>{card.value}</Box>
        </Card>
      ))}
    </Stack>
  );
};
