import { stockMockRepository } from "./stockMockRepository.js";
import { createMockStorage } from "./mockStorage.js";

export const PACKAGING_TYPES = [
  {
    id: "papel_pardo",
    label: "Papel pardo",
    helper: "Produtos que precisam de protecao simples antes da expedicao.",
    color: "#b45309",
    bgColor: "#fffbeb",
    borderColor: "#fcd34d",
  },
  {
    id: "bolha",
    label: "Bolha",
    helper: "Itens frageis ou com acabamento sensivel.",
    color: "#2563eb",
    bgColor: "#eff6ff",
    borderColor: "#93c5fd",
  },
  {
    id: "pronto",
    label: "Pronto",
    helper: "Itens que nao precisam ser embalados.",
    color: "#15803d",
    bgColor: "#f0fdf4",
    borderColor: "#86efac",
  },
];

const STORAGE_KEY = "wms_packaging_types_v1";
const STORAGE_VERSION = 1;

const chooseInitialType = (product) => {
  const text = `${product.description || ""} ${product.packagingType || ""}`.toLowerCase();
  if (/(prato|xicara|porcelana|vidro|fragil|divisoria|reforcada)/.test(text)) return "bolha";
  if (/(cadeira|gazebo|cooler|caixa|volumosa|grande)/.test(text)) return "pronto";
  return "papel_pardo";
};

const createAssignments = () =>
  stockMockRepository.listProducts().map((product) => ({
    sku: product.sku,
    packagingType: chooseInitialType(product),
    updatedAt: new Date().toISOString(),
  }));

const storage = createMockStorage({
  key: STORAGE_KEY,
  version: STORAGE_VERSION,
  eventName: "wms-packaging-types-change",
  createInitial: () => ({
    version: STORAGE_VERSION,
    assignments: createAssignments(),
  }),
});

const { clone, write, reset } = storage;

const read = () => {
  const database = storage.read();
  const currentProducts = stockMockRepository.listProducts();
  const knownSkus = new Set(database.assignments.map((item) => item.sku));
  const missing = currentProducts
    .filter((product) => !knownSkus.has(product.sku))
    .map((product) => ({
      sku: product.sku,
      packagingType: chooseInitialType(product),
      updatedAt: new Date().toISOString(),
    }));

  if (missing.length) {
    database.assignments.push(...missing);
    write(database);
  }

  return database;
};

export const packagingTypesMockRepository = {
  listTypes() {
    return clone(PACKAGING_TYPES);
  },

  listAssignments() {
    return clone(read().assignments);
  },

  saveAssignment(sku, packagingType) {
    const typeExists = PACKAGING_TYPES.some((type) => type.id === packagingType);
    if (!typeExists) throw new Error("Tipo de embalagem invalido.");

    const database = read();
    const existing = database.assignments.find((item) => item.sku === sku);
    const nextAssignment = {
      sku,
      packagingType,
      updatedAt: new Date().toISOString(),
    };

    if (existing) database.assignments[database.assignments.indexOf(existing)] = nextAssignment;
    else database.assignments.unshift(nextAssignment);

    write(database);
    return clone(nextAssignment);
  },

  reset() {
    return reset();
  },
};
