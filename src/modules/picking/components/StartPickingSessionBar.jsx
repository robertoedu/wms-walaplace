import { Box, Button, Paper, Stack } from "@mui/material";

export const StartPickingSessionBar = ({ items, onStart }) => {
  const orders = new Set(items.map((item) => item.orderId)).size;
  const units = items.reduce(
    (sum, item) => sum + (item.requiredQty - item.pickedQty),
    0,
  );

  if (!items.length) return null;

  return (
    <Paper
      elevation={6}
      sx={{
        position: "sticky",
        bottom: 12,
        zIndex: 10,
        p: 2,
        border: "1px solid",
        borderColor: "primary.main",
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        spacing={2}
        flexWrap="wrap"
      >
        <Box>
          <strong>{items.length}</strong> itens · <strong>{units}</strong> unidades ·{" "}
          <strong>{orders}</strong> pedidos
        </Box>
        <Button variant="contained" size="large" onClick={onStart}>
          Iniciar separação
        </Button>
      </Stack>
    </Paper>
  );
};
