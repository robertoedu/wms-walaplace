import { allModules } from "../../mocks/mockData";

export const modulesService = {
  listModules: () => allModules.map((module) => ({ ...module })),
};
