import { useEffect, useState } from "react";
import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, MenuItem, Stack, Switch, TextField } from "@mui/material";

const emptyForm = { marketplace: "Mercado Livre", cutoffTime: "12:00", effectiveFrom: "", effectiveTo: "", active: true, observation: "" };

export const CutoffTimeDialog = ({ open, rule, onClose, onSave }) => {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setForm(rule ? { ...rule } : { ...emptyForm });
      setError("");
    }, 0);
    return () => clearTimeout(timer);
  }, [open, rule]);

  const change = (field) => (event) => {
    const value = field === "active" ? event.target.checked : event.target.value;
    setForm((current) => ({ ...current, [field]: value }));
  };
  const submit = () => {
    try {
      onSave(form);
    } catch (saveError) {
      setError(saveError.message);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{rule ? "Editar horário de corte" : "Novo horário de corte"}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField select label="Marketplace" value={form.marketplace} onChange={change("marketplace")} required>
            <MenuItem value="Mercado Livre">Mercado Livre</MenuItem>
            <MenuItem value="Shopee">Shopee</MenuItem>
          </TextField>
          <TextField label="Horário de corte" type="time" value={form.cutoffTime} onChange={change("cutoffTime")} required slotProps={{ inputLabel: { shrink: true } }} />
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField fullWidth label="Início da vigência" type="date" value={form.effectiveFrom} onChange={change("effectiveFrom")} required slotProps={{ inputLabel: { shrink: true } }} />
            <TextField fullWidth label="Fim da vigência" type="date" value={form.effectiveTo} onChange={change("effectiveTo")} helperText="Opcional" slotProps={{ inputLabel: { shrink: true } }} />
          </Stack>
          <TextField label="Observação operacional" value={form.observation} onChange={change("observation")} multiline minRows={2} />
          <FormControlLabel control={<Switch checked={form.active} onChange={change("active")} />} label="Regra ativa" />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={submit}>Salvar horário</Button>
      </DialogActions>
    </Dialog>
  );
};

