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

export const StockTable = ({
  products,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  onEdit,
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
              <TableCell sx={{ fontWeight: 700 }}>SKU</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>EAN</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Quantidade</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Localização</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Ações</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {visibleRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6}>
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
                  <TableCell>{product.sku}</TableCell>
                  <TableCell>{product.ean}</TableCell>
                  <TableCell>{product.quantity}</TableCell>
                  <TableCell>{product.currentLocation || "-"}</TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => onEdit(product)}
                    >
                      Editar
                    </Button>
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
