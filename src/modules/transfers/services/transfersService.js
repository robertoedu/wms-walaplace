import { transferMockRepository } from "../../../mocks/transferMockRepository.js";
import { WAREHOUSES, getTransferConfirmPermission } from "../../../shared/utils/warehouseCatalog.js";

const getConfirmableWarehouses = (user) => {
  if (user?.role === "admin") return WAREHOUSES.map((warehouse) => warehouse.id);
  const permissions = new Set(user?.permissions || []);
  return WAREHOUSES
    .filter((warehouse) => permissions.has(getTransferConfirmPermission(warehouse.id)))
    .map((warehouse) => warehouse.id);
};

export const transfersService = {
  listTransfers: () => transferMockRepository.listTransfers(),
  confirmTransfer: (transferId, user) => transferMockRepository.confirmTransfer(
    transferId,
    { canConfirmWarehouseIds: getConfirmableWarehouses(user) },
  ),
};
