import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";

export const RemoveItemFromSessionDialog = ({
  open,
  item,
  onClose,
  onConfirm,
}) => (
  <Dialog open={open} onClose={onClose}>
    <DialogTitle>Remover item da sessão?</DialogTitle>
    <DialogContent>
      {item?.pickedQty > 0
        ? "O item possui separação parcial e voltará como Faltou Item."
        : "O item voltará para Aguardando Separação."}
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Cancelar</Button>
      <Button color="error" variant="contained" onClick={onConfirm}>
        Remover
      </Button>
    </DialogActions>
  </Dialog>
);
