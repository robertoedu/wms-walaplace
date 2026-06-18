import { Alert, Box, Button, MenuItem, Stack, TextField, Typography } from "@mui/material";
import DeleteForeverOutlinedIcon from "@mui/icons-material/DeleteForeverOutlined";

export const WarehousePropertiesPanel = ({
  element,
  elements,
  locations,
  onSelect,
  onChange,
  onNumber,
  onRemove,
}) => (
  <Stack spacing={1.5}>
    <Typography fontWeight={800}>Painel de propriedades</Typography>
    <TextField select label="Componente" value={element?.id || ""} onChange={(event) => onSelect(event.target.value)}>
      <MenuItem value="">Nenhum componente</MenuItem>
      {elements.map((item) => <MenuItem key={item.id} value={item.id}>{item.label} - {item.type}</MenuItem>)}
    </TextField>
    {element ? (
      <>
        <TextField label="Nome" value={element.label} onChange={(event) => onChange("label", event.target.value)} />
        <TextField select label="Tipo" value={element.type} onChange={(event) => onChange("type", event.target.value)}>
          {[
            ["location", "Local de estoque"],
            ["aisle", "Rua"],
            ["corridor", "Corredor"],
            ["dock", "Doca"],
            ["receiving", "Área de recebimento"],
            ["picking", "Área de separação"],
            ["packaging", "Área de embalagem"],
            ["administrative", "Área administrativa"],
            ["environment", "Ambiente"],
          ].map(([value, label]) => <MenuItem key={value} value={value}>{label}</MenuItem>)}
        </TextField>
        <TextField select required={element.type === "location"} error={element.type === "location" && !element.locationCode} label="Local vinculado" value={element.locationCode || ""} onChange={(event) => onChange("locationCode", event.target.value)}>
          <MenuItem value="">Sem vínculo</MenuItem>
          {locations.map((location) => <MenuItem key={location.code} value={location.code}>{location.code} - {location.description}</MenuItem>)}
        </TextField>
        {element.shape === "line" ? (
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
            <TextField label="X inicial" type="number" value={element.x} onChange={(event) => onNumber("x", event.target.value)} />
            <TextField label="Y inicial" type="number" value={element.y} onChange={(event) => onNumber("y", event.target.value)} />
            <TextField label="X final" type="number" value={element.x2 || 0} onChange={(event) => onNumber("x2", event.target.value)} />
            <TextField label="Y final" type="number" value={element.y2 || 0} onChange={(event) => onNumber("y2", event.target.value)} />
          </Box>
        ) : (
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1 }}>
            <TextField label="Posição X" type="number" value={element.x} onChange={(event) => onNumber("x", event.target.value)} />
            <TextField label="Posição Y" type="number" value={element.y} onChange={(event) => onNumber("y", event.target.value)} />
            <TextField label="Largura" type="number" value={element.width} onChange={(event) => onNumber("width", event.target.value)} />
            <TextField label="Altura" type="number" value={element.height} onChange={(event) => onNumber("height", event.target.value)} />
          </Box>
        )}
        <TextField label="Cor" type="color" value={element.color || "#64748b"} onChange={(event) => onChange("color", event.target.value)} />
        <TextField label="Observação" value={element.observation || ""} onChange={(event) => onChange("observation", event.target.value)} multiline minRows={2} />
        <Button color="error" variant="outlined" startIcon={<DeleteForeverOutlinedIcon />} onClick={onRemove}>Excluir componente</Button>
      </>
    ) : <Alert severity="info">Selecione um componente para editar.</Alert>}
  </Stack>
);

