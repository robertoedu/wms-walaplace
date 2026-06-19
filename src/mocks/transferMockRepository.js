import { createMockStorage } from "./mockStorage.js";
import { mockPendingStockTransfers } from "./mockData.js";
import { getWarehouseLabel } from "../shared/utils/warehouseCatalog.js";
import { wmsMockRepository } from "./wmsMockRepository.js";
import { stockMockRepository } from "./stockMockRepository.js";

const STORAGE_KEY = "wms_transfer_database_v1";
const STORAGE_VERSION = 2;

const createInitialTransfers = () => mockPendingStockTransfers.map((transfer) => ({
  ...transfer,
  status: "pendente",
  fromWarehouseName: getWarehouseLabel(transfer.fromWarehouseId),
  toWarehouseName: getWarehouseLabel(transfer.toWarehouseId),
  confirmedAt: null,
}));

const storage = createMockStorage({
  key: STORAGE_KEY,
  version: STORAGE_VERSION,
  eventName: "wms-transfer-change",
  createInitial: () => ({ version: STORAGE_VERSION, transfers: createInitialTransfers() }),
});

const { clone, write, reset } = storage;

const read = () => storage.read();

export const transferMockRepository = {
  listTransfers() {
    return clone(read().transfers);
  },

  findPendingTransfer({ sku, fromWarehouseId, toWarehouseId }) {
    const normalizedSku = String(sku || "").trim().toLowerCase();
    const transfer = read().transfers.find((current) =>
      current.status === "pendente" &&
      current.sku.toLowerCase() === normalizedSku &&
      current.fromWarehouseId === fromWarehouseId &&
      current.toWarehouseId === toWarehouseId,
    );
    return transfer ? clone(transfer) : null;
  },

  createTransfer({ product, fromWarehouseId, toWarehouseId, quantity }) {
    const numericQuantity = Number(quantity);
    if (!Number.isFinite(numericQuantity) || numericQuantity <= 0) {
      throw new Error("Informe uma quantidade valida.");
    }

    const database = read();
    const transfer = {
      id: `TRF-${Date.now()}`,
      status: "pendente",
      sku: product.sku,
      description: product.description || product.productName || product.sku,
      ean: product.ean || "",
      quantity: numericQuantity,
      sourceProductId: product.id || "",
      sourceLocation: product.currentLocation || "",
      fromWarehouseId,
      fromWarehouseName: getWarehouseLabel(fromWarehouseId),
      toWarehouseId,
      toWarehouseName: getWarehouseLabel(toWarehouseId),
      createdAt: new Date().toISOString(),
      confirmedAt: null,
    };

    database.transfers.unshift(transfer);
    write(database);
    return clone(transfer);
  },

  confirmTransfer(transferId, { canConfirmWarehouseIds = [] } = {}) {
    const database = read();
    const transfer = database.transfers.find((current) => current.id === transferId);

    if (!transfer) throw new Error("Transferencia nao encontrada.");
    if (transfer.status !== "pendente") throw new Error("Transferencia ja confirmada.");
    if (!canConfirmWarehouseIds.includes(transfer.toWarehouseId)) {
      throw new Error("Somente o estoque recebedor pode confirmar esta transferencia.");
    }

    transfer.status = "confirmada";
    transfer.confirmedAt = new Date().toISOString();
    stockMockRepository.clearTransferPending({
      sku: transfer.sku,
      warehouseId: transfer.fromWarehouseId,
      productId: transfer.sourceProductId,
      locationCode: transfer.sourceLocation,
      quantity: transfer.quantity,
    });
    const note = wmsMockRepository.createWarehouseTransferNote({
      product: {
        sku: transfer.sku,
        description: transfer.description,
        ean: transfer.ean,
        quantity: transfer.quantity,
      },
      fromWarehouseId: transfer.fromWarehouseId,
      toWarehouseId: transfer.toWarehouseId,
    });

    transfer.addressingNoteId = note.id;
    write(database);
    return clone(transfer);
  },

  reset() {
    return reset();
  },
};
