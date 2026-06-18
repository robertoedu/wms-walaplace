import { mockPickingOrders } from "./pickingMockData.js";
import { mockReceivingNotes, mockStockItems, mockStockLocations, stockProducts } from "./mockData.js";
import { createMockStorage } from "./mockStorage.js";

const STORAGE_KEY = "wms_stock_database_v3";

const defaultLocationCodes = mockStockLocations.map((location) => location.code);

const createInitialProducts = () => {
  const products = new Map();
  const upsert = (product) => {
    const current = products.get(product.sku);
    products.set(product.sku, {
      id: current?.id || product.id || `STK-${product.sku}`,
      sku: product.sku,
      ean: product.ean || current?.ean || "",
      description: product.description || product.productName || current?.description || product.sku,
      currentLocation: product.currentLocation || product.locationCode || current?.currentLocation || "",
      quantity: Math.max(Number(current?.quantity || 0), Number(product.quantity ?? product.stockQty ?? 0)),
      packagingType: product.packagingType || current?.packagingType || "",
      status: "disponivel",
      updatedAt: current?.updatedAt || new Date().toISOString(),
    });
  };

  mockStockItems.forEach(upsert);
  stockProducts.forEach((product) => upsert({ ...product, quantity: 0 }));
  mockPickingOrders.flatMap((order) => order.items).forEach(upsert);

  mockReceivingNotes.flatMap((note) => note.items).forEach((item) => {
    const addressedQty = Number(item.addressedQty || 0);
    if (!products.has(item.sku)) upsert({ ...item, quantity: addressedQty });
    else if (addressedQty > 0) {
      const current = products.get(item.sku);
      products.set(item.sku, {
        ...current,
        quantity: Number(current.quantity || 0) + addressedQty,
        currentLocation: item.currentLocation || current.currentLocation,
      });
    }
  });

  return Array.from(products.values()).map((product, index) => ({
    ...product,
    currentLocation: product.currentLocation || defaultLocationCodes[index % defaultLocationCodes.length] || "",
  }));
};

const STORAGE_VERSION = 1;
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
  const savedSkus = new Set(database.products.map((product) => product.sku));
  const missing = defaults.filter((product) => !savedSkus.has(product.sku));

  if (missing.length) {
    database.products.push(...missing);
    write(database);
  }

  return database;
};

export const stockMockRepository = {
  listProducts() {
    return clone(read().products);
  },

  findBySku(sku) {
    const normalized = String(sku || "").trim().toLowerCase();
    const product = read().products.find((current) => current.sku.toLowerCase() === normalized);
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
    const product = database.products.find((current) => current.sku.toLowerCase() === String(sku).toLowerCase());
    if (!product || product.currentLocation?.toLowerCase() !== String(locationCode).toLowerCase()) {
      throw new Error("O produto não está armazenado neste local.");
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
    const existing = database.products.find((product) => product.sku.toLowerCase() === normalizedSku.toLowerCase());
    const eanOwner = database.products.find((product) => product.ean && product.ean === normalizedEan && product.sku !== existing?.sku);
    if (!normalizedSku || !normalizedEan || !String(data.description || "").trim()) throw new Error("Descrição, SKU e EAN são obrigatórios.");
    if (eanOwner) throw new Error("EAN já cadastrado para outro produto.");

    const product = {
      ...existing,
      ...data,
      id: existing?.id || data.id || `STK-${Date.now()}`,
      sku: normalizedSku,
      ean: normalizedEan,
      description: String(data.description).trim(),
      currentLocation: String(data.currentLocation || existing?.currentLocation || "").trim(),
      quantity: Number(data.quantity ?? existing?.quantity ?? 0),
      status: "disponivel",
      updatedAt: new Date().toISOString(),
    };
    if (!Number.isFinite(product.quantity) || product.quantity < 0) throw new Error("Quantidade de estoque inválida.");

    if (existing) database.products[database.products.indexOf(existing)] = product;
    else database.products.unshift(product);
    write(database);
    return clone(product);
  },

  updateQuantity(sku, quantity) {
    const product = this.findBySku(sku);
    if (!product) throw new Error("Produto não encontrado no estoque.");
    return this.saveProduct({ ...product, quantity });
  },

  adjustQuantity({ sku, quantity, locationCode, productData = {} }) {
    const database = read();
    const numericQuantity = Number(quantity);
    let product = database.products.find((current) => current.sku.toLowerCase() === String(sku).toLowerCase());
    if (!Number.isFinite(numericQuantity) || numericQuantity === 0) throw new Error("Movimentação de estoque inválida.");

    if (!product) {
      if (numericQuantity < 0) throw new Error("Produto não encontrado no estoque.");
      product = {
        id: `STK-${Date.now()}`,
        sku,
        ean: productData.ean || "",
        description: productData.description || productData.productName || sku,
        currentLocation: locationCode || "",
        quantity: 0,
        packagingType: productData.packagingType || "",
        status: "disponivel",
      };
      database.products.unshift(product);
    }

    const nextQuantity = Number(product.quantity || 0) + numericQuantity;
    if (nextQuantity < 0) throw new Error(`Saldo insuficiente. Disponível: ${product.quantity}.`);
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
