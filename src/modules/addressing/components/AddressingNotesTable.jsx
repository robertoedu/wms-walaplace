import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
} from "@mui/material";
import { useState } from "react";
import { ReceivingStatusChip } from "../../receiving/components/ReceivingStatusChip";
import { StockStatusChip } from "./StockStatusChip";
import { getWarehouseLabel } from "../../../shared/utils/warehouseCatalog";

const formatDate = (value) =>
  new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));

export const AddressingNotesTable = ({
  notes,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  onAddressNote,
}) => {
  const [openedNote, setOpenedNote] = useState(null);
  const [noteOpen, setNoteOpen] = useState(false);
  const safePage = Math.min(page, Math.max(0, Math.ceil(notes.length / rowsPerPage) - 1));
  const visibleNotes = notes.slice(safePage * rowsPerPage, safePage * rowsPerPage + rowsPerPage);
  const pendingIds = openedNote?.items
    .filter((item) => item.pendingQty > 0 && !item.addressingBlocked)
    .map((item) => item.id) || [];

  const warehouseLabel = (row) => row.warehouseName || getWarehouseLabel(row.warehouseId);

  return (
    <>
      <Paper elevation={0} sx={{ border: "1px solid", borderColor: "divider", overflow: "auto" }}>
        <Table sx={{ minWidth: 1160 }}>
          <TableHead>
            <TableRow>
              {["Nota/Ordem", "Fornecedor", "Estoque", "SKUs", "Recebido", "Endereçado", "Pendente", "Endereçamento", "Recebimento", "Data", "Ações"].map((label) => (
                <TableCell key={label} sx={{ fontWeight: 700 }}>{label}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {visibleNotes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11}>
                  <Box sx={{ py: 6, textAlign: "center", color: "text.secondary" }}>
                    Nenhuma nota encontrada.
                  </Box>
                </TableCell>
              </TableRow>
            ) : visibleNotes.map((note) => (
              <TableRow key={note.id} hover>
                <TableCell sx={{ fontWeight: 700 }}>{note.noteNumber}</TableCell>
                <TableCell>{note.supplier}</TableCell>
                <TableCell>{warehouseLabel(note)}</TableCell>
                <TableCell>{note.skuCount}</TableCell>
                <TableCell>{note.receivedQty}</TableCell>
                <TableCell>{note.addressedQty}</TableCell>
                <TableCell>{note.pendingQty}</TableCell>
                <TableCell><StockStatusChip status={note.addressingStatus} /></TableCell>
                <TableCell><ReceivingStatusChip status={note.receivingStatus} /></TableCell>
                <TableCell>{formatDate(note.updatedAt)}</TableCell>
                <TableCell>
                  <Button
                    variant="contained"
                    size="small"
                    onClick={() => { setOpenedNote(note); setNoteOpen(true); }}
                  >
                    Abrir nota
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={notes.length}
          page={safePage}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
          labelRowsPerPage="Linhas por página"
          onPageChange={onPageChange}
          onRowsPerPageChange={onRowsPerPageChange}
        />
      </Paper>

      <Dialog
        open={noteOpen}
        onClose={() => setNoteOpen(false)}
        slotProps={{ transition: { onExited: () => setOpenedNote(null) } }}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Nota {openedNote?.noteNumber}</DialogTitle>
        <DialogContent>
          {openedNote && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Stack direction="row" spacing={2} useFlexGap flexWrap="wrap" alignItems="center">
                <ReceivingStatusChip status={openedNote.receivingStatus} />
                <StockStatusChip status={openedNote.addressingStatus} />
                <Box><strong>Fornecedor:</strong> {openedNote.supplier}</Box>
                <Box><strong>Estoque:</strong> {warehouseLabel(openedNote)}</Box>
              </Stack>
              {openedNote.noteObservation && (
                <Box sx={{ p: 1.5, borderRadius: 1, bgcolor: openedNote.receivingHasIssue ? "warning.light" : "grey.100" }}>
                  <strong>Observação:</strong> {openedNote.noteObservation}
                </Box>
              )}
              <Paper variant="outlined" sx={{ overflow: "auto" }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      {["SKU", "EAN", "Produto", "Recebido", "Endereçado", "Pendente", "Status", "Locais"].map((label) => (
                        <TableCell key={label} sx={{ fontWeight: 700 }}>{label}</TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {openedNote.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.sku}</TableCell>
                        <TableCell>{item.ean}</TableCell>
                        <TableCell>{item.productName}</TableCell>
                        <TableCell>{item.receivedQty}</TableCell>
                        <TableCell>{item.addressedQty}</TableCell>
                        <TableCell>{item.pendingQty}</TableCell>
                        <TableCell><StockStatusChip status={item.status} /></TableCell>
                        <TableCell>{item.locations?.join(", ") || "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Paper>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNoteOpen(false)}>Fechar</Button>
          <Button
            variant="contained"
            disabled={pendingIds.length === 0}
            onClick={() => onAddressNote(openedNote, pendingIds)}
          >
            Endereçar produtos pendentes ({pendingIds.length})
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
