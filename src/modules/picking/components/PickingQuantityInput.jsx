import { TextField } from "@mui/material";

export const PickingQuantityInput = ({ value, onChange, max }) => (
  <TextField
    fullWidth
    type="number"
    label="3. Quantidade retirada"
    value={value}
    onChange={(event) => onChange(event.target.value)}
    inputProps={{ min: 1, max, step: 1 }}
  />
);
