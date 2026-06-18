import { pickingStatusFilterOptions } from "../../../shared/utils/statusCatalog.js";

export const PICKING_QUEUE_PREFERENCES_STORAGE_KEY = "wms_picking_queue_preferences";

export const DEFAULT_PICKING_QUEUE_PREFERENCES = {
  mode: "items",
  search: "",
  marketplace: "Todos",
  status: "attention",
};

const VALID_MODES = new Set(["items", "orders"]);
const VALID_MARKETPLACES = new Set(["Todos", "Mercado Livre", "Shopee", "Amazon", "Site", "Manual"]);
const VALID_STATUSES = new Set(pickingStatusFilterOptions.map((option) => option.value));

export const normalizePickingQueuePreferences = (value = {}) => ({
  mode: VALID_MODES.has(value.mode) ? value.mode : DEFAULT_PICKING_QUEUE_PREFERENCES.mode,
  search: typeof value.search === "string" ? value.search : DEFAULT_PICKING_QUEUE_PREFERENCES.search,
  marketplace: VALID_MARKETPLACES.has(value.marketplace)
    ? value.marketplace
    : DEFAULT_PICKING_QUEUE_PREFERENCES.marketplace,
  status: VALID_STATUSES.has(value.status) ? value.status : DEFAULT_PICKING_QUEUE_PREFERENCES.status,
});

export const readPickingQueuePreferences = (storage = globalThis.localStorage) => {
  if (!storage) return DEFAULT_PICKING_QUEUE_PREFERENCES;

  try {
    const saved = JSON.parse(storage.getItem(PICKING_QUEUE_PREFERENCES_STORAGE_KEY) || "{}");
    return normalizePickingQueuePreferences(saved);
  } catch {
    return DEFAULT_PICKING_QUEUE_PREFERENCES;
  }
};

export const writePickingQueuePreferences = (
  preferences,
  storage = globalThis.localStorage,
) => {
  const normalized = normalizePickingQueuePreferences(preferences);
  if (storage) {
    storage.setItem(PICKING_QUEUE_PREFERENCES_STORAGE_KEY, JSON.stringify(normalized));
  }
  return normalized;
};
