export const elementLabels = {
  location: "Local de estoque",
  aisle: "Rua",
  corridor: "Corredor",
  dock: "Doca",
  receiving: "Área de recebimento",
  picking: "Área de separação",
  packaging: "Área de embalagem",
  administrative: "Área administrativa",
  environment: "Ambiente",
  zone: "Zona operacional",
};

export const elementColors = {
  location: "#22c55e",
  aisle: "#64748b",
  corridor: "#475569",
  dock: "#2563eb",
  receiving: "#0ea5e9",
  picking: "#f97316",
  packaging: "#a855f7",
  administrative: "#14b8a6",
  environment: "#a855f7",
  zone: "#a855f7",
};

export const getLocationColor = (location) => {
  if (!location) return "#94a3b8";
  const percentage = location.capacity ? location.occupied / location.capacity : 0;
  if (percentage >= 0.9) return "#dc2626";
  if (percentage >= 0.7) return "#f59e0b";
  return "#22c55e";
};

export const buildLocationStats = (location, items = []) => {
  const quantity = items.reduce((total, item) => total + Number(item.quantity || 0), 0);
  const skuCount = items.length;
  const percentage = location?.capacity ? Math.round((location.occupied / location.capacity) * 100) : 0;
  const lastMovement = items.reduce((latest, item) => {
    if (!item.updatedAt) return latest;
    return !latest || item.updatedAt > latest ? item.updatedAt : latest;
  }, "");

  return {
    quantity,
    skuCount,
    percentage,
    lastMovement,
    status: percentage >= 90 ? "Crítico" : quantity > 0 ? "Ocupado" : "Livre",
  };
};

export const lineIntersection = (first, second) => {
  const x1 = Number(first.x);
  const y1 = Number(first.y);
  const x2 = Number(first.x2);
  const y2 = Number(first.y2);
  const x3 = Number(second.x);
  const y3 = Number(second.y);
  const x4 = Number(second.x2);
  const y4 = Number(second.y2);
  const denominator = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);

  if (Math.abs(denominator) < 0.001) return null;

  const px = ((x1 * y2 - y1 * x2) * (x3 - x4) - (x1 - x2) * (x3 * y4 - y3 * x4)) / denominator;
  const py = ((x1 * y2 - y1 * x2) * (y3 - y4) - (y1 - y2) * (x3 * y4 - y3 * x4)) / denominator;
  const withinFirst = px >= Math.min(x1, x2) - 1 && px <= Math.max(x1, x2) + 1 && py >= Math.min(y1, y2) - 1 && py <= Math.max(y1, y2) + 1;
  const withinSecond = px >= Math.min(x3, x4) - 1 && px <= Math.max(x3, x4) + 1 && py >= Math.min(y3, y4) - 1 && py <= Math.max(y3, y4) + 1;

  return withinFirst && withinSecond ? { x: px, y: py } : null;
};

export const calculateIntersections = (elements) => {
  const aisles = elements.filter((element) => element.shape === "line" && element.type === "aisle");
  const output = [];
  aisles.forEach((first, firstIndex) => {
    aisles.slice(firstIndex + 1).forEach((second) => {
      const point = lineIntersection(first, second);
      if (point) output.push({ id: `${first.id}-${second.id}`, ...point });
    });
  });
  return output;
};

