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
      Digite o número da nota
    </Box>
    <TextField
      inputRef={inputRef}
      value={value}
      onChange={(event) => onChange(event.target.value.replace(/\D/g, "").slice(0, 9))}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          onSubmit?.();
        }
      }}
      fullWidth
      autoComplete="off"
      placeholder="Ex: 123456789"
      label={title || "Número da nota"}
      disabled={disabled}
      slotProps={{
        htmlInput: {
          inputMode: "numeric",
          maxLength: 9,
          style: { fontSize: "1.1rem", padding: "17px" },
        },
      }}
    />
  </Box>
);
