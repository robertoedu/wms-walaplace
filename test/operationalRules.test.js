import assert from "node:assert/strict";
import { beforeEach, describe, test } from "node:test";

class MemoryStorage {
  #values = new Map();

  getItem(key) {
    return this.#values.has(key) ? this.#values.get(key) : null;
  }

  setItem(key, value) {
    this.#values.set(key, String(value));
  }

  removeItem(key) {
    this.#values.delete(key);
  }

  clear() {
    this.#values.clear();
  }
}

const localStorage = new MemoryStorage();
const eventTarget = new EventTarget();

globalThis.localStorage = localStorage;
globalThis.window = {
  localStorage,
  dispatchEvent: eventTarget.dispatchEvent.bind(eventTarget),
  addEventListener: eventTarget.addEventListener.bind(eventTarget),
  removeEventListener: eventTarget.removeEventListener.bind(eventTarget),
};

const [
  { pickingMockRepository },
  { stockMockRepository },
  { wmsMockRepository },
  {
    needsProcessAttention,
    pickingNeedsAttention,
  },
  {
    addressingItemNeedsAttention,
    addressingNoteNeedsAttention,
    receivingNoteNeedsAttention,
  },
  {
    readPickingQueuePreferences,
    writePickingQueuePreferences,
    DEFAULT_PICKING_QUEUE_PREFERENCES,
  },
  {
    readReceivingFilters,
    writeReceivingFilters,
    DEFAULT_RECEIVING_FILTERS,
  },
] = await Promise.all([
  import("../src/mocks/pickingMockRepository.js"),
  import("../src/mocks/stockMockRepository.js"),
  import("../src/mocks/wmsMockRepository.js"),
  import("../src/shared/utils/statusCatalog.js"),
  import("../src/shared/utils/processAttention.js"),
  import("../src/modules/picking/utils/pickingQueuePreferences.js"),
  import("../src/modules/receiving/utils/receivingFilters.js"),
]);

const resetOperationalMocks = () => {
  localStorage.clear();
  stockMockRepository.reset();
  wmsMockRepository.reset();
  pickingMockRepository.reset();
};

beforeEach(resetOperationalMocks);

describe("regras operacionais mockadas", () => {
  test("ordena a fila de separacao pela rota cadastrada nos locais", () => {
    const route = pickingMockRepository.listItems().map((item) => item.locationCode);

    assert.deepEqual(route.slice(0, 6), [
      "1000001-N1",
      "1000001-N1",
      "1000001-N2",
      "1000003-N1",
      "1000003-N2",
      "1000004",
    ]);
  });

  test("bloqueia pedido em sessao por pedido e libera os itens ao soltar a sessao", () => {
    const session = pickingMockRepository.createSession({
      itemIds: ["PK-1"],
      mode: "order",
      operator: "Teste",
    });

    assert.equal(session.status, "em_separacao");
    assert.throws(
      () => pickingMockRepository.createSession({ itemIds: ["PK-3"], mode: "items" }),
      /pedido selecionado.*bloqueado/i,
    );

    const released = pickingMockRepository.releaseSession(session.id, "Supervisor teste");
    const releasedItem = pickingMockRepository.listItems().find((item) => item.id === "PK-1");

    assert.equal(released.status, "liberada");
    assert.equal(releasedItem.status, "aguardando_separacao");
    assert.equal(releasedItem.lockedBy, null);
  });

  test("valida capacidade de local principal e sublocal", () => {
    const parent = wmsMockRepository.saveLocation({
      code: "TESTE-PAI",
      description: "Local principal teste",
      capacity: 5,
      occupied: 0,
      zone: "Teste",
      aisle: "T",
      side: "D",
      position: 1,
      pickingSequence: 1,
    });

    assert.throws(
      () => wmsMockRepository.saveLocation({
        code: "TESTE-SUB-EXCESSO",
        description: "Sublocal maior que o pai",
        capacity: 6,
        isSubLocation: true,
        parentLocationCode: parent.code,
      }),
      /sublocal.*maior/i,
    );

    wmsMockRepository.saveLocation({
      code: "TESTE-SUB-1",
      description: "Sublocal 1",
      capacity: 3,
      isSubLocation: true,
      parentLocationCode: parent.code,
    });

    assert.throws(
      () => wmsMockRepository.saveLocation({
        code: "TESTE-SUB-2",
        description: "Sublocal 2",
        capacity: 3,
        isSubLocation: true,
        parentLocationCode: parent.code,
      }),
      /soma das capacidades/i,
    );
  });

  test("marca enderecamento parcial e completo conforme a quantidade enderecada", () => {
    const item = wmsMockRepository.searchPendingItem("SKU-10001");
    const partial = wmsMockRepository.confirmAddressing({
      itemId: item.id,
      locationCode: "1000008",
      quantity: 1,
    }).item;

    assert.equal(partial.status, "enderecamento_parcial");
    assert.equal(partial.pendingQty, item.pendingQty - 1);

    const completed = wmsMockRepository.confirmAddressing({
      itemId: item.id,
      locationCode: "1000008",
      quantity: partial.pendingQty,
    }).item;

    assert.equal(completed.status, "aguardando_separacao");
    assert.equal(completed.pendingQty, 0);
  });

  test("persiste e normaliza filtros operacionais", () => {
    assert.deepEqual(readPickingQueuePreferences(), DEFAULT_PICKING_QUEUE_PREFERENCES);

    writePickingQueuePreferences({
      mode: "orders",
      search: "PK-1",
      marketplace: "Shopee",
      status: "faltou_item",
    });

    assert.deepEqual(readPickingQueuePreferences(), {
      mode: "orders",
      search: "PK-1",
      marketplace: "Shopee",
      status: "faltou_item",
    });

    writePickingQueuePreferences({
      mode: "kanban",
      search: 123,
      marketplace: "Marketplace invalido",
      status: "status_invalido",
    });

    assert.deepEqual(readPickingQueuePreferences(), DEFAULT_PICKING_QUEUE_PREFERENCES);

    writeReceivingFilters({ status: "divergente" });
    assert.deepEqual(readReceivingFilters(), { status: "divergente" });

    localStorage.setItem("wms_receiving_filters", "{json quebrado");
    assert.deepEqual(readReceivingFilters(), DEFAULT_RECEIVING_FILTERS);
  });

  test("classifica corretamente itens que precisam de atencao", () => {
    assert.equal(needsProcessAttention("enderecamento_parcial"), true);
    assert.equal(needsProcessAttention("aguardando_separacao"), false);
    assert.equal(pickingNeedsAttention("faltou_item"), true);
    assert.equal(receivingNoteNeedsAttention({ status: "divergente" }), true);
    assert.equal(receivingNoteNeedsAttention({ status: "completa" }), false);
    assert.equal(addressingItemNeedsAttention({
      status: "aguardando_separacao",
      receivingHasIssue: true,
      addressingBlocked: false,
    }), true);
    assert.equal(addressingNoteNeedsAttention({
      addressingStatus: "aguardando_separacao",
      receivingHasIssue: false,
      addressingBlocked: false,
    }), false);
  });
});
