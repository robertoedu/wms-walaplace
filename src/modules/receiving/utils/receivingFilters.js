export const RECEIVING_FILTERS_STORAGE_KEY = "wms_receiving_filters";
export const DEFAULT_RECEIVING_FILTERS = {
  status: "prevista",
  dateStart: "",
  dateEnd: "",
};

const VALID_RECEIVING_FILTER_STATUSES = new Set([
  "all",
  "attention",
  "prevista",
  "completa",
  "incompleta",
  "divergente",
]);

const normalizeDate = (value) => {
  if (!value || typeof value !== "string") return "";

  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : "";
};

export const normalizeReceivingFilters = (value = {}) => ({
  status: VALID_RECEIVING_FILTER_STATUSES.has(value.status)
    ? value.status
    : DEFAULT_RECEIVING_FILTERS.status,
  dateStart: normalizeDate(value.dateStart),
  dateEnd: normalizeDate(value.dateEnd),
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
