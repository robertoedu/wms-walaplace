import { Box, Card, LinearProgress, Stack } from "@mui/material";

export const ProductPendingCard = ({ product }) => {
  const progress = product.receivedQty ? (product.addressedQty / product.receivedQty) * 100 : 0;
  return (
    <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", p: 2.5, borderRadius: 2 }}>
      <Stack spacing={1.2}>
        <Box sx={{ fontSize: "1.15rem", fontWeight: 700 }}>{product.productName}</Box>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
          <Box><strong>SKU:</strong> {product.sku}</Box>
          <Box><strong>EAN:</strong> {product.ean}</Box>
        </Box>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
          <Box><strong>Quantidade recebida:</strong> {product.receivedQty}</Box>
          <Box><strong>Quantidade endereçada:</strong> {product.addressedQty}</Box>
          <Box><strong>Quantidade pendente:</strong> {product.pendingQty}</Box>
        </Box>
        <Box>
          <Box sx={{ fontSize: "0.9rem", color: "text.secondary", mb: 0.6 }}>Progresso de endereçamento</Box>
          <LinearProgress variant="determinate" value={Math.min(100, progress)} sx={{ height: 10, borderRadius: 999 }} />
        </Box>
      </Stack>
    </Card>
  );
};
