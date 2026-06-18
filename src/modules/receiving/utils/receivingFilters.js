export const RECEIVING_FILTERS_STORAGE_KEY = "wms_receiving_filters";
export const DEFAULT_RECEIVING_FILTERS = { status: "attention" };

const VALID_RECEIVING_FILTER_STATUSES = new Set([
  "all",
  "attention",
  "completa",
  "incompleta",
  "divergente",
]);

export const normalizeReceivingFilters = (value = {}) => ({
  status: VALID_RECEIVING_FILTER_STATUSES.has(value.status)
    ? value.status
    : DEFAULT_RECEIVING_FILTERS.status,
});

export const readReceivingFilters = (storage = globalThis.localStorage) => {
  if (!storage) return DEFAULT_RECEIVING_FILTERS;

  try {
    const saved = JSON.parse(storage.getItem(RECEIVING_FILTERS_STORAGE_KEY) || "{}");
    return normalizeReceivingFilters(saved);
  } catch {
    return DEFAULT_RECEIVING_FILTERS;
  }
};

export const writeReceivingFilters = (filters, storage = globalThis.localStorage) => {
  const normalized = normalizeReceivingFilters(filters);
  if (storage) {
    storage.setItem(RECEIVING_FILTERS_STORAGE_KEY, JSON.stringify(normalized));
  }
  return normalized;
};
