import { wmsMockRepository } from "../../../mocks/wmsMockRepository";

export const locationsService = {
  list: () => wmsMockRepository.listLocations(),
  save: (location) => wmsMockRepository.saveLocation(location),
  listItems: (locationCode) => wmsMockRepository.listLocationItems(locationCode),
  removeItem: (locationCode, sku) => wmsMockRepository.removeItemFromLocation(locationCode, sku),
  delete: (locationId) => wmsMockRepository.deleteLocation(locationId),
};
