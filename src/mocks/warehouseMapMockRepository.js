import { createMockStorage } from "./mockStorage.js";

const STORAGE_KEY = "wms_warehouse_map_v4";

const initialMap = {
  id: "warehouse-main",
  name: "Galpao principal",
  width: 1200,
  height: 720,
  version: 1,
  updatedAt: "2026-06-16T08:00:00.000Z",
  elements: [],
};

const storage = createMockStorage({
  key: STORAGE_KEY,
  eventName: "wms-warehouse-map-change",
  createInitial: () => JSON.parse(JSON.stringify(initialMap)),
});

const { clone, read, write, reset } = storage;

export const warehouseMapMockRepository = {
  getMap() {
    return clone(read());
  },

  saveMap(map) {
    const nextMap = {
      ...map,
      version: Number(map.version || 1) + 1,
      updatedAt: new Date().toISOString(),
      elements: (map.elements || []).map((element) => ({
        ...element,
        x: Number(element.x || 0),
        y: Number(element.y || 0),
        width: Number(element.width || 0),
        height: Number(element.height || 0),
        x2: element.x2 === undefined ? undefined : Number(element.x2 || 0),
        y2: element.y2 === undefined ? undefined : Number(element.y2 || 0),
      })),
    };
    write(nextMap);
    return clone(nextMap);
  },

  reset() {
    return reset();
  },
};
