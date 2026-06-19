import { Box, Button, Paper, Stack, TextField, Typography } from "@mui/material";

const findMatches = (options, value) => {
  const term = String(value || "").trim().toLowerCase();
  if (!term) return [];

  return options
    .filter((product) =>
      [
        product.sku,
        product.description,
        ...(product.searchKeys || []),
      ]
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(term)),
    )
    .slice(0, 8);
};

export const ReceivingProductScanInput = ({
  value,
  options = [],
  selectedProduct = null,
  onChange,
  onSelectProduct,
  inputRef,
  showCreateButton = false,
  onCreateProduct,
  onSubmit,
}) => {
  const suggestions = selectedProduct ? [] : findMatches(options, value);

  return (
    <Box>
      <Box sx={{ fontSize: "0.9rem", color: "text.secondary", mb: 1 }}>
        Digite o nome ou o código SKU do produto
      </Box>
      <Box sx={{ position: "relative" }}>
        <Stack direction="row" spacing={1} alignItems="stretch">
          <TextField
            inputRef={inputRef}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={(event) => {
              if (event.key !== "Enter") return;

              event.preventDefault();
              if (selectedProduct) {
                onSubmit?.();
                return;
              }
              if (suggestions.length === 1) {
                onSelectProduct?.(suggestions[0]);
              }
            }}
            fullWidth
            autoComplete="off"
            placeholder="Nome do produto ou SKU"
            slotProps={{
              htmlInput: {
                style: { fontSize: "1.1rem", padding: "17px" },
              },
            }}
          />
          {showCreateButton && (
            <Button variant="contained" onClick={onCreateProduct} sx={{ minWidth: 56, fontSize: "1.5rem" }}>
              +
            </Button>
          )}
        </Stack>

        {suggestions.length > 0 && (
          <Paper
            elevation={4}
            sx={{
              position: "absolute",
              zIndex: 20,
              top: "calc(100% + 6px)",
              left: 0,
              right: showCreateButton ? 64 : 0,
              overflow: "hidden",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            {suggestions.map((product) => (
              <Box
                key={product.sku}
                onMouseDown={(event) => {
                  event.preventDefault();
                  onSelectProduct?.(product);
                }}
                sx={{
                  px: 2,
                  py: 1.25,
                  cursor: "pointer",
                  "&:hover": { bgcolor: "action.hover" },
                }}
              >
                <Typography fontWeight={700}>{product.description}</Typography>
                <Typography variant="body2" color="text.secondary">
                  SKU {product.sku}
                </Typography>
              </Box>
            ))}
          </Paper>
        )}
      </Box>
    </Box>
  );
};
