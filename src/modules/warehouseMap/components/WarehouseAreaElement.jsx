const isHorizontal = (street) => Number(street.width) >= Number(street.height);

const overlaps = (firstStart, firstEnd, secondStart, secondEnd) =>
  Math.max(firstStart, secondStart) < Math.min(firstEnd, secondEnd);

const mergeGaps = (gaps, start, end) => {
  const sortedGaps = gaps
    .map((gap) => ({ start: Math.max(start, gap.start), end: Math.min(end, gap.end) }))
    .filter((gap) => gap.end - gap.start > 1)
    .sort((first, second) => first.start - second.start);

  return sortedGaps.reduce((merged, gap) => {
    const last = merged[merged.length - 1];
    if (!last || gap.start > last.end) return [...merged, gap];
    return [...merged.slice(0, -1), { ...last, end: Math.max(last.end, gap.end) }];
  }, []);
};

const splitLine = ({ x1, y1, x2, y2 }, gaps) => {
  const horizontal = y1 === y2;
  const start = horizontal ? Math.min(x1, x2) : Math.min(y1, y2);
  const end = horizontal ? Math.max(x1, x2) : Math.max(y1, y2);
  const mergedGaps = mergeGaps(gaps, start, end);
  const segments = [];
  let cursor = start;

  mergedGaps.forEach((gap) => {
    if (gap.start > cursor) segments.push({ start: cursor, end: gap.start });
    cursor = Math.max(cursor, gap.end);
  });

  if (cursor < end) segments.push({ start: cursor, end });

  return segments.map((segment) => (
    horizontal
      ? { x1: segment.start, y1, x2: segment.end, y2 }
      : { x1, y1: segment.start, x2, y2: segment.end }
  ));
};

const getLineGaps = (element, line, streets) => {
  const horizontalLine = line.y1 === line.y2;
  return streets
    .filter((street) => street.id !== element.id && isHorizontal(street) !== horizontalLine)
    .filter((street) => {
      const streetX = Number(street.x);
      const streetY = Number(street.y);
      const streetWidth = Number(street.width);
      const streetHeight = Number(street.height);

      if (horizontalLine) {
        const lineY = line.y1;
        return lineY >= streetY && lineY <= streetY + streetHeight && overlaps(line.x1, line.x2, streetX, streetX + streetWidth);
      }

      const lineX = line.x1;
      return lineX >= streetX && lineX <= streetX + streetWidth && overlaps(line.y1, line.y2, streetY, streetY + streetHeight);
    })
    .map((street) => {
      const streetX = Number(street.x);
      const streetY = Number(street.y);
      return horizontalLine
        ? { start: streetX, end: streetX + Number(street.width) }
        : { start: streetY, end: streetY + Number(street.height) };
    });
};

export const WarehouseAreaElement = ({
  element,
  selected,
  streets = [],
  onMouseDown,
  onResizeMouseDown,
  onDoubleClick,
  onContextMenu,
}) => {
  const isStreet = element.type === "street";
  const isHorizontalStreet = isHorizontal(element);
  const fill = isStreet ? "#cbd5e1" : element.color || "#8b5cf6";
  const textColor = isStreet ? "#475569" : "#334155";
  const x = Number(element.x);
  const y = Number(element.y);
  const width = Number(element.width);
  const height = Number(element.height);
  const labelText = isStreet ? element.name : element.environmentType || element.name;
  const labelFontSize = Math.max(10, Math.min(20, Math.min(width, height) / (isStreet ? 3 : 7)));
  const labelX = x + width;
  const labelY = y - 6;

  if (isStreet) {
    const firstLine = isHorizontalStreet
      ? { x1: x, y1: y, x2: x + width, y2: y }
      : { x1: x, y1: y, x2: x, y2: y + height };
    const secondLine = isHorizontalStreet
      ? { x1: x, y1: y + height, x2: x + width, y2: y + height }
      : { x1: x + width, y1: y, x2: x + width, y2: y + height };
    const lines = [firstLine, secondLine].flatMap((line) => splitLine(line, getLineGaps(element, line, streets)));
    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill="transparent"
          stroke={selected ? "#f97316" : "transparent"}
          strokeWidth={selected ? 3 : 0}
          onMouseDown={onMouseDown}
          onDoubleClick={onDoubleClick}
          onContextMenu={onContextMenu}
          style={{ cursor: "move" }}
        />
        {lines.map((line, index) => (
          <line
            key={`${element.id}-line-${index}`}
            {...line}
            stroke={selected ? "#111827" : "#475569"}
            strokeWidth={selected ? 4 : 3}
            strokeLinecap="square"
            pointerEvents="none"
          />
        ))}
        <text
          x={labelX}
          y={labelY}
          textAnchor="end"
          fontSize={labelFontSize}
          fontWeight="800"
          fill={textColor}
          pointerEvents="none"
        >
          {labelText}
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
  }

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx="14"
        fill={fill}
        fillOpacity="0.24"
        stroke={selected ? "#111827" : fill}
        strokeWidth={selected ? 5 : 2}
        onMouseDown={onMouseDown}
        onDoubleClick={onDoubleClick}
        onContextMenu={onContextMenu}
        style={{ cursor: "move" }}
      />
      <text
        x={labelX}
        y={labelY}
        textAnchor="end"
        fontSize={labelFontSize}
        fontWeight="900"
        fill={textColor}
        pointerEvents="none"
      >
        {labelText}
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
