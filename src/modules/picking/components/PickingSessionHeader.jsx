import { Box, Button, Paper, Stack } from "@mui/material";
import { PickingStatusChip } from "./PickingStatusChip";

export const PickingSessionHeader = ({
  session,
  items,
  onPause,
  onCancel,
  onFinish,
}) => {
  const complete = items.filter((item) => item.pickedQty === item.requiredQty).length;
  const partial = items.filter(
    (item) => item.pickedQty > 0 && item.pickedQty < item.requiredQty,
  ).length;

  return (
    <Paper
      elevation={0}
      sx={{ p: 2.5, border: "1px solid", borderColor: "divider" }}
    >
      <Stack spacing={2}>
        <Stack
          direction="row"
          spacing={2}
          useFlexGap
          flexWrap="wrap"
          alignItems="center"
        >
          <Box><strong>Sessão:</strong> {session.id}</Box>
          <Box><strong>Operador:</strong> {session.operator}</Box>
          <PickingStatusChip status={session.status} />
          <Box><strong>Pedidos:</strong> {session.orderIds.length}</Box>
          <Box><strong>Itens:</strong> {items.length}</Box>
          <Box><strong>Completos:</strong> {complete}</Box>
          <Box><strong>Parciais:</strong> {partial}</Box>
          <Box><strong>Pendentes:</strong> {items.length - complete}</Box>
        </Stack>

        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Button variant="outlined" onClick={onPause}>
            {session.status === "pausada" ? "Retomar" : "Pausar"}
          </Button>
          <Button color="error" variant="outlined" onClick={onCancel}>
            Cancelar sessão
          </Button>
          <Button variant="contained" onClick={onFinish}>
            Finalizar separação
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
};
