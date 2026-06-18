import { Button, Checkbox, Chip, Paper, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import { PickingStatusChip } from "./PickingStatusChip";
import { canSelectForPicking } from "../../../shared/utils/statusCatalog";

export const PickingSelectableTable = ({ mode, rows, selectedIds, onSelection, onStartOne }) => {
  const selectable = (row) => mode === "items"
    ? canSelectForPicking(row.status) && !row.orderLocked
    : canSelectForPicking(row.status) && !row.lockMode;
  const toggle = (id) => onSelection(
    selectedIds.includes(id) ? selectedIds.filter((current) => current !== id) : [...selectedIds, id],
  );

  if (mode === "orders") {
    return <Paper elevation={0} sx={{ overflow: "auto", border: "1px solid", borderColor: "divider" }}>
      <Table sx={{ minWidth: 1000 }}><TableHead><TableRow>
        {["", "Pedido", "Marketplace", "Cliente", "Transportadora", "Itens", "Unidades", "Status", "Ações"].map((header, index) => <TableCell key={`${header}-${index}`}>{header}</TableCell>)}
      </TableRow></TableHead><TableBody>{rows.map((row) => <TableRow key={row.id} sx={row.highVolume ? { bgcolor: "warning.50", borderLeft: "5px solid", borderColor: "warning.main" } : {}}>
        <TableCell padding="checkbox"><Checkbox disabled={!selectable(row)} checked={selectedIds.includes(row.id)} onChange={() => toggle(row.id)} /></TableCell>
        <TableCell><strong>{row.id}</strong>{row.highVolume && <Chip label="Volume alto" color="warning" size="small" sx={{ ml: 1 }} />}</TableCell>
        <TableCell>{row.marketplace}</TableCell><TableCell>{row.customer}</TableCell><TableCell>{row.carrier}</TableCell><TableCell>{row.itemCount}</TableCell><TableCell>{row.units}</TableCell>
        <TableCell><PickingStatusChip status={row.status} /></TableCell>
        <TableCell><Button size="small" disabled={!selectable(row)} onClick={() => onStartOne(row)}>Separar pedido</Button></TableCell>
      </TableRow>)}</TableBody></Table>
    </Paper>;
  }

  return <Paper elevation={0} sx={{ overflow: "auto", border: "1px solid", borderColor: "divider" }}>
    <Table sx={{ minWidth: 1300 }}><TableHead><TableRow>
      {["", "Pedido", "Marketplace", "SKU", "EAN", "Produto", "Local sugerido", "Necessário", "Separado", "Faltando", "Status", "Ações"].map((header, index) => <TableCell key={`${header}-${index}`}>{header}</TableCell>)}
    </TableRow></TableHead><TableBody>{rows.map((row) => <TableRow key={row.id}>
      <TableCell padding="checkbox"><Checkbox disabled={!selectable(row)} checked={selectedIds.includes(row.id)} onChange={() => toggle(row.id)} /></TableCell>
      <TableCell>{row.orderId}</TableCell><TableCell>{row.marketplace}</TableCell><TableCell>{row.sku}</TableCell><TableCell>{row.ean}</TableCell><TableCell><strong>{row.productName}</strong></TableCell>
      <TableCell>{row.locationCode}</TableCell><TableCell>{row.requiredQty}</TableCell><TableCell>{row.pickedQty}</TableCell><TableCell>{row.missingQty}</TableCell>
      <TableCell><PickingStatusChip status={row.status} /></TableCell>
      <TableCell><Button size="small" disabled={!selectable(row)} onClick={() => onStartOne(row)}>Separar</Button></TableCell>
    </TableRow>)}</TableBody></Table>
  </Paper>;
};
