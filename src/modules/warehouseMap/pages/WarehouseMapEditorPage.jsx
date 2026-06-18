import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Box, Stack } from "@mui/material";
import { warehouseMapService } from "../services/warehouseMapService";
import { WarehouseBackButton } from "../components/WarehouseBackButton";
import { WarehouseElementModal } from "../components/WarehouseElementModal";
import { WarehouseMapCanvas } from "../components/WarehouseMapCanvas";
import { WarehouseMapSidebar } from "../components/WarehouseMapSidebar";
import { WarehouseSaveButton } from "../components/WarehouseSaveButton";
import { locationsService } from "../../locations/services/locationsService";

const flattenLocationsForMap = (locations) =>
  locations
    .filter((location) => !location.isSubLocation)
    .map((location) => ({ code: location.code, description: location.description }));

const colorsByEnvironment = {
  Recebimento: "#0ea5e9",
  Separacao: "#f97316",
  Embalagem: "#8b5cf6",
  Doca: "#2563eb",
  Administrativo: "#14b8a6",
};

const createElement = (type, count) => {
  if (type === "street") {
    return {
      id: `street-${Date.now()}-${count}`,
      type: "street",
      name: `Rua ${count}`,
      x: 80,
      y: 80 + count * 18,
      width: 340,
      height: 56,
    };
  }

  if (type === "location") {
    return {
      id: `location-${Date.now()}-${count}`,
      type: "location",
      name: `Local ${count}`,
      locationCode: "",
      x: 120,
      y: 120 + count * 18,
      width: 104,
      height: 44,
    };
  }

  return {
    id: `environment-${Date.now()}-${count}`,
    type: "environment",
    name: "Recebimento",
    environmentType: "Recebimento",
    color: colorsByEnvironment.Recebimento,
    x: 180,
    y: 160 + count * 18,
    width: 220,
    height: 120,
  };
};

const getElementMinimumSize = (element) => {
  const verticalStreet = element.type === "street" && Number(element.height) > Number(element.width);
  const horizontalStreet = element.type === "street" && !verticalStreet;

  return {
    width: verticalStreet ? 30 : 50,
    height: horizontalStreet ? 30 : 36,
  };
};

const clampElementToWarehouse = (element, warehouse) => {
  const minimum = getElementMinimumSize(element);
  const width = Math.min(Math.max(minimum.width, Number(element.width || minimum.width)), Math.max(minimum.width, warehouse.width - 56));
  const height = Math.min(Math.max(minimum.height, Number(element.height || minimum.height)), Math.max(minimum.height, warehouse.height - 56));

  return {
    ...element,
    width,
    height,
    x: Math.min(Math.max(28, Number(element.x || 28)), Math.max(28, warehouse.width - width - 28)),
    y: Math.min(Math.max(28, Number(element.y || 28)), Math.max(28, warehouse.height - height - 28)),
  };
};

export const WarehouseMapEditorPage = () => {
  const navigate = useNavigate();
  const [map, setMap] = useState(() => warehouseMapService.getMap());
  const [availableLocations] = useState(() => flattenLocationsForMap(locationsService.list()));
  const [selectedElementId, setSelectedElementId] = useState("");
  const [modalMode, setModalMode] = useState("");
  const [message, setMessage] = useState("");

  const selectedElement = map.elements.find((element) => element.id === selectedElementId) || null;

  const usedLocationCodes = useMemo(() => {
    const output = new Map();
    map.elements.forEach((element) => {
      if (element.type === "location" && element.locationCode) {
        output.set(element.locationCode, element.id);
      }
    });
    return output;
  }, [map.elements]);

  const openElementModal = (id) => {
    setSelectedElementId(id);
    setModalMode("element");
  };

  const addElement = (type) => {
    const element = createElement(type, map.elements.length + 1);
    setMap((current) => ({
      ...current,
      elements: [...current.elements, clampElementToWarehouse(element, current)],
    }));
    setSelectedElementId(element.id);
    setModalMode("");
    setMessage("Elemento adicionado. Para editar, clique duas vezes sobre ele.");
  };

  const changeElement = (id, patch) => {
    setMap((current) => ({
      ...current,
      elements: current.elements.map((element) => {
        if (element.id !== id) return element;
        const nextElement = { ...element, ...patch };
        if (patch.environmentType) {
          nextElement.color = colorsByEnvironment[patch.environmentType] || element.color;
          nextElement.name = patch.environmentType;
        }
        return clampElementToWarehouse(nextElement, current);
      }),
    }));
  };

  const deleteElement = (id) => {
    setMap((current) => ({
      ...current,
      elements: current.elements.filter((element) => element.id !== id),
    }));
    setSelectedElementId("");
    setModalMode("");
  };

  const changeWarehouse = (field, value) => {
    setMap((current) => {
      const warehouse = {
        ...current,
        [field]: Math.max(field === "width" ? 680 : 460, Number(value || 0)),
      };

      return {
        ...warehouse,
        elements: warehouse.elements.map((element) => clampElementToWarehouse(element, warehouse)),
      };
    });
  };

  const saveMap = () => {
    const locationWithoutCode = map.elements.find((element) => element.type === "location" && !element.locationCode);
    if (locationWithoutCode) {
      setSelectedElementId(locationWithoutCode.id);
      setModalMode("element");
      setMessage("Vincule o local cadastrado antes de salvar o mapa.");
      return;
    }

    const saved = warehouseMapService.saveMap(map);
    setMap(saved);
    setMessage("Mapa salvo no mock do front-end.");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#eef2f7",
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        overflow: "hidden",
      }}
    >
      <WarehouseMapSidebar
        onAddElement={addElement}
        message={message}
      />

      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          height: { xs: "calc(100vh - 250px)", md: "100vh" },
          p: { xs: 1.5, md: 2 },
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
        }}
      >
        <Stack direction="row" spacing={1} justifyContent="flex-end" alignItems="center">
          <WarehouseBackButton onClick={() => navigate("/dashboard")} />
          <WarehouseSaveButton onClick={saveMap} />
        </Stack>

        <WarehouseMapCanvas
          warehouse={map}
          elements={map.elements}
          selectedElementId={selectedElementId}
          onSelectElement={(id, shouldOpenModal) => {
            setSelectedElementId(id);
            if (shouldOpenModal) openElementModal(id);
          }}
          onOpenElementEditor={openElementModal}
          onOpenWarehouseEditor={() => {
            setSelectedElementId("warehouse");
            setModalMode("");
            setMessage("Redimensione o galpao pela alca visual no canto inferior direito.");
          }}
          onChangeElement={changeElement}
          onChangeWarehouse={changeWarehouse}
          onDeleteElement={deleteElement}
        />
      </Box>

      <WarehouseElementModal
        open={Boolean(modalMode)}
        mode={modalMode}
        warehouse={map}
        element={selectedElement}
        locations={availableLocations}
        usedLocationCodes={usedLocationCodes}
        onClose={() => setModalMode("")}
        onChangeElement={changeElement}
        onDeleteElement={deleteElement}
      />
    </Box>
  );
};
