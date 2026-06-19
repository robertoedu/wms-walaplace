import { Box, TextField } from "@mui/material";

export const ReceivingQuantityInput = ({ value, onChange, inputRef, onSubmit }) => (
  <Box>
    <Box sx={{ fontSize: "0.9rem", color: "text.secondary", mb: 1 }}>Quantidade</Box>
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
      type="number"
      slotProps={{ htmlInput: { min: 1 } }}
      placeholder="Quantidade"
    />
  </Box>
);
