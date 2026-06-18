import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutlineOutlined";

export const LocationItemsDialog = ({ open, location, items, onClose, onRemove }) => (
  <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
    <DialogTitle>Itens do local {location?.code}</DialogTitle>
    <DialogContent>
      <Stack spacing={2} sx={{ mt: 1 }}>
        <Typography color="text.secondary">{location?.description}</Typography>
        {items.length ? (
          <Table size="small">
            <TableHead><TableRow><TableCell>SKU</TableCell><TableCell>EAN</TableCell><TableCell>Produto</TableCell><TableCell>Quantidade</TableCell><TableCell align="right">Ações</TableCell></TableRow></TableHead>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.sku}>
                  <TableCell><strong>{item.sku}</strong></TableCell>
                  <TableCell>{item.ean}</TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell align="right">
                    <Button color="error" size="small" startIcon={<RemoveCircleOutlineIcon />} onClick={() => onRemove(item)}>Remover do local</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : <Alert severity="info">Este local não possui itens vinculados.</Alert>}
      </Stack>
    </DialogContent>
    <DialogActions><Button onClick={onClose}>Fechar</Button></DialogActions>
  </Dialog>
);
