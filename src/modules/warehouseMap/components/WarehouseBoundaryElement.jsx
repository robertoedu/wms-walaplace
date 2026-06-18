export const WarehouseBoundaryElement = ({ width, height, selected, onResizeMouseDown, onDoubleClick }) => (
  <g onDoubleClick={onDoubleClick}>
    <rect data-empty="true" x="12" y="12" width={width - 24} height={height - 24} rx="24" fill="#ffffff" stroke="#111827" strokeWidth="7" />
    <rect data-empty="true" x="18" y="18" width={width - 36} height={height - 36} rx="18" fill="url(#warehouse-grid)" opacity="0.82" />
    <text x="34" y="50" fontSize="18" fontWeight="900" fill="#334155" pointerEvents="none">GALPAO</text>
    {selected ? (
      <rect
        x={width - 24}
        y={height - 24}
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
