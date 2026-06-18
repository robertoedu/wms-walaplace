import { Box, Paper, Stack } from "@mui/material";

export const ReceivingReviewPanel = ({ product }) => {
  if (!product) {
    return (
      <Paper
        elevation={0}
        sx={{ border: "1px dashed", borderColor: "divider", p: 2.5 }}
      >
        <Box sx={{ color: "text.secondary" }}>
          Bipe um produto para visualizar os dados do item atual.
        </Box>
      </Paper>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        border: "1px solid",
        borderColor: "divider",
        p: 2.5,
        bgcolor: "rgba(255, 107, 53, 0.04)",
      }}
    >
      <Stack spacing={1}>
        <Box sx={{ fontSize: "0.9rem", color: "text.secondary" }}>Produto</Box>
        <Box sx={{ fontSize: "1.1rem", fontWeight: 700 }}>
          {product.description}
        </Box>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
          <Box>
            <strong>SKU:</strong> {product.sku}
          </Box>
          <Box>
            <strong>EAN:</strong> {product.ean}
          </Box>
        </Box>
      </Stack>
    </Paper>
  );
};
