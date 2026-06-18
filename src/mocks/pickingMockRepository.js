import { mockPickingOrders } from "./pickingMockData.js";
import { createMockStorage } from "./mockStorage.js";
import { stockMockRepository } from "./stockMockRepository.js";
import { wmsMockRepository } from "./wmsMockRepository.js";

const STORAGE_KEY = "wms_picking_database_v5";
const STORAGE_VERSION = 1;
const now = () => new Date().toISOString();
const storage = createMockStorage({
  key: STORAGE_KEY,
  version: STORAGE_VERSION,
  eventName: "wms-picking-change",
  createInitial: () => ({
    version: STORAGE_VERSION,
    orders: JSON.parse(JSON.stringify(mockPickingOrders)),
    sessions: [],
    packagingQueue: [],
  }),
});
const { clone, read, write, reset } = storage;
const orderStatus = (order) => {
  const statuses = order.items.map((item) => item.status);
  if (statuses.every((status) => status === "aguardando_embalamento")) return "aguardando_embalamento";
  if (statuses.some((status) => status === "em_separacao")) return "em_separacao";
  if (statuses.some((status) => status === "faltou_item")) return "faltou_item";
  if (statuses.some((status) => status === "divergente")) return "divergente";
  return "aguardando_separacao";
};
const getLocationRouteIndex = () => {
  const locations = wmsMockRepository.listLocations();
  const byCode = new Map(locations.map((location, index) => [
    String(location.code || "").toLowerCase(),
    {
      sequence: Number(location.pickingSequence ?? Number.MAX_SAFE_INTEGER),
      zone: location.zone || "",
      aisle: location.aisle || "",
      side: location.side || "",
      position: Number(location.position ?? index),
      fallback: index,
    },
  ]));

  return byCode;
};
const compareRoute = (first, second) => {
  const routeIndex = getLocationRouteIndex();
  const firstRoute = routeIndex.get(String(first.locationCode || "").toLowerCase()) || {};
  const secondRoute = routeIndex.get(String(second.locationCode || "").toLowerCase()) || {};
  return (
    Number(firstRoute.sequence ?? Number.MAX_SAFE_INTEGER) - Number(secondRoute.sequence ?? Number.MAX_SAFE_INTEGER) ||
    String(firstRoute.zone || "").localeCompare(String(secondRoute.zone || "")) ||
    String(firstRoute.aisle || "").localeCompare(String(secondRoute.aisle || "")) ||
    String(firstRoute.side || "").localeCompare(String(secondRoute.side || "")) ||
    Number(firstRoute.position ?? Number.MAX_SAFE_INTEGER) - Number(secondRoute.position ?? Number.MAX_SAFE_INTEGER) ||
    Number(firstRoute.fallback ?? Number.MAX_SAFE_INTEGER) - Number(secondRoute.fallback ?? Number.MAX_SAFE_INTEGER)
  );
};
const flatten = (db) => db.orders.flatMap((order) => order.items.map((item) => {
  const stock = stockMockRepository.findBySku(item.sku);
  return ({
  ...item, stockQty: Number(stock?.quantity ?? 0), locationCode: stock?.currentLocation || item.locationCode,
  orderId: order.id, marketplace: order.marketplace, customer: order.customer,
  carrier: order.carrier, missingQty: Math.max(0, item.requiredQty - item.pickedQty),
  orderItemCount: order.items.length, orderLocked: order.lockMode === "order",
  });
})).sort(compareRoute);
const listSessionItems = (db, sessionId) => {
  const session = db.sessions.find((current) => current.id === sessionId);
  if (!session) return [];

  const sessionItemIds = new Set(session.itemIds);
  return flatten(db).filter((item) => sessionItemIds.has(item.id)).sort(compareRoute);
};
const findItem = (db, itemId) => {
  const order = db.orders.find((current) => current.items.some((item) => item.id === itemId));
  return { order, item: order?.items.find((current) => current.id === itemId) };
};

