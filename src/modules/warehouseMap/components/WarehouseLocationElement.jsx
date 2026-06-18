export const WarehouseLocationElement = ({ element, selected, onMouseDown, onResizeMouseDown, onDoubleClick, onContextMenu }) => {
  const code = element.locationCode || "Sem local";
  const x = Number(element.x);
  const y = Number(element.y);
  const width = Number(element.width);
  const height = Number(element.height);
  const availableWidth = Math.max(22, width - 10);
  const fontSize = Math.max(8, Math.min(14, availableWidth / Math.max(1, code.length * 0.62)));
  const estimatedTextWidth = code.length * fontSize * 0.62;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx="7"
        fill={element.locationCode ? "#16a34a" : "#94a3b8"}
        stroke={selected ? "#111827" : "#15803d"}
        strokeWidth={selected ? 4 : 2}
        onMouseDown={onMouseDown}
        onDoubleClick={onDoubleClick}
        onContextMenu={onContextMenu}
        style={{ cursor: "move" }}
      />
      <text
        x={x + width / 2}
        y={y + height / 2 + fontSize / 3}
        textAnchor="middle"
        fontSize={fontSize}
        fontWeight="900"
        fill="#ffffff"
        textLength={estimatedTextWidth > availableWidth ? availableWidth : undefined}
        lengthAdjust="spacingAndGlyphs"
        pointerEvents="none"
      >
        {code}
      </text>
      {selected ? (
        <rect
          x={x + width - 7}
          y={y + height - 7}
          width="12"
          height="12"
          rx="3"
          fill="#f97316"
          stroke="#111827"
          strokeWidth="2"
          onMouseDown={onResizeMouseDown}
          style={{ cursor: "nwse-resize" }}
        />
      ) : null}
    </g>
  );
};
