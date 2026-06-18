import { stockMockRepository } from "../../../mocks/stockMockRepository";

export const stockService = {
  listProducts: () => stockMockRepository.listProducts(),
  saveProduct: (product) => stockMockRepository.saveProduct(product),
  updateQuantity: (sku, quantity) => stockMockRepository.updateQuantity(sku, quantity),
};
