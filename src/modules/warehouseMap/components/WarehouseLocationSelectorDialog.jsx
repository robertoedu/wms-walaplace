import { Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, TextField } from "@mui/material";

export const WarehouseLocationSelectorDialog = ({ open, value, locations, onChange, onClose }) => (
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
    <DialogTitle>Selecionar local cadastrado</DialogTitle>
    <DialogContent sx={{ pt: 2 }}>
      <TextField select fullWidth label="Local" value={value || ""} onChange={(event) => onChange(event.target.value)}>
        <MenuItem value="">Sem vínculo</MenuItem>
        {locations.map((location) => <MenuItem key={location.code} value={location.code}>{location.code} - {location.description}</MenuItem>)}
      </TextField>
    </DialogContent>
    <DialogActions><Button onClick={onClose}>Fechar</Button></DialogActions>
  </Dialog>
);

