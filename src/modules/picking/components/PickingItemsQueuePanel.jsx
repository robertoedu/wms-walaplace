import { Box, Button, Chip, Paper, Stack } from "@mui/material";

export const PickingItemsQueuePanel = ({ items, currentId, onSelect, onRemove }) => (
  <Paper
    elevation={0}
    sx={{ p: 2, border: "1px solid", borderColor: "divider" }}
  >
    <Box fontWeight={700} mb={1}>Fila da sessão</Box>
    <Stack spacing={1}>
      {items.map((item) => (
        <Stack
          key={item.id}
          direction="row"
          spacing={1}
          alignItems="center"
        >
          <Chip
            clickable
            onClick={() => onSelect(item.id)}
            color={item.id === currentId ? "primary" : item.missingQty === 0 ? "success" : "default"}
            label={`${item.orderId} · ${item.sku} · falta ${item.missingQty}`}
            sx={{ flex: 1, justifyContent: "flex-start" }}
          />
          <Button size="small" color="error" onClick={() => onRemove(item)}>
            Remover
          </Button>
        </Stack>
      ))}
    </Stack>
  </Paper>
);
