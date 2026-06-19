export const clone = (value) => JSON.parse(JSON.stringify(value));

const DEFAULT_WAREHOUSE_ID = "742";

export const getItemStatus = (item) => {
  if (item.status === "erro_endereco") return "erro_endereco";
  if (item.pendingQty === 0) return "aguardando_separacao";
  if (item.addressedQty > 0) return "enderecamento_parcial";
  return "aguardando_enderecamento";
};

export const normalizeNote = (note) => ({
  ...note,
  items: (note.items || []).map((item, index) => {
    const isExpectedNote = note.status === "prevista";
    const expectedQty = Number(item.expectedQty ?? item.quantity ?? 0);
    const issuedQty = Number(item.issuedQty ?? item.quantity ?? 0);
    const receivedQty = isExpectedNote && item.receivedQty === undefined
      ? ""
      : Number(item.receivedQty ?? item.quantity ?? 0);
    const addressedQty = Number(item.addressedQty ?? 0);
    const pendingQty = Math.max(0, Number(receivedQty || 0) - addressedQty);

    return {
      ...item,
      id: item.id || `${note.id}:${item.sku}:${index}`,
      productName: item.productName || item.description,
      expectedQty,
      issuedQty,
      receivedQty,
      addressedQty,
      pendingQty,
      currentLocation: item.currentLocation || "",
      locations: item.locations || (item.currentLocation ? [item.currentLocation] : []),
      movements: item.movements || [],
      updatedAt: item.updatedAt || note.finalizedAt || note.createdAt,
      status: getItemStatus({ ...item, addressedQty, pendingQty }),
    };
  }),
});

export const normalizeLocation = (location) => ({
  ...location,
  capacity: location.capacity === "" || location.capacity === undefined || location.capacity === null
    ? null
    : Number(location.capacity),
  occupied: Number(location.occupied || 0),
  zone: String(location.zone || "").trim(),
  aisle: String(location.aisle || "").trim(),
  side: String(location.side || "").trim(),
  position: location.position === "" || location.position === undefined || location.position === null ? null : Number(location.position),
  pickingSequence: location.pickingSequence === "" || location.pickingSequence === undefined || location.pickingSequence === null
    ? null
    : Number(location.pickingSequence),
  isSubLocation: Boolean(location.isSubLocation),
  parentLocationCode: location.isSubLocation ? String(location.parentLocationCode || "").trim() : "",
});

export const getLocationCodes = (database, location) => {
  const current = normalizeLocation(location);
  if (current.isSubLocation) return [current.code];

  return [
    current.code,
    ...database.locations
      .map(normalizeLocation)
      .filter((child) => child.isSubLocation && child.parentLocationCode.toLowerCase() === current.code.toLowerCase())
      .map((child) => child.code),
  ].filter(Boolean);
};

export const findLocationByCode = (database, code) => {
  const normalizedCode = String(code || "").trim().toLowerCase();
  const location = database.locations.find((current) => String(current.code || "").toLowerCase() === normalizedCode);
  return location ? { location, storageCode: normalizeLocation(location).code } : { location: null, storageCode: "" };
};

export const flattenAddressingItems = (database) =>
  database.notes.filter((note) => note.status !== "prevista").flatMap((note) => {
    const receivingHasIssue = note.status === "divergente" || note.status === "incompleta";
    const addressingBlocked = note.addressingBlocked === true;

    return note.items.map((item) => ({
      ...item,
      id: item.id,
      noteId: note.id,
      noteNumber: note.key,
      orderCode: note.orderCode || note.key,
      supplier: note.supplier,
      warehouseId: item.warehouseId || note.warehouseId || DEFAULT_WAREHOUSE_ID,
      warehouseName: item.warehouseName || note.warehouseName || "",
      receivedAt: note.finalizedAt || note.createdAt,
      receivingStatus: note.status,
      receivingHasIssue,
      addressingBlocked,
      noteObservation: note.observation || "",
      status: addressingBlocked ? "bloqueado_divergencia" : getItemStatus(item),
    }));
  });
