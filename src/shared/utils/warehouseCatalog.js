export const WAREHOUSES = [
  { id: "742", label: "742 Jardim Europa" },
  { id: "288", label: "288 Subida Friz e frida" },
];

export const DEFAULT_WAREHOUSE_ID = "742";
export const SUPPORT_WAREHOUSE_ID = "288";

export const getWarehouseLabel = (warehouseId) =>
  WAREHOUSES.find((warehouse) => warehouse.id === warehouseId)?.label ||
  warehouseId ||
  "-";

export const getTransferConfirmPermission = (warehouseId) =>
  `transfer_confirm_${warehouseId}`;
