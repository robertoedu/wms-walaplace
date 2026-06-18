import { Box, Stack, TextField } from "@mui/material";

export const LocationScanInput = ({
  locationCode, quantity, onLocationChange, onQuantityChange, onConfirm,
  maxQuantity, locationRef,
}) => (
  <Stack spacing={2.2}>
    <Box>
      <Box sx={{ fontSize: "0.95rem", color: "text.secondary", mb: 1 }}>Bipe o local/endereço</Box>
      <TextField
        inputRef={locationRef}
        value={locationCode}
        onChange={(event) => onLocationChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") { event.preventDefault(); onConfirm(); }
        }}
        fullWidth
        autoComplete="off"
        label="Local"
        placeholder="Bipe o código do local"
        inputProps={{ style: { fontSize: "1.15rem", padding: "18px" } }}
      />
    </Box>
    <Box>
      <Box sx={{ fontSize: "0.95rem", color: "text.secondary", mb: 1 }}>Quantidade</Box>
      <TextField value={quantity} onChange={(event) => onQuantityChange(event.target.value)}
        fullWidth type="number" inputProps={{ min: 1, max: maxQuantity, step: 1 }} label="Quantidade" />
    </Box>
  </Stack>
);
