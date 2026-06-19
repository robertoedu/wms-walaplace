import { mockPickingOrders } from "./pickingMockData.js";
import { mockReceivingNotes, mockSecondaryStockItems, mockStockItems, mockStockLocations, stockProducts } from "./mockData.js";
import { createMockStorage } from "./mockStorage.js";
import { DEFAULT_WAREHOUSE_ID } from "../shared/utils/warehouseCatalog.js";

const STORAGE_KEY = "wms_stock_database_v4";

const defaultLocationCodes = mockStockLocations.map((location) => location.code);

const createInitialProducts = () => {
  const products = new Map();
  const upsert = (product) => {
    const warehouseId = product.warehouseId || DEFAULT_WAREHOUSE_ID;
    const productKey = `${warehouseId}:${product.sku}`;
    const current = products.get(productKey);
    products.set(productKey, {
      id: current?.id || product.id || `STK-${product.sku}`,
      warehouseId,
      sku: product.sku,
      ean: product.ean || current?.ean || "",
      description: product.description || product.productName || current?.description || product.sku,
      currentLocation: product.currentLocation || product.locationCode || current?.currentLocation || "",
      quantity: Math.max(Number(current?.quantity || 0), Number(product.quantity ?? product.stockQty ?? 0)),
      transferPendingQty: Number(current?.transferPendingQty || product.transferPendingQty || 0),
      packagingType: product.packagingType || current?.packagingType || "",
      status: "disponivel",
      updatedAt: current?.updatedAt || new Date().toISOString(),
    });
  };

  mockStockItems.forEach((product) => upsert({ ...product, warehouseId: DEFAULT_WAREHOUSE_ID }));
  stockProducts.forEach((product) => upsert({ ...product, warehouseId: DEFAULT_WAREHOUSE_ID, quantity: 0 }));
  const secondarySkus = new Set(mockSecondaryStockItems.map((product) => product.sku));
  mockPickingOrders
    .flatMap((order) => order.items)
    .filter((product) => !secondarySkus.has(product.sku))
    .forEach((product) => upsert({ ...product, warehouseId: DEFAULT_WAREHOUSE_ID }));
  mockSecondaryStockItems.forEach((product) => upsert({ ...product, warehouseId: "288" }));

  mockReceivingNotes.forEach((note) => {
    note.items.forEach((item) => {
      const addressedQty = Number(item.addressedQty || 0);
      const warehouseId = item.warehouseId || note.warehouseId || DEFAULT_WAREHOUSE_ID;
      const productKey = `${warehouseId}:${item.sku}`;
      if (!products.has(productKey)) upsert({ ...item, warehouseId, quantity: addressedQty });
      else if (addressedQty > 0) {
        const current = products.get(productKey);
        products.set(productKey, {
          ...current,
          quantity: Number(current.quantity || 0) + addressedQty,
          currentLocation: item.currentLocation || current.currentLocation,
        });
      }
    });
  });

  return Array.from(products.values()).map((product, index) => ({
    ...product,
    currentLocation: product.currentLocation || defaultLocationCodes[index % defaultLocationCodes.length] || "",
  }));
};

const STORAGE_VERSION = 2;
const storage = createMockStorage({
  key: STORAGE_KEY,
  version: STORAGE_VERSION,
  eventName: "wms-stock-change",
  createInitial: () => ({ version: STORAGE_VERSION, products: createInitialProducts() }),
});

const { clone, write, reset } = storage;

const read = () => {
  const database = storage.read();
  const defaults = createInitialProducts();
  const savedProducts = new Set(
    database.products.map((product) => `${product.warehouseId || DEFAULT_WAREHOUSE_ID}:${product.sku}`),
  );
  const missing = defaults.filter((product) => !savedProducts.has(`${product.warehouseId || DEFAULT_WAREHOUSE_ID}:${product.sku}`));

  if (missing.length) {
    database.products.push(...missing);
    write(database);
  }

  return database;
};

const findProductRecord = (database, { sku, warehouseId = DEFAULT_WAREHOUSE_ID, productId = "" }) =>
  database.products.find((current) => (
    productId
      ? String(current.id) === String(productId)
      : current.sku.toLowerCase() === String(sku || "").trim().toLowerCase() &&
        (current.warehouseId || DEFAULT_WAREHOUSE_ID) === warehouseId
  ));

const createSplitProduct = ({ product, warehouseId, locationCode, quantity }) => ({
  ...clone(product),
  id: `STK-${product.sku}-${warehouseId}-${Date.now()}`,
  currentLocation: locationCode,
  quantity,
  updatedAt: new Date().toISOString(),
});

