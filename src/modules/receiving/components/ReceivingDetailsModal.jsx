import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { ReceivingStatusChip } from "./ReceivingStatusChip";
import { ReceivingItemsTable } from "./ReceivingItemsTable";

const formatDate = (value) =>
  new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));

const getNoteDate = (note) => note.issuedAt || note.emittedAt || note.createdAt;

export const ReceivingDetailsModal = ({ open, note, onClose }) => {
  const hasConferenceData = note?.items?.some(
    (item) => item.expectedQty !== undefined || item.issuedQty !== undefined,
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Detalhes da nota</DialogTitle>
      <DialogContent>
        {note && (
          <Box sx={{ mt: 1 }}>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}>
              <Box>
                <strong>Previsão:</strong> {note.key}
              </Box>
              {note.nfeNumber && (
                <Box>
                  <strong>Número da nota:</strong> {note.nfeNumber}
                </Box>
              )}
              <Box>
                <strong>Emissão:</strong> {formatDate(getNoteDate(note))}
              </Box>
              <Box>
                <strong>Status:</strong>{" "}
                <ReceivingStatusChip status={note.status} />
              </Box>
              <Box>
                <strong>Observação:</strong> {note.observation || "-"}
              </Box>
            </Box>

            <ReceivingItemsTable
              items={note.items}
              mode={hasConferenceData ? "conference" : "manual"}
            />
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fechar</Button>
      </DialogActions>
    </Dialog>
  );
};
