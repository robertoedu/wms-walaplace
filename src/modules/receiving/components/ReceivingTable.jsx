import {
  Box,
  Button,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
} from "@mui/material";
import { ReceivingStatusChip } from "./ReceivingStatusChip";

const formatDate = (value) =>
  new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));

export const ReceivingTable = ({
  notes,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  onViewItems,
  onEditNote,
}) => {
  const safePage = Math.min(
    page,
    Math.max(0, Math.ceil(notes.length / rowsPerPage) - 1),
  );
  const visibleNotes = notes.slice(
    safePage * rowsPerPage,
    safePage * rowsPerPage + rowsPerPage,
  );

  return (
    <Paper
      elevation={0}
      sx={{ border: "1px solid", borderColor: "divider", overflow: "hidden" }}
    >
      <Table>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: "bold" }}>Nota</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Itens</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Data</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Ações</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {visibleNotes.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5}>
                <Box
                  sx={{ py: 6, textAlign: "center", color: "text.secondary" }}
                >
                  Nenhuma nota encontrada.
                </Box>
              </TableCell>
            </TableRow>
          ) : (
            visibleNotes.map((note) => (
              <TableRow key={note.id} hover>
                <TableCell>
                  <Stack spacing={0.5}>
                    <Box sx={{ fontWeight: 600 }}>{note.key}</Box>
                    <Box sx={{ fontSize: "0.85rem", color: "text.secondary" }}>
                      {note.supplier}
                    </Box>
                  </Stack>
                </TableCell>
                <TableCell>{note.items.length}</TableCell>
                <TableCell>
                  <ReceivingStatusChip status={note.status} />
                </TableCell>
                <TableCell>{formatDate(note.createdAt)}</TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => onViewItems(note)}
                    >
                      Ver itens
                    </Button>
                    {(note.status === "incompleta" ||
                      note.status === "divergente") && (
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => onEditNote(note)}
                      >
                        Editar
                      </Button>
                    )}
                  </Stack>
                </TableCell>
              </TableRow>
            ))
          )}
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
  );
};
