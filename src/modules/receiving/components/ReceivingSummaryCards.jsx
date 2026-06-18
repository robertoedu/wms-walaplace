import { Box, Card, Stack } from "@mui/material";

const summaryStyle = {
  flex: "1 1 220px",
  minWidth: 220,
  p: 2.5,
  borderRadius: 2,
  border: "1px solid",
  borderColor: "divider",
  bgcolor: "white",
};

export const ReceivingSummaryCards = ({ summary }) => {
  const cards = [
    { label: "Notas cadastradas", value: summary.notasCadastradas },
    { label: "Recebidas hoje", value: summary.recebidasHoje },
    { label: "Notas completas", value: summary.notasCompletas },
    { label: "Notas com problema", value: summary.notasComProblema },
  ];

  return (
    <Stack direction="row" spacing={2} useFlexGap flexWrap="wrap">
      {cards.map((card) => (
        <Card key={card.label} sx={summaryStyle} elevation={0}>
          <Box sx={{ fontSize: "0.9rem", color: "text.secondary", mb: 1 }}>
            {card.label}
          </Box>
          <Box
            sx={{ fontSize: "2rem", fontWeight: "bold", color: "primary.main" }}
          >
            {card.value}
          </Box>
        </Card>
      ))}
    </Stack>
  );
};
