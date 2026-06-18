import { wmsMockRepository } from "../../../mocks/wmsMockRepository";
import { stockMockRepository } from "../../../mocks/stockMockRepository";

const cloneProduct = (product) => ({
  ...product,
  searchKeys: [
    ...(product.searchKeys || []),
    product.sku,
    product.ean,
    product.description,
    product.currentLocation,
  ]
    .filter(Boolean)
    .map((value) => String(value).toLowerCase()),
});

const cloneNote = (note) => ({
  ...note,
  items: (note.items || []).map((item) => ({ ...item })),
});

export const receivingService = {
  listNotes: () => wmsMockRepository.listNotes().map(cloneNote),
  saveNote: (note) => wmsMockRepository.saveNote(note),
  listStockProducts: () => stockMockRepository.listProducts().map(cloneProduct),
  saveStockProduct: (product) => stockMockRepository.saveProduct(product),
};
