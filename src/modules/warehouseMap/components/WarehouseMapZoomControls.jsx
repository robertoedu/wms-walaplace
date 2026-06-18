import { Button, ButtonGroup } from "@mui/material";

export const WarehouseMapZoomControls = ({ zoom, onZoomIn, onZoomOut, onCenter, showGrid, onToggleGrid }) => (
  <ButtonGroup variant="outlined" size="small">
    <Button onClick={onZoomOut}>Zoom -</Button>
    <Button disabled>{Math.round(zoom * 100)}%</Button>
    <Button onClick={onZoomIn}>Zoom +</Button>
    <Button onClick={onCenter}>Centralizar</Button>
    <Button onClick={onToggleGrid}>{showGrid ? "Ocultar grade" : "Mostrar grade"}</Button>
  </ButtonGroup>
);

