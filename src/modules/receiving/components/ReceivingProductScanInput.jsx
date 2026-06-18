import { Box, Button, Stack, TextField } from "@mui/material";

export const ReceivingProductScanInput = ({
  value,
  onChange,
  inputRef,
  showCreateButton = false,
  onCreateProduct,
  onSubmit,
}) => (
  <Box>
    <Box sx={{ fontSize: "0.9rem", color: "text.secondary", mb: 1 }}>
      Bipe o produto
    </Box>
    <Stack direction="row" spacing={1} alignItems="stretch">
      <TextField
        inputRef={inputRef}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            onSubmit?.();
          }
        }}
        fullWidth
        autoComplete="off"
        placeholder="Bipe ou digite o código do produto"
        inputProps={{ style: { fontSize: "1.1rem", padding: "17px" } }}
      />
      {showCreateButton && (
        <Button variant="contained" onClick={onCreateProduct} sx={{ minWidth: 56, fontSize: "1.5rem" }}>
          +
        </Button>
      )}
    </Stack>
  </Box>
);
