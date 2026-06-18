import { Box, Card, Stack } from "@mui/material";

export const CurrentPickingItemCard = ({ item }) => (
  <Card elevation={0} sx={{ p: 2.5, border: "2px solid", borderColor: "primary.main" }}>
    <Stack spacing={1}>
      <Box sx={{ fontSize: "1.3rem", fontWeight: 700 }}>{item.productName}</Box>
      <Box><strong>Pedido:</strong> {item.orderId} · <strong>Marketplace:</strong> {item.marketplace}</Box>
      <Box><strong>SKU:</strong> {item.sku} · <strong>EAN:</strong> {item.ean}</Box>
      <Box><strong>Local esperado:</strong> {item.locationCode}</Box>
      <Box>
        <strong>Necessário:</strong> {item.requiredQty} · <strong>Separado:</strong> {item.pickedQty} · <strong>Faltante:</strong> {item.missingQty}
      </Box>
    </Stack>
  </Card>
);
