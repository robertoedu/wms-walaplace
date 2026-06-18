import { wmsMockRepository } from "../../../mocks/wmsMockRepository";

export const addressingService = {
  listItems: () => wmsMockRepository.listAddressingItems(),
  listNotes: () => wmsMockRepository.listAddressingNotes(),
  findItemById: (itemId) => wmsMockRepository.findAddressingItem(itemId),
  searchPendingItem: (term) => wmsMockRepository.searchPendingItem(term),
  listStockLocations: () => wmsMockRepository.listLocations(),
  findStockLocationByCode: (locationCode) =>
    wmsMockRepository.findLocation(locationCode),
  confirmAddressing: (payload) => wmsMockRepository.confirmAddressing(payload),
  resetMock: () => wmsMockRepository.reset(),
};
