import { MenuItem, TableCell, TableRow, TextField } from "@mui/material";

const getZoneOptions = (suggestedZone) =>
  [suggestedZone, "Mesa A", "Mesa B", "Mesa Frágeis", "Área Volumosos"].filter(
    (value, index, options) => options.indexOf(value) === index,
  );

export const PackagingZoneSelectionDialog = ({ item, zone, onZone }) => (
  <TableRow>
    <TableCell>{item.orderId}</TableCell>
    <TableCell>{item.sku}</TableCell>
    <TableCell>{item.productName}</TableCell>
    <TableCell>{item.pickedQty}</TableCell>
    <TableCell>{item.packagingType}</TableCell>
    <TableCell>{item.suggestedZone}</TableCell>
    <TableCell>
      <TextField
        select
        size="small"
        value={zone}
        onChange={(event) => onZone(event.target.value)}
      >
        {getZoneOptions(item.suggestedZone).map((value) => (
          <MenuItem key={value} value={value}>{value}</MenuItem>
        ))}
      </TextField>
    </TableCell>
  </TableRow>
);
