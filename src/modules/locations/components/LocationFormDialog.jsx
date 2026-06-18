import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Paper,
  Select,
  Stack,
  TextField,
} from "@mui/material";

const emptyForm = {
  code: "",
  description: "",
  capacity: "",
  zone: "",
  aisle: "",
  side: "",
  position: "",
  pickingSequence: "",
  isSubLocation: false,
  parentLocationCode: "",
};

export const LocationFormDialog = ({ open, location, locations = [], onClose, onSave }) => {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [routeHelpOpen, setRouteHelpOpen] = useState(false);

  const parentOptions = useMemo(
    () => locations.filter((current) => !current.isSubLocation && current.id !== location?.id),
    [location?.id, locations],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setForm(
        location
          ? {
              ...location,
              capacity: location.capacity === null || location.capacity === undefined ? "" : String(location.capacity),
              zone: location.zone || "",
              aisle: location.aisle || "",
              side: location.side || "",
              position: location.position === null || location.position === undefined ? "" : String(location.position),
              pickingSequence: location.pickingSequence === null || location.pickingSequence === undefined ? "" : String(location.pickingSequence),
              isSubLocation: Boolean(location.isSubLocation),
              parentLocationCode: location.parentLocationCode || "",
            }
          : { ...emptyForm },
      );
      setError("");
    }, 0);
    return () => clearTimeout(timer);
  }, [open, location]);

  const change = (field) => (event) => setForm((current) => ({ ...current, [field]: event.target.value }));

  const changeIsSubLocation = (event) => {
    const checked = event.target.checked;
    setForm((current) => ({
      ...current,
      isSubLocation: checked,
      parentLocationCode: checked ? current.parentLocationCode : "",
    }));
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
      <DialogTitle>{location ? "Editar local" : "Cadastrar local"}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          {error && <Alert severity="error">{error}</Alert>}
          <TextField
            label="Codigo do local"
            value={form.code}
            onChange={change("code")}
            disabled={Boolean(location)}
            required
            autoFocus={!location}
            helperText={location ? "O codigo nao pode ser alterado porque identifica o local nas operacoes." : "Codigo que sera digitado ou bipado nas operacoes."}
          />
          <TextField
            label="Descricao fisica do local"
            value={form.description}
            onChange={change("description")}
            required
            multiline
            minRows={3}
            placeholder="Ex.: Prateleira 10, segundo andar, lado direito do corredor"
          />
          <TextField
            label="Quantidade maxima de itens"
            value={form.capacity}
            onChange={change("capacity")}
            type="number"
            slotProps={{ htmlInput: { min: 1, step: 1 } }}
            helperText={
              form.isSubLocation
                ? "Opcional. Se informada, nao pode ultrapassar a capacidade disponivel do local principal."
                : "Opcional. Deixe em branco se ainda nao houver limite definido."
            }
          />

          <Paper elevation={0} sx={{ p: 2, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
            <Stack spacing={1.5}>
              <Box>
                <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                  <Box sx={{ fontWeight: 800 }}>Dados para rota de separacao</Box>
                  <Button
                    variant="outlined"
                    onClick={() => setRouteHelpOpen(true)}
                    aria-label="Explicar dados para rota de separacao"
                    sx={{ minWidth: 30, width: 30, height: 30, px: 0, fontSize: 16, fontWeight: 900, borderRadius: 1.5 }}
                  >
                    ?
                  </Button>
                </Stack>
                <Box sx={{ color: "text.secondary", fontSize: 13 }}>
                  Esses campos permitem ordenar a separacao por caminho fisico, sem depender do mapa do galpao.
                </Box>
              </Box>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                <TextField fullWidth label="Zona" value={form.zone} onChange={change("zone")} placeholder="Ex.: Alto Giro" />
                <TextField fullWidth label="Rua / corredor" value={form.aisle} onChange={change("aisle")} placeholder="Ex.: Rua A" />
              </Stack>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                <TextField fullWidth label="Lado" value={form.side} onChange={change("side")} placeholder="Ex.: Direito" />
                <TextField fullWidth label="Posicao" type="number" value={form.position} onChange={change("position")} />
              </Stack>
              <TextField
                label="Sequencia de separacao"
                type="number"
                value={form.pickingSequence}
                onChange={change("pickingSequence")}
                helperText="Numero menor aparece antes na separacao."
              />
            </Stack>
          </Paper>

          <Paper elevation={0} sx={{ p: 2, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
            <Stack spacing={1.5}>
              <FormControlLabel
                control={<Checkbox checked={Boolean(form.isSubLocation)} onChange={changeIsSubLocation} />}
                label="Este local e sublocal de outro local"
              />
              <Box sx={{ color: "text.secondary", fontSize: 13 }}>
                Use sublocal quando uma posicao fisica pertence a um local principal ja cadastrado.
              </Box>

              {form.isSubLocation && (
                <Box>
                  <Box sx={{ mb: 0.75, color: "text.secondary", fontSize: 13, fontWeight: 700 }}>
                    Local principal
                  </Box>
                  <Select native fullWidth value={form.parentLocationCode} onChange={change("parentLocationCode")}>
                    <option value="">Selecione o local principal</option>
                    {parentOptions.map((parent) => (
                      <option key={parent.id} value={parent.code}>
                        {parent.code} - {parent.description}
                      </option>
                    ))}
                  </Select>
                </Box>
              )}
            </Stack>
          </Paper>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={submit}>Salvar local</Button>
      </DialogActions>

      <Dialog open={routeHelpOpen} onClose={() => setRouteHelpOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Dados para rota de separacao</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ mt: 1 }}>
            <Box>
              Esses campos ajudam o sistema a montar uma ordem de separacao mais logica, evitando que o operador fique indo e voltando no estoque.
            </Box>
            <Box>
              <strong>Zona:</strong> area maior do estoque. Ex.: Alto Giro, Volumosos, Fragil.
            </Box>
            <Box>
              <strong>Rua / corredor:</strong> caminho onde o local fica. Ex.: Rua A, Rua B.
            </Box>
            <Box>
              <strong>Lado:</strong> lado da rua. Ex.: Direito ou Esquerdo.
            </Box>
            <Box>
              <strong>Posicao:</strong> onde o local fica dentro da rua. Ex.: posicao 1, 2, 3.
            </Box>
            <Box>
              <strong>Sequencia:</strong> ordem em que o operador deve passar. Numero menor vem primeiro.
            </Box>
            <Paper elevation={0} sx={{ p: 1.5, bgcolor: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 2 }}>
              Exemplo: entrada do corredor = sequencia 10, meio = 20, final = 30.
            </Paper>
            <Box color="text.secondary">
              Quanto melhor esses dados estiverem preenchidos, melhor o sistema consegue sugerir a rota de separacao.
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={() => setRouteHelpOpen(false)}>Entendi</Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};
