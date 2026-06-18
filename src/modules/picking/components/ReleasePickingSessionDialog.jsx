import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from "@mui/material";

export const ReleasePickingSessionDialog = ({ open, session, onClose, onConfirm }) => (
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
    <DialogTitle>Liberar sessão para separação?</DialogTitle>
    <DialogContent>
      <Stack spacing={2} sx={{ mt: 1 }}>
        <Typography>A sessão <strong>{session?.id}</strong>, iniciada por <strong>{session?.operator}</strong>, será encerrada.</Typography>
        <Alert severity="warning">
          Os itens voltarão para Aguardando Separação e as quantidades retiradas serão devolvidas ao saldo. Confirme que os produtos físicos também retornaram ao local.
        </Alert>
      </Stack>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Cancelar</Button>
      <Button color="warning" variant="contained" onClick={onConfirm}>Liberar sessão</Button>
    </DialogActions>
  </Dialog>
);