export const stockMockRepository = {
  listProducts() {
    return clone(read().products);
  },

  findBySku(sku, warehouseId = DEFAULT_WAREHOUSE_ID, locationCode = "") {
    const normalized = String(sku || "").trim().toLowerCase();
    const normalizedLocation = String(locationCode || "").trim().toLowerCase();
    const product = read().products.find((current) =>
      current.sku.toLowerCase() === normalized &&
      (current.warehouseId || DEFAULT_WAREHOUSE_ID) === warehouseId &&
      (!normalizedLocation || String(current.currentLocation || "").toLowerCase() === normalizedLocation),
    );
    return product ? clone(product) : null;
  },

  listByLocation(locationCode) {
    const normalized = String(locationCode || "").trim().toLowerCase();
    return clone(read().products.filter(
      (product) => product.currentLocation?.toLowerCase() === normalized && Number(product.quantity) > 0,
    ));
  },

  removeFromLocation(sku, locationCode) {
    const database = read();
    const product = database.products.find((current) =>
      current.sku.toLowerCase() === String(sku).toLowerCase() &&
      current.currentLocation?.toLowerCase() === String(locationCode).toLowerCase(),
    );
    if (!product || product.currentLocation?.toLowerCase() !== String(locationCode).toLowerCase()) {
      throw new Error("O produto nao esta armazenado neste local.");
    }
    product.currentLocation = "";
    product.updatedAt = new Date().toISOString();
    write(database);
    return clone(product);
  },

  saveProduct(data) {
    const database = read();
    const normalizedSku = String(data.sku || "").trim();
    const normalizedEan = String(data.ean || "").trim();
    const warehouseId = data.warehouseId || DEFAULT_WAREHOUSE_ID;
    const existing = database.products.find((product) =>
      product.sku.toLowerCase() === normalizedSku.toLowerCase() &&
      (product.warehouseId || DEFAULT_WAREHOUSE_ID) === warehouseId,
    );
    const eanOwner = normalizedEan
      ? database.products.find((product) => product.ean && product.ean === normalizedEan && product.sku !== existing?.sku)
      : null;
    if (!normalizedSku || !String(data.description || "").trim()) throw new Error("Descricao e SKU sao obrigatorios.");
    if (eanOwner) throw new Error("EAN ja cadastrado para outro produto.");

    const product = {
      ...existing,
      ...data,
      id: existing?.id || data.id || `STK-${Date.now()}`,
      warehouseId,
      sku: normalizedSku,
      ean: normalizedEan,
      description: String(data.description).trim(),
      currentLocation: String(data.currentLocation || existing?.currentLocation || "").trim(),
      quantity: Number(data.quantity ?? existing?.quantity ?? 0),
      transferPendingQty: Number(data.transferPendingQty ?? existing?.transferPendingQty ?? 0),
      status: "disponivel",
      updatedAt: new Date().toISOString(),
    };
    if (!Number.isFinite(product.quantity) || product.quantity < 0) throw new Error("Quantidade de estoque invalida.");

    if (existing) database.products[database.products.indexOf(existing)] = product;
    else database.products.unshift(product);
    write(database);
    return clone(product);
  },

  updateQuantity(sku, quantity, warehouseId = DEFAULT_WAREHOUSE_ID, productId = "") {
    const database = read();
    const product = findProductRecord(database, { sku, warehouseId, productId });
    if (!product) throw new Error("Produto nao encontrado no estoque.");

    const nextQuantity = Number(quantity);
    if (!Number.isFinite(nextQuantity) || nextQuantity < 0) throw new Error("Quantidade de estoque invalida.");

    product.quantity = nextQuantity;
    if (nextQuantity === 0) product.currentLocation = "";
    product.updatedAt = new Date().toISOString();
    write(database);
    return clone(product);
  },

  updateLocation({ sku, warehouseId = DEFAULT_WAREHOUSE_ID, productId = "", locationCode, quantity }) {
    const database = read();
    const product = findProductRecord(database, { sku, warehouseId, productId });

    if (!product) throw new Error("Produto nao encontrado no estoque.");
    if (!String(locationCode || "").trim()) throw new Error("Informe a nova localizacao.");

    const normalizedLocation = String(locationCode).trim();
    const moveQuantity = Number(quantity);
    const availableQuantity = Number(product.quantity || 0);
    const productWarehouseId = product.warehouseId || warehouseId;

    if (!Number.isFinite(moveQuantity) || moveQuantity <= 0) throw new Error("Informe uma quantidade valida.");
    if (moveQuantity > availableQuantity) throw new Error(`Saldo insuficiente. Disponivel: ${availableQuantity}.`);
    if (product.currentLocation?.toLowerCase() === normalizedLocation.toLowerCase()) {
      throw new Error("Informe uma localizacao diferente da atual.");
    }

    if (moveQuantity === availableQuantity) {
      product.currentLocation = normalizedLocation;
      product.updatedAt = new Date().toISOString();
      write(database);
      return clone(product);
    }

    product.quantity = availableQuantity - moveQuantity;
    product.updatedAt = new Date().toISOString();

    const targetProduct = database.products.find((current) =>
      String(current.id) !== String(product.id) &&
      current.sku.toLowerCase() === product.sku.toLowerCase() &&
      (current.warehouseId || DEFAULT_WAREHOUSE_ID) === productWarehouseId &&
      current.currentLocation?.toLowerCase() === normalizedLocation.toLowerCase(),
    );

    if (targetProduct) {
      targetProduct.quantity = Number(targetProduct.quantity || 0) + moveQuantity;
      targetProduct.updatedAt = new Date().toISOString();
    } else {
      database.products.unshift(createSplitProduct({
        product,
        warehouseId: productWarehouseId,
        locationCode: normalizedLocation,
        quantity: moveQuantity,
      }));
    }

    write(database);
    return clone(product);
  },

  transferOut({ sku, warehouseId = DEFAULT_WAREHOUSE_ID, productId = "", quantity }) {
    const database = read();
    const product = findProductRecord(database, { sku, warehouseId, productId });

    if (!product) throw new Error("Produto nao encontrado no estoque.");
    const availableQuantity = Number(product.quantity || 0);
    const transferQuantity = Number(quantity);
    if (availableQuantity <= 0) throw new Error("Produto sem saldo para transferir.");
    if (!Number.isFinite(transferQuantity) || transferQuantity <= 0) throw new Error("Informe uma quantidade valida.");
    if (transferQuantity > availableQuantity) throw new Error(`Saldo insuficiente. Disponivel: ${availableQuantity}.`);

    const transferredProduct = clone(product);
    product.quantity = availableQuantity - transferQuantity;
    product.transferPendingQty = Number(product.transferPendingQty || 0) + transferQuantity;
    if (product.quantity === 0 && Number(product.transferPendingQty || 0) === 0) product.currentLocation = "";
    product.updatedAt = new Date().toISOString();
    write(database);
    return { ...transferredProduct, quantity: transferQuantity };
  },

  clearTransferPending({ sku, warehouseId = DEFAULT_WAREHOUSE_ID, productId = "", locationCode = "", quantity }) {
    const database = read();
    const product = productId
      ? findProductRecord(database, { sku, warehouseId, productId })
      : database.products.find((current) =>
          current.sku.toLowerCase() === String(sku || "").trim().toLowerCase() &&
          (current.warehouseId || DEFAULT_WAREHOUSE_ID) === warehouseId &&
          (!locationCode || String(current.currentLocation || "").toLowerCase() === String(locationCode).toLowerCase()),
        );

    if (!product) return null;

    const numericQuantity = Number(quantity);
    product.transferPendingQty = Math.max(0, Number(product.transferPendingQty || 0) - numericQuantity);
    if (Number(product.quantity || 0) === 0 && Number(product.transferPendingQty || 0) === 0) {
      product.currentLocation = "";
    }
    product.updatedAt = new Date().toISOString();
    write(database);
    return clone(product);
  },

  adjustQuantity({ sku, quantity, locationCode, productData = {} }) {
    const database = read();
    const numericQuantity = Number(quantity);
    const warehouseId = productData.warehouseId || DEFAULT_WAREHOUSE_ID;
    const normalizedSku = String(sku).toLowerCase();
    const normalizedLocation = String(locationCode || "").trim().toLowerCase();
    let product = database.products.find((current) =>
      current.sku.toLowerCase() === normalizedSku &&
      (current.warehouseId || DEFAULT_WAREHOUSE_ID) === warehouseId &&
      (!normalizedLocation || String(current.currentLocation || "").toLowerCase() === normalizedLocation),
    );
    if (!Number.isFinite(numericQuantity) || numericQuantity === 0) throw new Error("Movimentacao de estoque invalida.");

    if (!product) {
      if (numericQuantity < 0) throw new Error("Produto nao encontrado no estoque.");
      product = {
        id: `STK-${Date.now()}`,
        warehouseId,
        sku,
        ean: productData.ean || "",
        description: productData.description || productData.productName || sku,
        currentLocation: locationCode || "",
        quantity: 0,
        transferPendingQty: 0,
        packagingType: productData.packagingType || "",
        status: "disponivel",
      };
      database.products.unshift(product);
    }

    const nextQuantity = Number(product.quantity || 0) + numericQuantity;
    if (nextQuantity < 0) throw new Error(`Saldo insuficiente. Disponivel: ${product.quantity}.`);
    product.quantity = nextQuantity;
    product.currentLocation = locationCode || product.currentLocation;
    product.updatedAt = new Date().toISOString();
    write(database);
    return clone(product);
  },

  reset() {
    return reset();
  },
};