export const pickingMockRepository = {
  listItems: () => clone(flatten(read())),
  listSessionItems: (sessionId) => clone(listSessionItems(read(), sessionId)),
  listActiveSessions: () => clone(read().sessions.filter((session) =>
    ["em_separacao", "pausada"].includes(session.status),
  )),
  listOrders: () => clone(read().orders.map((order) => ({
    ...order, status: orderStatus(order), itemCount: order.items.length,
    units: order.items.reduce((sum, item) => sum + item.requiredQty, 0),
    pickedUnits: order.items.reduce((sum, item) => sum + item.pickedQty, 0),
    highVolume: order.items.length >= 3 || order.items.reduce((sum, item) => sum + item.requiredQty, 0) >= 50,
  }))),
  listPackagingQueue: () => clone(read().packagingQueue),
  getSession: (id) => clone(read().sessions.find((session) => session.id === id) || null),
  createSession({ itemIds, mode, operator = "Operador mock", operatorId = null, operatorUsername = "" }) {
    const db = read();
    const uniqueIds = [...new Set(itemIds)];
    if (!uniqueIds.length) throw new Error("Selecione ao menos um item.");
    const selected = uniqueIds.map((id) => findItem(db, id)).sort((first, second) => compareRoute(first.item, second.item));
    if (selected.some(({ item }) => !item || !["aguardando_separacao", "faltou_item"].includes(item.status))) throw new Error("Um ou mais itens não estão disponíveis.");
    const orderIds = [...new Set(selected.map(({ order }) => order.id))];
    if (selected.some(({ order }) => order.lockMode === "order")) throw new Error("Um pedido selecionado está bloqueado por outra sessão.");
    if (mode === "order") orderIds.forEach((id) => { db.orders.find((order) => order.id === id).lockMode = "order"; });
    selected.forEach(({ item }) => { item.status = "em_separacao"; item.lockedBy = "pending"; });
    const orderedItemIds = selected.map(({ item }) => item.id);
    const session = {
      id: `SEP-${Date.now()}`,
      operator,
      operatorId,
      operatorUsername,
      mode,
      status: "em_separacao",
      itemIds: orderedItemIds,
      orderIds,
      initialPickedQty: Object.fromEntries(selected.map(({ item }) => [item.id, item.pickedQty])),
      createdAt: now(),
      events: [],
    };
    selected.forEach(({ item }) => { item.lockedBy = session.id; });
    db.sessions.unshift(session); write(db); return clone(session);
  },
  confirmPick({ sessionId, itemId, locationCode, productCode, quantity }) {
    const db = read(); const session = db.sessions.find((current) => current.id === sessionId);
    const { item } = findItem(db, itemId); const qty = Number(quantity);
    if (!session || !session.itemIds.includes(itemId) || !item) throw new Error("Item não pertence à sessão.");
    const stock = stockMockRepository.findBySku(item.sku);
    const expectedLocation = stock?.currentLocation || item.locationCode;
    item.stockQty = Number(stock?.quantity ?? 0);
    if (locationCode.trim().toLowerCase() !== expectedLocation.toLowerCase()) throw new Error(`Local incorreto. Dirija-se ao local ${expectedLocation}.`);
    const code = productCode.trim().toLowerCase();
    if (code !== item.sku.toLowerCase() && code !== item.ean.toLowerCase()) throw new Error("Produto bipado não corresponde ao item atual.");
    if (!Number.isInteger(qty) || qty <= 0) throw new Error("Quantidade deve ser inteira e maior que zero.");
    const missing = item.requiredQty - item.pickedQty;
    if (qty > missing) throw new Error("Quantidade excede o necessário.");
    if (qty > item.stockQty) throw new Error(`Saldo insuficiente. Disponível: ${item.stockQty}.`);
    stockMockRepository.adjustQuantity({ sku: item.sku, quantity: -qty, locationCode: expectedLocation });
    item.pickedQty += qty;
    item.status = item.pickedQty === item.requiredQty ? "separado_completo" : "separado_parcial";
    const event = { id: `EV-${Date.now()}`, type: "retirada", itemId, quantity: qty, locationCode: expectedLocation, timestamp: now() };
    session.events.unshift(event); write(db); return clone({ session, item: flatten(db).find((current) => current.id === itemId), event });
  },
  removeItem(sessionId, itemId) {
    const db = read(); const session = db.sessions.find((current) => current.id === sessionId); const { order, item } = findItem(db, itemId);
    if (!session || !item) throw new Error("Item não encontrado.");
    item.status = item.pickedQty > 0 ? "faltou_item" : "aguardando_separacao"; item.lockedBy = null;
    session.itemIds = session.itemIds.filter((id) => id !== itemId); session.events.unshift({ id: `EV-${Date.now()}`, type: "removido", itemId, timestamp: now() });
    if (!order.items.some((current) => current.lockedBy === sessionId)) order.lockMode = null;
    write(db); return clone(session);
  },
  pauseSession(id) { const db = read(); const session = db.sessions.find((s) => s.id === id); session.status = session.status === "pausada" ? "em_separacao" : "pausada"; write(db); return clone(session); },
  cancelSession(id) {
    const db = read(); const session = db.sessions.find((s) => s.id === id);
    session.itemIds.forEach((itemId) => { const { order, item } = findItem(db, itemId); item.status = item.pickedQty > 0 ? "faltou_item" : "aguardando_separacao"; item.lockedBy = null; order.lockMode = null; });
    session.status = "cancelada"; session.finishedAt = now(); write(db); return clone(session);
  },
  releaseSession(id, releasedBy = "Supervisor") {
    const db = read();
    const session = db.sessions.find((current) => current.id === id);
    if (!session || !["em_separacao", "pausada"].includes(session.status)) {
      throw new Error("A sessão não está disponível para liberação.");
    }
    session.itemIds.forEach((itemId) => {
      const { order, item } = findItem(db, itemId);
      if (!item) return;
      const initialPickedQty = Number(session.initialPickedQty?.[itemId] ?? item.pickedQty);
      const pickedInSession = Math.max(0, item.pickedQty - initialPickedQty);
      if (pickedInSession > 0) {
        stockMockRepository.adjustQuantity({
          sku: item.sku,
          quantity: pickedInSession,
          locationCode: item.locationCode,
          productData: { ean: item.ean, productName: item.productName, packagingType: item.packagingType },
        });
      }
      item.pickedQty = initialPickedQty;
      item.status = "aguardando_separacao";
      item.lockedBy = null;
      if (order) order.lockMode = null;
    });
    session.status = "liberada";
    session.finishedAt = now();
    session.events.unshift({ id: `EV-${Date.now()}`, type: "sessao_liberada", releasedBy, timestamp: now() });
    write(db);
    return clone(session);
  },
  finishSession(id, zones) {
    const db = read(); const session = db.sessions.find((s) => s.id === id);
    session.itemIds.forEach((itemId) => { const { order, item } = findItem(db, itemId); item.finalZone = zones[itemId] || item.suggestedZone; item.status = item.pickedQty === item.requiredQty ? "aguardando_embalamento" : "faltou_item"; item.lockedBy = null; order.lockMode = null;
      if (item.pickedQty > 0) db.packagingQueue.push({ ...clone(item), quantityForPackaging: item.pickedQty, orderId: order.id, marketplace: order.marketplace, sessionId: id, status: "aguardando_embalamento", queuedAt: now() }); });
    const picked = session.itemIds.map((itemId) => findItem(db, itemId).item);
    session.status = picked.every((item) => item.pickedQty === item.requiredQty) ? "separado_completo" : picked.some((item) => item.pickedQty > 0) ? "separado_parcial" : "faltou_item";
    session.finishedAt = now(); write(db); return clone(session);
  },

  reset() {
    return reset();
  },
};
