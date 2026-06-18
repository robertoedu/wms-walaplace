import { Button, Stack, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

export const WarehouseComponentLibrary = ({ tool, onTool, onQuickAdd }) => (
  <Stack spacing={1}>
    <Typography fontWeight={800}>Biblioteca de componentes</Typography>
    {[
      ["aisle", "Rua"],
      ["corridor", "Corredor"],
      ["dock", "Doca"],
      ["receiving", "Área de recebimento"],
      ["picking", "Área de separação"],
      ["packaging", "Área de embalagem"],
      ["administrative", "Área administrativa"],
      ["location", "Local de estoque"],
      ["environment", "Ambiente"],
    ].map(([value, label]) => (
      <Button key={value} variant={tool === value ? "contained" : "outlined"} onClick={() => onTool(value)}>{label}</Button>
    ))}
    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
      <Button size="small" startIcon={<AddIcon />} onClick={() => onQuickAdd("aisle")}>Rua pronta</Button>
      <Button size="small" startIcon={<AddIcon />} onClick={() => onQuickAdd("location")}>Local pronto</Button>
      <Button size="small" startIcon={<AddIcon />} onClick={() => onQuickAdd("environment")}>Ambiente pronto</Button>
    </Stack>
  </Stack>
);

