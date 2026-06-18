import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack } from "@mui/material";

export const AddressingConfirmDialog = ({ open, onClose, onConfirm, product, location, quantity }) => (
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
    <DialogTitle>Confirmar endereçamento</DialogTitle>
    <DialogContent>
      {product && location && (
        <Stack spacing={1.1} sx={{ mt: 1 }}>
          <Box><strong>Ordem/NF:</strong> {product.orderCode || product.noteNumber}</Box>
          <Box><strong>Produto:</strong> {product.productName}</Box>
          <Box><strong>SKU:</strong> {product.sku}</Box>
          <Box><strong>Status do recebimento:</strong> {product.receivingStatus}</Box>
          {product.noteObservation && <Box><strong>Observação:</strong> {product.noteObservation}</Box>}
          <Box><strong>Local:</strong> {location.code}</Box>
          <Box><strong>Quantidade:</strong> {quantity}</Box>
        </Stack>
      )}
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Cancelar</Button>
      <Button variant="contained" onClick={onConfirm}>Confirmar</Button>
    </DialogActions>
  </Dialog>
);
