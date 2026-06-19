import { Box, Card, Stack } from "@mui/material";

const cardSx = {
  flex: "1 1 220px",
  minWidth: 220,
  p: 2.5,
  borderRadius: 2,
  border: "1px solid",
  borderColor: "divider",
  bgcolor: "white",
};

export const StockSummaryCards = ({ summary }) => {
  const cards = [
    { label: "Total de produtos", value: summary.totalProducts },
    { label: "Quantidade total em estoque", value: summary.totalQuantity },
    { label: "Quantidade em transferencia", value: summary.transferPendingQuantity || 0 },
    { label: "Produtos com baixo estoque", value: summary.lowStock },
  ];

  return (
    <Stack direction="row" spacing={2} useFlexGap flexWrap="wrap">
      {cards.map((card) => (
        <Card key={card.label} sx={cardSx} elevation={0}>
          <Box sx={{ color: "text.secondary", fontSize: "0.9rem", mb: 1 }}>
            {card.label}
          </Box>
          <Box
            sx={{ fontSize: "2rem", fontWeight: 700, color: "primary.main" }}
          >
            {card.value}
          </Box>
        </Card>
      ))}
    </Stack>
  );
};
