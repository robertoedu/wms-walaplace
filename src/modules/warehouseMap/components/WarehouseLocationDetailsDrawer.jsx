import { Box, Button, Divider, Drawer, Stack, Typography } from "@mui/material";
import { buildLocationStats } from "../utils/warehouseMapUtils";

export const WarehouseLocationDetailsDrawer = ({ open, element, location, items, onClose }) => {
  const stats = buildLocationStats(location, items);

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: 360, p: 3 }}>
        <Stack spacing={2}>
          <Box>
            <Typography variant="h6" fontWeight={850}>Local {element?.locationCode}</Typography>
            <Typography color="text.secondary">{location?.description || element?.label}</Typography>
          </Box>
          <Divider />
          <Box><strong>Código:</strong> {element?.locationCode || "-"}</Box>
          <Box><strong>Quantidade armazenada:</strong> {stats.quantity}</Box>
          <Box><strong>Quantidade de SKUs:</strong> {stats.skuCount}</Box>
          <Box><strong>Status:</strong> {stats.status}</Box>
          <Box><strong>Última movimentação:</strong> {stats.lastMovement ? new Date(stats.lastMovement).toLocaleString("pt-BR") : "Sem movimentação registrada"}</Box>
          <Divider />
          <Typography fontWeight={800}>Itens</Typography>
          {items.length ? items.map((item) => (
            <Box key={item.sku} sx={{ p: 1.25, border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
              <Typography fontWeight={700}>{item.sku}</Typography>
              <Typography variant="body2" color="text.secondary">{item.description}</Typography>
              <Typography variant="body2">{item.quantity} unidade(s)</Typography>
            </Box>
          )) : <Typography color="text.secondary">Nenhum item neste local.</Typography>}
          <Button variant="outlined" onClick={onClose}>Fechar</Button>
        </Stack>
      </Box>
    </Drawer>
  );
};

