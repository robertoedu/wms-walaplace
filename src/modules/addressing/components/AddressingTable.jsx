import {
  Box, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, Paper, Stack,
  Table, TableBody, TableCell, TableHead, TablePagination, TableRow,
} from "@mui/material";
import { useState } from "react";
import { StockStatusChip } from "./StockStatusChip";
import { ReceivingStatusChip } from "../../receiving/components/ReceivingStatusChip";
import { canAddressStockItem } from "../../../shared/utils/statusCatalog";

const formatDate = (value) => value
  ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value))
  : "-";

export const AddressingTable = ({
  rows, page, rowsPerPage, onPageChange, onRowsPerPageChange, onAddress,
  selectedIds = [], onSelectionChange,
}) => {
  const [details, setDetails] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const safePage = Math.min(page, Math.max(0, Math.ceil(rows.length / rowsPerPage) - 1));
  const visibleRows = rows.slice(safePage * rowsPerPage, safePage * rowsPerPage + rowsPerPage);
  const selectableRows = visibleRows.filter((row) => row.pendingQty > 0 && !row.addressingBlocked);
  const allVisibleSelected = selectableRows.length > 0 && selectableRows.every((row) => selectedIds.includes(row.id));

  const toggleAllVisible = () => {
    const selectableIds = selectableRows.map((row) => row.id);
    onSelectionChange(
      allVisibleSelected
        ? selectedIds.filter((id) => !selectableIds.includes(id))
        : Array.from(new Set([...selectedIds, ...selectableIds])),
    );
  };

  const renderAction = (row) => {
    if (canAddressStockItem(row.status)) {
      return <Button variant="contained" size="small" onClick={() => onAddress(row)}>Endereçar</Button>;
    }
    if (row.status === "aguardando_separacao") {
      return <Button variant="outlined" size="small" onClick={() => { setDetails(row); setDetailsOpen(true); }}>Ver locais</Button>;
    }
    return <Button color="error" variant="outlined" size="small" onClick={() => { setDetails(row); setDetailsOpen(true); }}>Ver bloqueio</Button>;
  };

  return (
    <>
      <Paper elevation={0} sx={{ border: "1px solid", borderColor: "divider", overflow: "auto" }}>
        <Table sx={{ minWidth: 1300 }}>
          <TableHead>
            <TableRow>
              {onSelectionChange && (
                <TableCell padding="checkbox">
                  <Checkbox checked={allVisibleSelected} onChange={toggleAllVisible} />
                </TableCell>
              )}
              {["Ordem/NF", "SKU", "EAN", "Produto", "Recebido", "Endereçado", "Pendente", "Endereçamento", "Recebimento", "Local atual", "Última atualização", "Ações"].map((label) => (
                <TableCell key={label} sx={{ fontWeight: 700 }}>{label}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {visibleRows.length === 0 ? (
              <TableRow><TableCell colSpan={onSelectionChange ? 13 : 12}><Box sx={{ py: 6, textAlign: "center", color: "text.secondary" }}>Nenhum produto encontrado para endereçamento.</Box></TableCell></TableRow>
            ) : visibleRows.map((row) => (
              <TableRow key={row.id} hover>
                {onSelectionChange && (
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={selectedIds.includes(row.id)}
                      disabled={row.pendingQty === 0 || row.addressingBlocked}
                      onChange={() => onSelectionChange(
                        selectedIds.includes(row.id)
                          ? selectedIds.filter((id) => id !== row.id)
                          : [...selectedIds, row.id],
                      )}
                    />
                  </TableCell>
                )}
                <TableCell>{row.orderCode}</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>{row.sku}</TableCell>
                <TableCell>{row.ean}</TableCell>
                <TableCell>{row.productName}</TableCell>
                <TableCell>{row.receivedQty}</TableCell>
                <TableCell>{row.addressedQty}</TableCell>
                <TableCell>{row.pendingQty}</TableCell>
                <TableCell><StockStatusChip status={row.status} /></TableCell>
                <TableCell>
                  <Stack spacing={0.5} alignItems="flex-start">
                    <ReceivingStatusChip status={row.receivingStatus} />
                    {row.noteObservation && (
                      <Box sx={{ maxWidth: 220, fontSize: "0.78rem", color: row.receivingHasIssue ? "error.main" : "text.secondary" }}>
                        {row.noteObservation}
                      </Box>
                    )}
                  </Stack>
                </TableCell>
                <TableCell>{row.locations?.join(", ") || row.currentLocation || "-"}</TableCell>
                <TableCell>{formatDate(row.updatedAt)}</TableCell>
                <TableCell>{renderAction(row)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination component="div" count={rows.length} page={safePage} rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[5, 10, 25]} labelRowsPerPage="Linhas por página"
          onPageChange={onPageChange} onRowsPerPageChange={onRowsPerPageChange} />
      </Paper>

      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        slotProps={{ transition: { onExited: () => setDetails(null) } }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>{details?.status === "bloqueado_divergencia" ? "Bloqueio para quarentena" : "Locais do produto"}</DialogTitle>
        <DialogContent>
          {details?.status === "bloqueado_divergencia" ? (
            <Stack spacing={1} sx={{ mt: 1 }}>
              <Box><strong>Nota:</strong> {details.noteNumber}</Box>
              <Box><strong>Produto:</strong> {details.productName}</Box>
              <Box color="error.main">{details.noteObservation || "Produto bloqueado para endereçamento."}</Box>
            </Stack>
          ) : (
            <Stack spacing={1} sx={{ mt: 1 }}>
              {(details?.locations || []).map((location) => <Box key={location}>{location}</Box>)}
              {!details?.locations?.length && <Box color="text.secondary">Nenhum local registrado.</Box>}
            </Stack>
          )}
        </DialogContent>
        <DialogActions><Button onClick={() => setDetailsOpen(false)}>Fechar</Button></DialogActions>
      </Dialog>
    </>
  );
};
