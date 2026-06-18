import { packagingTypesMockRepository } from "../../../mocks/packagingTypesMockRepository";
import { stockMockRepository } from "../../../mocks/stockMockRepository";

export const packagingTypesService = {
  listTypes: () => packagingTypesMockRepository.listTypes(),
  listProductsWithPackagingTypes: () => {
    const assignmentsBySku = new Map(
      packagingTypesMockRepository
        .listAssignments()
        .map((assignment) => [assignment.sku, assignment]),
    );

    return stockMockRepository.listProducts().map((product) => ({
      ...product,
      packagingAssignment: assignmentsBySku.get(product.sku) || null,
    }));
  },
  saveAssignment: (sku, packagingType) =>
    packagingTypesMockRepository.saveAssignment(sku, packagingType),
};
