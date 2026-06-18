import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@mui/material";
import { PackagingZoneSelectionDialog } from "./PackagingZoneSelectionDialog";
import { PickingSessionSummaryPanel } from "./PickingSessionSummaryPanel";

export const FinishPickingSessionDialog = ({
  open,
  items,
  zones,
  onZone,
  onClose,
  onConfirm,
}) => (
  <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
    <DialogTitle>Finalizar separação</DialogTitle>
    <DialogContent>
      <Stack spacing={2} sx={{ mt: 1 }}>
        <PickingSessionSummaryPanel items={items} />
        <Table size="small">
          <TableHead>
            <TableRow>
              {[
                "Pedido",
                "SKU",
                "Produto",
                "Qtd. separada",
                "Tipo embalagem",
                "Zona sugerida",
                "Zona final",
              ].map((header) => (
                <TableCell key={header}>{header}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item) => (
              <PackagingZoneSelectionDialog
                key={item.id}
                item={item}
                zone={zones[item.id] || item.suggestedZone}
                onZone={(value) => onZone(item.id, value)}
              />
            ))}
          </TableBody>
        </Table>
      </Stack>
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose}>Voltar</Button>
      <Button variant="contained" onClick={onConfirm}>
        Confirmar finalização
      </Button>
    </DialogActions>
  </Dialog>
);
