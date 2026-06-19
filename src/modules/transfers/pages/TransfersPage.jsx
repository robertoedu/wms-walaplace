import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
} from "@mui/material";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import { MainLayout } from "../../../shared/layout/MainLayout";
import { useAuth } from "../../../auth/context/AuthContext";
import { WAREHOUSES, getTransferConfirmPermission } from "../../../shared/utils/warehouseCatalog";
import { transfersService } from "../services/transfersService";

const canConfirmTransfer = (hasPermission, transfer) =>
  transfer.status === "pendente" &&
  hasPermission(getTransferConfirmPermission(transfer.toWarehouseId));

const formatDate = (value) =>
  value ? new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value)) : "-";

export const TransfersPage = () => {
  const { user, hasPermission } = useAuth();
  const [transfers, setTransfers] = useState(() => transfersService.listTransfers());
  const [warehouseId, setWarehouseId] = useState("all");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const refresh = () => setTransfers(transfersService.listTransfers());
    window.addEventListener("wms-transfer-change", refresh);
    return () => window.removeEventListener("wms-transfer-change", refresh);
  }, []);

  const filteredTransfers = useMemo(
    () => transfers.filter((transfer) =>
      (warehouseId === "all" || transfer.toWarehouseId === warehouseId || transfer.fromWarehouseId === warehouseId) &&
      (status === "all" || transfer.status === status),
    ),
    [transfers, warehouseId, status],
  );

  const visibleRows = filteredTransfers.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  const handleConfirm = (transfer) => {
    try {
      transfersService.confirmTransfer(transfer.id, user);
      setTransfers(transfersService.listTransfers());
      setFeedback("Transferencia confirmada e enviada para o enderecamento.");
      setError("");
    } catch (currentError) {
      setError(currentError.message);
    }
  };

  return (
    <MainLayout>
      <Stack spacing={3}>
        <Stack spacing={0.5}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <SwapHorizIcon color="primary" sx={{ fontSize: 34 }} />
            <Box sx={{ fontSize: "2rem", fontWeight: 700 }}>Transferencias</Box>
          </Stack>
          <Box sx={{ color: "text.secondary" }}>
            Confirme os itens enviados entre estoques antes do enderecamento.
          </Box>
        </Stack>

        {feedback && (
          <Alert severity="success" onClose={() => setFeedback("")}>
            {feedback}
          </Alert>
        )}
        {error && (
          <Alert severity="error" onClose={() => setError("")}>
            {error}
          </Alert>
        )}

        <Paper elevation={0} sx={{ border: "1px solid", borderColor: "divider", p: 2 }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <TextField
              select
              label="Estoque"
              value={warehouseId}
              onChange={(event) => {
                setWarehouseId(event.target.value);
                setPage(0);
              }}
              sx={{ minWidth: { md: 280 } }}
            >
              <MenuItem value="all">Todos os estoques</MenuItem>
              {WAREHOUSES.map((warehouse) => (
                <MenuItem key={warehouse.id} value={warehouse.id}>
                  {warehouse.label}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              select
              label="Status"
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
                setPage(0);
              }}
              sx={{ minWidth: { md: 220 } }}
            >
              <MenuItem value="all">Todos</MenuItem>
              <MenuItem value="pendente">Pendentes</MenuItem>
              <MenuItem value="confirmada">Confirmadas</MenuItem>
            </TextField>
          </Stack>
        </Paper>

        <Paper elevation={0} sx={{ border: "1px solid", borderColor: "divider", overflow: "hidden" }}>
          <Box sx={{ overflow: "auto" }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Item</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Codigo</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Estoque atual</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Quantidade</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Destino</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Criada em</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Acoes</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {visibleRows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8}>
                      <Box sx={{ py: 6, textAlign: "center", color: "text.secondary" }}>
                        Nenhuma transferencia encontrada.
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  visibleRows.map((transfer) => {
                    const canConfirm = canConfirmTransfer(hasPermission, transfer);
                    return (
                      <TableRow key={transfer.id} hover>
                        <TableCell>
                          <Box sx={{ fontWeight: 600 }}>{transfer.description}</Box>
                        </TableCell>
                        <TableCell>{transfer.sku}</TableCell>
                        <TableCell>{transfer.fromWarehouseName}</TableCell>
                        <TableCell>{transfer.quantity}</TableCell>
                        <TableCell>{transfer.toWarehouseName}</TableCell>
                        <TableCell>{formatDate(transfer.createdAt)}</TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            color={transfer.status === "pendente" ? "warning" : "success"}
                            label={transfer.status === "pendente" ? "Pendente" : "Confirmada"}
                          />
                        </TableCell>
                        <TableCell>
                          <Tooltip
                            title={
                              canConfirm
                                ? ""
                                : "Somente usuario com permissao do estoque recebedor pode confirmar."
                            }
                          >
                            <span>
                              <Button
                                variant="contained"
                                size="small"
                                disabled={!canConfirm}
                                onClick={() => handleConfirm(transfer)}
                              >
                                Confirmar transferencia
                              </Button>
                            </span>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </Box>

          <TablePagination
            component="div"
            count={filteredTransfers.length}
            page={page}
            rowsPerPage={rowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
            labelRowsPerPage="Linhas por pagina"
            onPageChange={(_, nextPage) => setPage(nextPage)}
            onRowsPerPageChange={(event) => {
              setRowsPerPage(Number(event.target.value));
              setPage(0);
            }}
          />
        </Paper>
      </Stack>
    </MainLayout>
  );
};
