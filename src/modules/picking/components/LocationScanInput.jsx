import { TextField } from "@mui/material";

export const LocationScanInput = ({ value, onChange, inputRef, onSubmit }) => (
  <TextField
    inputRef={inputRef}
    fullWidth
    label="1. Bipe o local"
    value={value}
    onChange={(event) => onChange(event.target.value)}
    onKeyDown={(event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        onSubmit?.();
      }
    }}
    autoComplete="off"
    inputProps={{ style: { fontSize: "1.15rem", padding: "18px" } }}
  />
);
