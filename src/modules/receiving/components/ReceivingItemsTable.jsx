import {
  Box,
  Button,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";

export const ReceivingItemsTable = ({ items, onEditItem, onRemoveItem }) => {
  return (
    <Paper
      elevation={0}
      sx={{ border: "1px solid", borderColor: "divider", overflow: "hidden" }}
    >
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: "bold" }}>SKU</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Produto</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Quantidade</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Ações</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4}>
                <Box
                  sx={{ py: 4, textAlign: "center", color: "text.secondary" }}
                >
                  Nenhum item adicionado.
                </Box>
              </TableCell>
            </TableRow>
          ) : (
            items.map((item, index) => (
              <TableRow key={`${item.sku}-${index}`}>
                <TableCell>{item.sku}</TableCell>
                <TableCell>{item.description}</TableCell>
                <TableCell>{item.quantity}</TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={() => onEditItem(index)}
                    >
                      Editar quantidade
                    </Button>
                    <Button
                      size="small"
                      color="error"
                      variant="outlined"
                      onClick={() => onRemoveItem(index)}
                    >
                      Remover
                    </Button>
                  </Stack>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Paper>
  );
};
