import { allModules } from "../../mocks/mockData.js";
import { WAREHOUSES, getTransferConfirmPermission } from "../utils/warehouseCatalog.js";

const transferModules = [
  { id: "transfers", name: "Transferencias", route: "/transferencias", type: "operational" },
  ...WAREHOUSES.map((warehouse) => ({
    id: getTransferConfirmPermission(warehouse.id),
    name: `Confirmar recebimento - ${warehouse.label}`,
    type: "warehouse",
  })),
];

export const modulesService = {
  listModules: () => [...allModules, ...transferModules].map((module) => ({ ...module })),
};
