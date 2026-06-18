import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { ReceivingStatusChip } from "./ReceivingStatusChip";

const formatDate = (value) =>
  new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));

export const ReceivingDetailsModal = ({ open, note, onClose }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Detalhes da nota</DialogTitle>
      <DialogContent>
        {note && (
          <Box sx={{ mt: 1 }}>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mb: 2 }}>
              <Box>
                <strong>Chave:</strong> {note.key}
              </Box>
              <Box>
                <strong>Data:</strong> {formatDate(note.createdAt)}
              </Box>
              <Box>
                <strong>Status:</strong>{" "}
                <ReceivingStatusChip status={note.status} />
              </Box>
              <Box>
                <strong>Observação:</strong> {note.observation || "-"}
              </Box>
            </Box>

            <Paper
              elevation={0}
              sx={{
                border: "1px solid",
                borderColor: "divider",
                overflow: "hidden",
              }}
            >
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold" }}>SKU</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Produto</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>
                      Quantidade
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {note.items.map((item) => (
                    <TableRow key={`${item.sku}-${item.description}`}>
                      <TableCell>{item.sku}</TableCell>
                      <TableCell>{item.description}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Paper>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fechar</Button>
      </DialogActions>
    </Dialog>
  );
};
