import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import { ReceivingItemsTable } from "./ReceivingItemsTable";
import { receivingProblemStatusOptions } from "../../../shared/utils/statusCatalog";

const getInitialForm = (note) => {
  const noteHasProblem =
    note?.status === "incompleta" || note?.status === "divergente";

  return {
    hasProblem: noteHasProblem ? "sim" : "nao",
    observation: note?.observation || "",
    status: noteHasProblem ? note.status : "incompleta",
  };
};

const FinishReceivingContent = ({ note, onClose, onConfirm }) => {
  const [form, setForm] = useState(() => getInitialForm(note));
  const { hasProblem, observation, status } = form;

  const totals = useMemo(() => ({
    skus: note.items.length,
    units: note.items.reduce(
      (sum, item) => sum + Number(item.quantity || 0),
      0,
    ),
  }), [note]);

  const updateForm = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleConfirm = () => {
    onConfirm({
      status: hasProblem === "sim" ? status : "completa",
      observation: hasProblem === "sim" ? observation : "",
    });
  };

  return (
    <>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <ReceivingItemsTable
            items={note.items}
            onEditItem={() => {}}
            onRemoveItem={() => {}}
          />

          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2 }}>
            <Box>
              <strong>Total de SKUs:</strong> {totals.skus}
            </Box>
            <Box>
              <strong>Total de unidades:</strong> {totals.units}
            </Box>
            <Box>
              <strong>Data/hora:</strong> {new Date().toLocaleString("pt-BR")}
            </Box>
          </Box>

          <Stack spacing={1}>
            <Box sx={{ fontWeight: 600 }}>
              Houve algum problema com essa nota?
            </Box>
            <Select
              value={hasProblem}
              onChange={(event) => updateForm("hasProblem", event.target.value)}
              fullWidth
            >
              <MenuItem value="nao">Não</MenuItem>
              <MenuItem value="sim">Sim</MenuItem>
            </Select>
          </Stack>

          {hasProblem === "sim" && (
            <Stack spacing={2}>
              <TextField
                label="Observação"
                value={observation}
                onChange={(event) => updateForm("observation", event.target.value)}
                fullWidth
                multiline
                minRows={3}
              />
              <Select
                value={status}
                onChange={(event) => updateForm("status", event.target.value)}
                fullWidth
              >
                {receivingProblemStatusOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </Stack>
          )}

          {hasProblem === "nao" && (
            <Alert severity="info">O status final será completa.</Alert>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button variant="contained" onClick={handleConfirm}>
          Confirmar
        </Button>
      </DialogActions>
    </>
  );
};

export const FinishReceivingDialog = ({ open, note, onClose, onConfirm }) => (
  <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
    <DialogTitle>Finalizar recebimento</DialogTitle>
    {note && (
      <FinishReceivingContent
        key={`${note.id}-${open}`}
        note={note}
        onClose={onClose}
        onConfirm={onConfirm}
      />
    )}
  </Dialog>
);
