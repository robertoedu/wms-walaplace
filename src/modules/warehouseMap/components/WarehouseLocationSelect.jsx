import { Box, Select } from "@mui/material";

export const WarehouseLocationSelect = ({ value, locations, usedLocationCodes, currentElementId, onChange }) => (
  <Box>
    <Box sx={{ mb: 0.75, color: "#334155", fontSize: 13, fontWeight: 800 }}>Local cadastrado</Box>
    <Select native fullWidth value={value || ""} onChange={(event) => onChange(event.target.value)}>
      <option value="">Selecione um local</option>
      {locations.map((location) => {
        const usedBy = usedLocationCodes.get(location.code);
        const disabled = usedBy && usedBy !== currentElementId;
        return (
          <option key={location.code} value={location.code} disabled={disabled}>
            {location.code} - {location.description}{disabled ? " (ja usado)" : ""}
          </option>
        );
      })}
    </Select>
  </Box>
);
