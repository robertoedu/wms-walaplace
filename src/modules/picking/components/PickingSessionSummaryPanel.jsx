import { Box, Paper, Stack } from "@mui/material";

export const PickingSessionSummaryPanel = ({ items }) => {
  const complete = items.filter((item) => item.pickedQty === item.requiredQty).length;
  const partial = items.filter(
    (item) => item.pickedQty > 0 && item.pickedQty < item.requiredQty,
  ).length;
  const none = items.filter((item) => item.pickedQty === 0).length;
  const picked = items.reduce((sum, item) => sum + item.pickedQty, 0);
  const missing = items.reduce((sum, item) => sum + item.missingQty, 0);

  return (
    <Paper
      elevation={0}
      sx={{ p: 2, border: "1px solid", borderColor: "divider" }}
    >
      <Stack direction="row" spacing={2} useFlexGap flexWrap="wrap">
        {[
          ["Completos", complete],
          ["Parciais", partial],
          ["Não separados", none],
          ["Total separado", picked],
          ["Total faltante", missing],
        ].map(([label, value]) => (
          <Box key={label} sx={{ minWidth: 110 }}>
            <Box color="text.secondary" fontSize=".8rem">{label}</Box>
            <Box fontSize="1.4rem" fontWeight={700}>{value}</Box>
          </Box>
        ))}
      </Stack>
    </Paper>
  );
};
