import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import CenterFocusStrongIcon from "@mui/icons-material/CenterFocusStrong";
import RefreshIcon from "@mui/icons-material/Refresh";
import MapIcon from "@mui/icons-material/Map";
import { MainLayout } from "../../../shared/layout/MainLayout";
import { locationsService } from "../../locations/services/locationsService";
import { warehouseMapService } from "../services/warehouseMapService";
import { WarehouseMapCanvas } from "../components/WarehouseMapCanvas";
import { WarehouseMapSidebar } from "../components/WarehouseMapSidebar";
import { WarehouseMapSummaryCards } from "../components/WarehouseMapSummaryCards";
import { WarehouseMapZoomControls } from "../components/WarehouseMapZoomControls";
import { WarehouseLocationDetailsDrawer } from "../components/WarehouseLocationDetailsDrawer";

export const WarehouseMapPage = () => {
  const navigate = useNavigate();
  const [map, setMap] = useState(() => warehouseMapService.getMap());
  const [locations, setLocations] = useState(() => locationsService.list());
  const [zoom, setZoom] = useState(1);
  const [showGrid, setShowGrid] = useState(true);
  const [selectedElement, setSelectedElement] = useState(null);

  const locationsByCode = useMemo(() => new Map(locations.map((location) => [location.code, location])), [locations]);
  const locationItemsByCode = useMemo(() => {
    const entries = locations.map((location) => [location.code, locationsService.listItems(location.code)]);
    return new Map(entries);
  }, [locations]);

  const summary = useMemo(() => {
    const mappedLocationCodes = new Set(map.elements.filter((element) => element.type === "location" && element.locationCode).map((element) => element.locationCode));
    const occupiedLocations = locations.filter((location) => mappedLocationCodes.has(location.code) && locationsService.listItems(location.code).length > 0).length;
    return {
      totalLocations: mappedLocationCodes.size,
      occupiedLocations,
      freeLocations: Math.max(0, mappedLocationCodes.size - occupiedLocations),
      aisles: map.elements.filter((element) => element.type === "aisle").length,
    };
  }, [locations, map.elements]);

  const refresh = () => {
    setMap(warehouseMapService.getMap());
    setLocations(locationsService.list());
  };

  const selectedLocation = selectedElement?.locationCode ? locationsByCode.get(selectedElement.locationCode) : null;
  const selectedItems = selectedElement?.locationCode ? locationItemsByCode.get(selectedElement.locationCode) || [] : [];

  return (
    <MainLayout>
      <Stack spacing={3} sx={{ maxWidth: 1600, mx: "auto" }}>
        <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", md: "center" }} spacing={2}>
          <Stack direction="row" spacing={2} alignItems="center">
            <MapIcon sx={{ fontSize: 44, color: "primary.main" }} />
            <Box>
              <Typography variant="h4" fontWeight={850}>Mapa do Galpão</Typography>
              <Typography color="text.secondary">Visualização da estrutura física do estoque</Typography>
            </Box>
          </Stack>
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            <Button variant="contained" startIcon={<EditIcon />} onClick={() => navigate("/mapa-galpao/editor")}>Editar mapa</Button>
            <Button variant="outlined" startIcon={<CenterFocusStrongIcon />} onClick={() => setZoom(1)}>Centralizar mapa</Button>
            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={refresh}>Atualizar</Button>
          </Stack>
        </Stack>

        <WarehouseMapSummaryCards summary={summary} />

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", xl: "1fr 280px" }, gap: 2, minHeight: 680 }}>
          <Paper elevation={0} sx={{ p: 2, border: "1px solid", borderColor: "divider", borderRadius: 3 }}>
            <Stack spacing={2} height="100%">
              <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2} useFlexGap flexWrap="wrap">
                <Typography fontWeight={800}>Galpão completo</Typography>
                <WarehouseMapZoomControls
                  zoom={zoom}
                  showGrid={showGrid}
                  onZoomIn={() => setZoom((current) => Math.min(2, current + 0.15))}
                  onZoomOut={() => setZoom((current) => Math.max(0.55, current - 0.15))}
                  onCenter={() => setZoom(1)}
                  onToggleGrid={() => setShowGrid((current) => !current)}
                />
              </Stack>
              <Box sx={{ flex: 1, minHeight: 0 }}>
                <WarehouseMapCanvas
                  map={map}
                  locationsByCode={locationsByCode}
                  locationItemsByCode={locationItemsByCode}
                  selectedElementId={selectedElement?.id}
                  onSelectElement={(element) => {
                    if (element.type === "location") setSelectedElement(element);
                  }}
                  zoom={zoom}
                  showGrid={showGrid}
                />
              </Box>
            </Stack>
          </Paper>

          <WarehouseMapSidebar />
        </Box>
      </Stack>

      <WarehouseLocationDetailsDrawer
        open={Boolean(selectedElement)}
        element={selectedElement}
        location={selectedLocation}
        items={selectedItems}
        onClose={() => setSelectedElement(null)}
      />
    </MainLayout>
  );
};

