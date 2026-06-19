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
  TextField,
} from "@mui/material";

const getExpectedQty = (item) => Number(item.expectedQty ?? item.quantity ?? 0);
const getIssuedQty = (item) => Number(item.issuedQty ?? item.quantity ?? 0);

export const ReceivingItemsTable = ({
  items,
  mode = "manual",
  onEditItem,
  onRemoveItem,
  onReceivedQtyChange,
}) => {
  const isConference = mode === "conference";
  const canEditItems = Boolean(onEditItem || onRemoveItem);

  return (
    <Paper
      elevation={0}
      sx={{ border: "1px solid", borderColor: "divider", overflow: "hidden" }}
    >
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: "bold" }}>Código</TableCell>
            <TableCell sx={{ fontWeight: "bold" }}>Descrição</TableCell>
            {isConference ? (
              <>
                <TableCell sx={{ fontWeight: "bold" }}>Qtd prevista</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Qtd emitida</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Qtd recebida</TableCell>
              </>
            ) : (
              <TableCell sx={{ fontWeight: "bold" }}>Quantidade</TableCell>
            )}
            {canEditItems && <TableCell sx={{ fontWeight: "bold" }}>Ações</TableCell>}
          </TableRow>
        </TableHead>
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={isConference ? 5 : canEditItems ? 4 : 3}>
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
                {isConference ? (
                  <>
                    <TableCell>{getExpectedQty(item)}</TableCell>
                    <TableCell>{getIssuedQty(item)}</TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        size="small"
                        value={item.receivedQty ?? ""}
                        onChange={(event) =>
                          onReceivedQtyChange?.(index, event.target.value)
                        }
                        slotProps={{ htmlInput: { min: 0, step: 1 } }}
                        sx={{ width: 130 }}
                      />
                    </TableCell>
                  </>
                ) : (
                  <TableCell>{item.quantity}</TableCell>
                )}
                {canEditItems && (
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      {onEditItem && (
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => onEditItem(index)}
                        >
                          Editar quantidade
                        </Button>
                      )}
                      {onRemoveItem && (
                        <Button
                          size="small"
                          color="error"
                          variant="outlined"
                          onClick={() => onRemoveItem(index)}
                        >
                          Remover
                        </Button>
                      )}
                    </Stack>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Paper>
  );
};
