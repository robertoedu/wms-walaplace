import { mockReceivingNotes, mockStockLocations } from "./mockData.js";
import { createMockStorage } from "./mockStorage.js";
import { stockMockRepository } from "./stockMockRepository.js";
import {
  clone,
  findLocationByCode,
  flattenAddressingItems,
  getItemStatus,
  getLocationCodes,
  normalizeLocation,
  normalizeNote,
} from "./wmsMockUtils.js";

const STORAGE_KEY = "wms_mock_database_v6";
const STORAGE_VERSION = 2;

const createInitialDatabase = () => ({
  notes: mockReceivingNotes.map(normalizeNote),
  locations: clone(mockStockLocations).map(normalizeLocation),
  version: STORAGE_VERSION,
});

const storage = createMockStorage({
  key: STORAGE_KEY,
  version: STORAGE_VERSION,
  eventName: "wms-mock-database-change",
  createInitial: createInitialDatabase,
});

const readDatabase = storage.read;
const writeDatabase = storage.write;
const resetDatabase = storage.reset;

export const wmsMockRepository = {
  listNotes() {
    return clone(readDatabase().notes);
  },

  saveNote(noteData) {
    const database = readDatabase();
    const currentNote = database.notes.find((current) => current.id === noteData.id);
    const mergedItems = (noteData.items || []).map((item) => {
      const currentItem = currentNote?.items.find((current) => current.sku === item.sku);
      return currentItem ? { ...currentItem, ...item } : item;
    });
    const note = normalizeNote({
      ...noteData,
      id: noteData.id || `rcv-${Date.now()}`,
      items: mergedItems,
    });
    const index = database.notes.findIndex((current) => current.id === note.id);

    if (index >= 0) database.notes[index] = note;
    else database.notes.unshift(note);

    writeDatabase(database);
    return clone(note);
  },

  listAddressingItems() {
    return clone(flattenAddressingItems(readDatabase()));
  },

  listAddressingNotes() {
    const database = readDatabase();
    const items = flattenAddressingItems(database);

    return clone(
      database.notes.map((note) => {
        const noteItems = items.filter((item) => item.noteId === note.id);
        const receivedQty = noteItems.reduce((total, item) => total + item.receivedQty, 0);
        const addressedQty = noteItems.reduce((total, item) => total + item.addressedQty, 0);
        const pendingQty = noteItems.reduce((total, item) => total + item.pendingQty, 0);
        let addressingStatus = "aguardando_enderecamento";

        if (note.addressingBlocked === true) addressingStatus = "bloqueado_divergencia";
        else if (pendingQty === 0) addressingStatus = "aguardando_separacao";
        else if (addressedQty > 0) addressingStatus = "enderecamento_parcial";

        return {
          id: note.id,
          noteNumber: note.key,
          orderCode: note.orderCode || note.key,
          supplier: note.supplier,
          receivedAt: note.finalizedAt || note.createdAt,
          receivingStatus: note.status,
          receivingHasIssue: note.status === "divergente" || note.status === "incompleta",
          addressingBlocked: note.addressingBlocked === true,
          noteObservation: note.observation || "",
          addressingStatus,
          skuCount: noteItems.length,
          receivedQty,
          addressedQty,
          pendingQty,
          items: noteItems,
          updatedAt: noteItems.reduce(
            (latest, item) => item.updatedAt > latest ? item.updatedAt : latest,
            note.finalizedAt || note.createdAt,
          ),
        };
      }),
    );
  },

  findAddressingItem(itemId) {
    return this.listAddressingItems().find((item) => item.id === itemId) || null;
  },

  searchPendingItem(term) {
    const normalizedTerm = String(term || "").trim().toLowerCase();
    if (!normalizedTerm) return null;

    return (
      this.listAddressingItems().find(
        (item) =>
          item.pendingQty > 0 &&
          !item.addressingBlocked &&
          (item.sku.toLowerCase() === normalizedTerm ||
            item.ean.toLowerCase() === normalizedTerm ||
            item.productName.toLowerCase().includes(normalizedTerm)),
      ) || null
    );
  },

  listLocations() {
    return clone(readDatabase().locations.map(normalizeLocation));
  },

  listLocationItems(locationCode) {
    const database = readDatabase();
    const { location } = findLocationByCode(database, locationCode);
    const codes = location ? getLocationCodes(database, location) : [locationCode];
    const normalizedCodes = new Set(codes.map((code) => String(code || "").toLowerCase()));

    return clone(stockMockRepository.listProducts().filter(
      (product) => normalizedCodes.has(String(product.currentLocation || "").toLowerCase()) && Number(product.quantity) > 0,
    ));
  },

  findLocation(code) {
    const normalizedCode = String(code || "").trim();
    if (!normalizedCode) return null;

    const { location } = findLocationByCode(readDatabase(), normalizedCode);
    return location ? clone(normalizeLocation(location)) : null;
  },

  saveLocation(locationData) {
    const database = readDatabase();
    const code = String(locationData.code || "").trim();
    const description = String(locationData.description || "").trim();
    const capacityIsEmpty = locationData.capacity === "" || locationData.capacity === undefined || locationData.capacity === null;
    const capacity = capacityIsEmpty ? null : Number(locationData.capacity);
    const positionIsEmpty = locationData.position === "" || locationData.position === undefined || locationData.position === null;
    const pickingSequenceIsEmpty = locationData.pickingSequence === "" || locationData.pickingSequence === undefined || locationData.pickingSequence === null;
    const position = positionIsEmpty ? null : Number(locationData.position);
    const pickingSequence = pickingSequenceIsEmpty ? null : Number(locationData.pickingSequence);
    const isSubLocation = Boolean(locationData.isSubLocation);
    const parentLocationCode = isSubLocation ? String(locationData.parentLocationCode || "").trim() : "";
    const current = locationData.id
      ? database.locations.find((location) => location.id === locationData.id)
      : null;
    const parentLocation = parentLocationCode
      ? database.locations.map(normalizeLocation).find((location) => location.code.toLowerCase() === parentLocationCode.toLowerCase())
      : null;

    if (!code || !description) throw new Error("Codigo e descricao sao obrigatorios.");
    if (!capacityIsEmpty && (!Number.isInteger(capacity) || capacity <= 0)) {
      throw new Error("A capacidade maxima deve ser um numero inteiro maior que zero ou ficar em branco.");
    }
    if (!positionIsEmpty && (!Number.isInteger(position) || position < 0)) {
      throw new Error("A posicao deve ser um numero inteiro maior ou igual a zero.");
    }
    if (!pickingSequenceIsEmpty && (!Number.isInteger(pickingSequence) || pickingSequence < 0)) {
      throw new Error("A sequencia de separacao deve ser um numero inteiro maior ou igual a zero.");
    }
    if (current && code.toLowerCase() !== current.code.toLowerCase()) {
      throw new Error("O codigo nao pode ser alterado apos o cadastro.");
    }
    if (isSubLocation && !parentLocationCode) throw new Error("Selecione o local principal deste sublocal.");
    if (isSubLocation && !parentLocation) throw new Error("Local principal nao encontrado.");
    if (isSubLocation && parentLocation?.isSubLocation) throw new Error("Um sublocal nao pode ser vinculado a outro sublocal.");

    const duplicatedCode = database.locations.some(
      (location) => location.id !== current?.id && location.code.toLowerCase() === code.toLowerCase(),
    );
    if (duplicatedCode) throw new Error("Ja existe um local com esse codigo.");

    const occupied = Number(current?.occupied || 0);
    if (capacity !== null && capacity < occupied) {
      throw new Error(`A capacidade nao pode ser menor que a ocupacao atual de ${occupied} item(ns).`);
    }
    if (isSubLocation && parentLocation?.capacity !== null && capacity !== null) {
      const siblingCapacity = database.locations
        .map(normalizeLocation)
        .filter((location) =>
          location.id !== current?.id &&
          location.isSubLocation &&
          location.parentLocationCode.toLowerCase() === parentLocation.code.toLowerCase() &&
          Number(location.capacity || 0) > 0,
        )
        .reduce((total, location) => total + Number(location.capacity || 0), 0);
      if (capacity > parentLocation.capacity) {
        throw new Error("A capacidade do sublocal nao pode ser maior que a capacidade do local principal.");
      }
      if (siblingCapacity + capacity > parentLocation.capacity) {
        throw new Error("A soma das capacidades dos sublocais nao pode ultrapassar a capacidade do local principal.");
      }
    }

    const location = {
      ...current,
      ...locationData,
      id: current?.id || `LOC-${Date.now()}`,
      code,
      description,
      capacity,
      occupied,
      zone: String(locationData.zone || "").trim(),
      aisle: String(locationData.aisle || "").trim(),
      side: String(locationData.side || "").trim(),
      position,
      pickingSequence,
      isSubLocation,
      parentLocationCode,
      updatedAt: new Date().toISOString(),
    };
    if (current) database.locations[database.locations.indexOf(current)] = location;
    else database.locations.unshift(location);

    writeDatabase(database);
    return clone(normalizeLocation(location));
  },

  removeItemFromLocation(locationCode, sku) {
    const database = readDatabase();
    const { location } = findLocationByCode(database, locationCode);
    const validCodes = new Set(getLocationCodes(database, location || {}).map((code) => code.toLowerCase()));
    const product = stockMockRepository.findBySku(sku);
    if (!location) throw new Error("Local nao encontrado.");
    if (!product || !validCodes.has(String(product.currentLocation || "").toLowerCase())) {
      throw new Error("O produto nao esta armazenado neste local.");
    }

    const quantity = Number(product.quantity || 0);
    const productLocationCode = product.currentLocation;
    stockMockRepository.removeFromLocation(sku, productLocationCode);
    location.occupied = Math.max(0, Number(location.occupied || 0) - quantity);
    database.notes.forEach((note) => note.items.forEach((item) => {
      if (item.sku !== sku) return;
      item.locations = (item.locations || []).filter((code) => !validCodes.has(String(code || "").toLowerCase()));
      if (validCodes.has(String(item.currentLocation || "").toLowerCase())) item.currentLocation = item.locations.at(-1) || "";
      item.updatedAt = new Date().toISOString();
    }));
    writeDatabase(database);
    return clone({ product: { ...product, currentLocation: "" }, location: normalizeLocation(location) });
  },

  deleteLocation(locationId) {
    const database = readDatabase();
    const location = database.locations.find((current) => current.id === locationId);
    if (!location) throw new Error("Local nao encontrado.");
    if (!String(location.id).startsWith("LOC-")) {
      throw new Error("Somente locais cadastrados pelo usuario podem ser excluidos.");
    }
    const childLocations = database.locations.map(normalizeLocation).filter(
      (child) => child.parentLocationCode.toLowerCase() === location.code.toLowerCase(),
    );
    if (childLocations.length) throw new Error("Remova os sublocais antes de excluir o local principal.");
    const items = this.listLocationItems(location.code);
    if (items.length || Number(location.occupied) > 0) {
      throw new Error("Remova todos os itens do local antes de exclui-lo.");
    }
    database.locations = database.locations.filter((current) => current.id !== locationId);
    writeDatabase(database);
    return clone(normalizeLocation(location));
  },

  confirmAddressing({ itemId, locationCode, quantity }) {
    const database = readDatabase();
    const numericQuantity = Number(quantity);
    const note = database.notes.find((current) =>
      current.items.some((item) => item.id === itemId),
    );
    const item = note?.items.find((current) => current.id === itemId);
    const { location, storageCode } = findLocationByCode(database, locationCode);

    if (!note || !item) throw new Error("Produto pendente nao encontrado.");
    if (note.addressingBlocked === true) {
      throw new Error("O produto esta bloqueado para enderecamento e deve seguir para quarentena.");
    }
    if (!location) throw new Error("Local inexistente.");
    if (!Number.isInteger(numericQuantity) || numericQuantity <= 0) {
      throw new Error("Informe uma quantidade inteira maior que zero.");
    }
    if (numericQuantity > item.pendingQty) {
      throw new Error("Quantidade maior que a pendente do produto.");
    }

    const hasCapacityLimit = Number(location.capacity || 0) > 0;
    const availableCapacity = hasCapacityLimit ? location.capacity - location.occupied : Infinity;
    if (hasCapacityLimit && numericQuantity > availableCapacity) {
      throw new Error(`O local possui capacidade disponivel para ${availableCapacity} unidade(s).`);
    }

    const timestamp = new Date().toISOString();
    const movement = {
      id: `mov-${Date.now()}`,
      itemId,
      noteId: note.id,
      sku: item.sku,
      locationCode: storageCode,
      quantity: numericQuantity,
      timestamp,
      operator: "Operador mock",
      receivingStatus: note.status,
      noteObservation: note.observation || "",
    };

    item.addressedQty += numericQuantity;
    item.pendingQty = item.receivedQty - item.addressedQty;
    item.currentLocation = storageCode;
    item.locations = Array.from(new Set([...(item.locations || []), storageCode]));
    item.movements = [movement, ...(item.movements || [])];
    item.updatedAt = timestamp;
    item.status = getItemStatus({ ...item, status: null });
    location.occupied += numericQuantity;

    writeDatabase(database);
    stockMockRepository.adjustQuantity({
      sku: item.sku,
      quantity: numericQuantity,
      locationCode: storageCode,
      productData: { ean: item.ean, description: item.productName || item.description },
    });
    return clone({
      item: flattenAddressingItems(database).find((current) => current.id === itemId),
      location: normalizeLocation(location),
      movement,
    });
  },

  reset() {
    return resetDatabase();
  },
};
