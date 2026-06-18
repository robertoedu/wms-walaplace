import { Box, Button, Dialog, Select, Stack, TextField } from "@mui/material";
import { WarehouseLocationSelect } from "./WarehouseLocationSelect";

const environmentTypes = ["Recebimento", "Separacao", "Embalagem", "Doca", "Administrativo"];

export const WarehouseElementModal = ({
  open,
  mode,
  element,
  locations,
  usedLocationCodes,
  onClose,
  onChangeElement,
  onDeleteElement,
}) => {
  const isWarehouse = mode === "warehouse";

  const updateElement = (field, value) => {
    if (!element) return;
    onChangeElement(element.id, { [field]: value });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <Box sx={{ p: 2.5 }}>
        <Stack spacing={2}>
          <Box>
            <Box sx={{ fontSize: 20, fontWeight: 900, color: "#0f172a" }}>
              {isWarehouse ? "Editar galpao" : "Editar elemento"}
            </Box>
            <Box sx={{ mt: 0.5, color: "#64748b", fontSize: 13 }}>
              Ajuste as informacoes principais deste item do mapa.
            </Box>
          </Box>

          {isWarehouse ? (
            <Box sx={{ color: "#64748b", fontSize: 14 }}>
              O tamanho do galpao deve ser alterado diretamente no editor pela alca visual.
            </Box>
          ) : null}

          {!isWarehouse && element?.type === "street" ? (
            <Stack spacing={1.5}>
              <TextField label="Nome" value={element.name} onChange={(event) => updateElement("name", event.target.value)} />
            </Stack>
          ) : null}

          {!isWarehouse && element?.type === "location" ? (
            <Stack spacing={1.5}>
              <TextField
                label="Codigo do local"
                value={element.locationCode || "Selecione um local cadastrado"}
                disabled
              />
              <WarehouseLocationSelect
                value={element.locationCode}
                locations={locations}
                usedLocationCodes={usedLocationCodes}
                currentElementId={element.id}
                onChange={(value) => updateElement("locationCode", value)}
              />
            </Stack>
          ) : null}

          {!isWarehouse && element?.type === "environment" ? (
            <Stack spacing={1.5}>
              <Box>
                <Box sx={{ mb: 0.75, color: "#334155", fontSize: 13, fontWeight: 800 }}>Tipo</Box>
                <Select native fullWidth value={element.environmentType} onChange={(event) => updateElement("environmentType", event.target.value)}>
                  {environmentTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </Select>
              </Box>
            </Stack>
          ) : null}

          <Stack direction="row" spacing={1} justifyContent="flex-end">
            {!isWarehouse ? (
              <Button color="error" variant="outlined" onClick={() => onDeleteElement(element.id)}>
                Excluir
              </Button>
            ) : null}
            <Button variant="contained" onClick={onClose}>Concluir</Button>
          </Stack>
        </Stack>
      </Box>
    </Dialog>
  );
};
