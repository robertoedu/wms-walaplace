import { Alert, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from "@mui/material";

export const DeleteLocationDialog = ({ open, location, onClose, onConfirm }) => (
  <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
    <DialogTitle>Excluir local?</DialogTitle>
    <DialogContent>
      <Stack spacing={2} sx={{ mt: 1 }}>
        <Typography>O local <strong>{location?.code}</strong> será excluído permanentemente.</Typography>
        <Alert severity="error">A exclusão só será permitida se o local estiver vazio. Esta ação não pode ser desfeita.</Alert>
      </Stack>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Cancelar</Button>
      <Button color="error" variant="contained" onClick={onConfirm}>Excluir local</Button>
    </DialogActions>
  </Dialog>
);
