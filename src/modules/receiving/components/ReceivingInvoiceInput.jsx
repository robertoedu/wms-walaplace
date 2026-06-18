import { Box, TextField } from "@mui/material";

export const ReceivingInvoiceInput = ({
  value,
  onChange,
  inputRef,
  title,
  disabled = false,
  onSubmit,
}) => (
  <Box>
    <Box sx={{ fontSize: "0.9rem", color: "text.secondary", mb: 1 }}>
      Bipe a chave da nota
    </Box>
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
      placeholder="Bipe ou digite a chave da nota"
      label={title || "Chave da nota"}
      disabled={disabled}
      inputProps={{ style: { fontSize: "1.1rem", padding: "17px" } }}
    />
  </Box>
);
