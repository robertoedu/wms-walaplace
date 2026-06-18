import { useRef, useState } from "react";
import { Box, Button, Paper, Stack } from "@mui/material";
import { WarehouseAreaElement } from "./WarehouseAreaElement";
import { WarehouseBoundaryElement } from "./WarehouseBoundaryElement";
import { WarehouseLocationElement } from "./WarehouseLocationElement";

const toSvgPoint = (event, svg) => {
  const point = svg.createSVGPoint();
  point.x = event.clientX;
  point.y = event.clientY;
  return point.matrixTransform(svg.getScreenCTM().inverse());
};

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export const WarehouseMapCanvas = ({
  warehouse,
  elements,
  selectedElementId,
  onSelectElement,
  onOpenElementEditor,
  onOpenWarehouseEditor,
  onChangeElement,
  onChangeWarehouse,
  onDeleteElement,
}) => {
  const containerRef = useRef(null);
  const svgRef = useRef(null);
  const [interaction, setInteraction] = useState(null);
  const [viewBox, setViewBox] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const activeViewBox = viewBox || { x: 0, y: 0, width: warehouse.width, height: warehouse.height };
  const orderedElements = [
    ...elements.filter((element) => element.type === "street"),
    ...elements.filter((element) => element.type === "environment"),
    ...elements.filter((element) => element.type === "location"),
  ];
  const streets = elements.filter((element) => element.type === "street");

  const startInteraction = (event, action, element) => {
    event.stopPropagation();
    if (!svgRef.current) return;

    const point = toSvgPoint(event, svgRef.current);
    setContextMenu(null);
    onSelectElement(element.id);
    setInteraction({
      action,
      element,
      startX: point.x,
      startY: point.y,
      moved: false,
    });
  };

  const moveInteraction = (event) => {
    if (!interaction || !svgRef.current) return;

    const point = toSvgPoint(event, svgRef.current);
    const dx = point.x - interaction.startX;
    const dy = point.y - interaction.startY;
    const moved = interaction.moved || Math.abs(dx) > 2 || Math.abs(dy) > 2;
    const original = interaction.element;

    if (interaction.action === "resize") {
      if (original.type === "warehouse") {
        onChangeWarehouse("width", Math.max(680, Math.round(original.width + dx)));
        onChangeWarehouse("height", Math.max(460, Math.round(original.height + dy)));
        if (moved !== interaction.moved) {
          setInteraction((current) => ({ ...current, moved }));
        }
        return;
      }

      const verticalStreet = original.type === "street" && Number(original.height) > Number(original.width);
      const horizontalStreet = original.type === "street" && !verticalStreet;
      const minWidth = verticalStreet ? 30 : 50;
      const minHeight = horizontalStreet ? 30 : 36;
      const width = clamp(Math.round(original.width + dx), minWidth, warehouse.width - original.x - 28);
      const height = clamp(Math.round(original.height + dy), minHeight, warehouse.height - original.y - 28);
      onChangeElement(original.id, { width, height });
    } else {
      const x = clamp(Math.round(original.x + dx), 28, warehouse.width - original.width - 28);
      const y = clamp(Math.round(original.y + dy), 28, warehouse.height - original.height - 28);
      onChangeElement(original.id, { x, y });
    }

    if (moved !== interaction.moved) {
      setInteraction((current) => ({ ...current, moved }));
    }
  };

  const stopInteraction = () => {
    if (!interaction) return;
    if (!interaction.moved && interaction.element.type !== "warehouse") onSelectElement(interaction.element.id);
    setInteraction(null);
  };

  const clearSelection = (event) => {
    setContextMenu(null);
    if (event.target === svgRef.current || event.target.dataset.empty === "true") {
      onSelectElement("");
    }
  };

  const openContextMenu = (event, element) => {
    event.preventDefault();
    event.stopPropagation();
    if (!containerRef.current) return;

    const bounds = containerRef.current.getBoundingClientRect();
    onSelectElement(element.id);
    setContextMenu({
      id: element.id,
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
    });
  };

  const deleteFromContextMenu = () => {
    if (!contextMenu) return;
    onDeleteElement(contextMenu.id);
    setContextMenu(null);
  };

  const handleWheel = (event) => {
    event.preventDefault();
    if (!svgRef.current) return;

    const point = toSvgPoint(event, svgRef.current);
    const factor = event.deltaY < 0 ? 0.88 : 1.14;
    const nextWidth = clamp(activeViewBox.width * factor, warehouse.width * 0.28, warehouse.width);
    const nextHeight = clamp(activeViewBox.height * factor, warehouse.height * 0.28, warehouse.height);
    const ratioX = (point.x - activeViewBox.x) / activeViewBox.width;
    const ratioY = (point.y - activeViewBox.y) / activeViewBox.height;
    const nextX = clamp(point.x - nextWidth * ratioX, 0, warehouse.width - nextWidth);
    const nextY = clamp(point.y - nextHeight * ratioY, 0, warehouse.height - nextHeight);

    setViewBox({ x: nextX, y: nextY, width: nextWidth, height: nextHeight });
  };

  return (
    <Paper
      elevation={0}
      ref={containerRef}
      sx={{
        position: "relative",
        flex: 1,
        minHeight: 0,
        border: "1px solid #dbe4f0",
        borderRadius: 4,
        bgcolor: "#f8fafc",
        overflow: "auto",
      }}
    >
      <Box sx={{ width: "100%", height: "100%" }}>
        <svg
          ref={svgRef}
          viewBox={`${activeViewBox.x} ${activeViewBox.y} ${activeViewBox.width} ${activeViewBox.height}`}
          width="100%"
          height="100%"
          preserveAspectRatio="none"
          onMouseDown={clearSelection}
          onContextMenu={(event) => event.preventDefault()}
          onWheel={handleWheel}
          onMouseMove={moveInteraction}
          onMouseUp={stopInteraction}
          onMouseLeave={stopInteraction}
          style={{ display: "block", height: "100%" }}
        >
          <defs>
            <pattern id="warehouse-grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e5e7eb" strokeWidth="1" />
            </pattern>
          </defs>

          <WarehouseBoundaryElement
            width={warehouse.width}
            height={warehouse.height}
            selected={selectedElementId === "warehouse"}
            onResizeMouseDown={(event) => startInteraction(event, "resize", { ...warehouse, id: "warehouse", type: "warehouse" })}
            onDoubleClick={(event) => {
              event.stopPropagation();
              onOpenWarehouseEditor();
            }}
          />

          {orderedElements.map((element) => {
            const selected = selectedElementId === element.id;
            const handlers = {
              onMouseDown: (event) => startInteraction(event, "move", element),
              onResizeMouseDown: (event) => startInteraction(event, "resize", element),
              onDoubleClick: (event) => {
                event.stopPropagation();
                onOpenElementEditor(element.id);
              },
              onContextMenu: (event) => openContextMenu(event, element),
            };

            if (element.type === "location") {
              return <WarehouseLocationElement key={element.id} element={element} selected={selected} {...handlers} />;
            }

            return <WarehouseAreaElement key={element.id} element={element} selected={selected} streets={streets} {...handlers} />;
          })}
        </svg>
      </Box>

      {contextMenu ? (
        <Paper
          elevation={6}
          sx={{
            position: "absolute",
            left: contextMenu.x,
            top: contextMenu.y,
            zIndex: 5,
            minWidth: 132,
            p: 0.75,
            borderRadius: 2,
            border: "1px solid #e2e8f0",
          }}
          onMouseDown={(event) => event.stopPropagation()}
        >
          <Stack spacing={0.5}>
            <Button color="error" onClick={deleteFromContextMenu} sx={{ justifyContent: "flex-start", fontWeight: 800 }}>
              Excluir
            </Button>
          </Stack>
        </Paper>
      ) : null}
    </Paper>
  );
};
