import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from "@mui/material";

export const RemoveLocationItemDialog = ({ open, location, item, onClose, onConfirm }) => (
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
    <DialogTitle>Remover item do local?</DialogTitle>
    <DialogContent>
      <Stack spacing={2} sx={{ mt: 1 }}>
        <Typography><strong>{item?.description}</strong> ({item?.sku}) será removido do local <strong>{location?.code}</strong>.</Typography>
        <Alert severity="warning">
          O saldo de {item?.quantity || 0} unidade(s) será mantido, mas o produto ficará sem localização até ser endereçado novamente.
        </Alert>
      </Stack>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Cancelar</Button>
      <Button color="error" variant="contained" onClick={onConfirm}>Confirmar remoção</Button>
    </DialogActions>
  </Dialog>
);

