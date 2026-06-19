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
import { StockStatusChip } from "./StockStatusChip";
import { getWarehouseLabel } from "../../../shared/utils/warehouseCatalog";

export const StockTable = ({
  products,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  onEdit,
  onMoveLocation,
  onTransferWarehouse,
}) => {
  const visibleRows = products.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  return (
    <Paper
      elevation={0}
      sx={{ border: "1px solid", borderColor: "divider", overflow: "hidden" }}
    >
      <Box sx={{ overflow: "auto" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>Descrição</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Estoque</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>SKU</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>EAN</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Disponivel</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Em transferencia</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Localização</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {visibleRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8}>
                  <Box
                    sx={{
                      py: 6,
                      textAlign: "center",
                      color: "text.secondary",
                    }}
                  >
                    Nenhum produto encontrado.
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              visibleRows.map((product) => (
                <TableRow key={product.id} hover>
                  <TableCell>
                    <Stack spacing={0.5}>
                      <Box sx={{ fontWeight: 600 }}>{product.description}</Box>
                      <StockStatusChip product={product} />
                    </Stack>
                  </TableCell>
                  <TableCell>{getWarehouseLabel(product.warehouseId)}</TableCell>
                  <TableCell>{product.sku}</TableCell>
                  <TableCell>{product.ean}</TableCell>
                  <TableCell>{product.quantity}</TableCell>
                  <TableCell>{product.transferPendingQty || 0}</TableCell>
                  <TableCell>{product.currentLocation || "-"}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => onEdit(product)}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => onMoveLocation(product)}
                        disabled={Number(product.quantity || 0) <= 0}
                      >
                        Trocar local
                      </Button>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => onTransferWarehouse(product)}
                        disabled={Number(product.quantity || 0) <= 0}
                      >
                        Transferir estoque
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Box>

      <TablePagination
        component="div"
        count={products.length}
        page={page}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
        labelRowsPerPage="Linhas por página"
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
      />
    </Paper>
  );
};
