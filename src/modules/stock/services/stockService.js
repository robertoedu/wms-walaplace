import { stockMockRepository } from "../../../mocks/stockMockRepository.js";
import { transferMockRepository } from "../../../mocks/transferMockRepository.js";

export const stockService = {
  listProducts: () => stockMockRepository.listProducts(),
  saveProduct: (product) => stockMockRepository.saveProduct(product),
  updateQuantity: (sku, quantity, warehouseId, productId) => stockMockRepository.updateQuantity(sku, quantity, warehouseId, productId),
  updateLocation: (payload) => stockMockRepository.updateLocation(payload),
  transferToWarehouse: ({ product, toWarehouseId, quantity }) => {
    const transferredProduct = stockMockRepository.transferOut({
      sku: product.sku,
      warehouseId: product.warehouseId,
      productId: product.id,
      quantity,
    });
    return transferMockRepository.createTransfer({
      product: transferredProduct,
      fromWarehouseId: product.warehouseId,
      toWarehouseId,
      quantity: transferredProduct.quantity,
    });
  },
};
