import { Box, Paper, Stack } from "@mui/material";

export const PickingSummaryCards = ({ summary }) => {
  const cards = [
    ["Pendentes", summary.pending],
    ["Em separação", summary.active],
    ["Faltou item", summary.missing],
    ["Aguardando embalamento", summary.packaging],
    ["Separados hoje", summary.today],
  ];

  return (
    <Stack direction="row" spacing={2} useFlexGap flexWrap="wrap">
      {cards.map(([label, value]) => (
        <Paper
          key={label}
          elevation={0}
          sx={{
            flex: "1 1 170px",
            p: 2.2,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Box color="text.secondary">{label}</Box>
          <Box sx={{ fontSize: "1.8rem", fontWeight: 700, color: "primary.main" }}>
            {value}
          </Box>
        </Paper>
      ))}
    </Stack>
  );
};
