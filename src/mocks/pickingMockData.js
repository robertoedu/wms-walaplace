export const mockPickingOrders = [
  {
    id: "ORD-1001", marketplace: "Mercado Livre", customer: "Casa Bonita", carrier: "Mercado Envios",
    items: [
      { id: "PK-1", sku: "PRATO-PORC-26", ean: "7893000000003", productName: "Prato de Porcelana Branco 26 cm", locationCode: "1000001-N1", requiredQty: 48, pickedQty: 0, stockQty: 144, packagingType: "Caixa reforcada", suggestedZone: "Mesa Frageis", status: "aguardando_separacao" },
      { id: "PK-2", sku: "XICARA-PORC-200", ean: "7893000000005", productName: "Xicara de Porcelana 200 ml", locationCode: "1000003-N1", requiredQty: 24, pickedQty: 0, stockQty: 96, packagingType: "Caixa com divisorias", suggestedZone: "Mesa Frageis", status: "aguardando_separacao" },
      { id: "PK-3", sku: "COOLER-34L-AZ", ean: "7893000000007", productName: "Cooler Termico 34L Azul", locationCode: "1000008", requiredQty: 4, pickedQty: 0, stockQty: 28, packagingType: "Caixa grande", suggestedZone: "Area Volumosos", status: "aguardando_separacao" },
    ],
  },
  {
    id: "ORD-1002", marketplace: "Shopee", customer: "Restaurante Sabor", carrier: "Jadlog",
    items: [
      { id: "PK-4", sku: "PRATO-PORC-20", ean: "7893000000004", productName: "Prato de Porcelana Sobremesa 20 cm", locationCode: "1000001-N2", requiredQty: 60, pickedQty: 20, stockQty: 120, packagingType: "Caixa reforcada", suggestedZone: "Mesa Frageis", status: "faltou_item" },
      { id: "PK-5", sku: "CADEIRA-PRAIA-AZ", ean: "7893000000001", productName: "Cadeira de Praia Alta Azul", locationCode: "1000004", requiredQty: 12, pickedQty: 0, stockQty: 36, packagingType: "Caixa cadeira", suggestedZone: "Area Volumosos", status: "aguardando_separacao" },
    ],
  },
  {
    id: "ORD-1003", marketplace: "Amazon", customer: "Hotel Central", carrier: "Amazon Logistics",
    items: [
      { id: "PK-6", sku: "PRATO-PORC-26", ean: "7893000000003", productName: "Prato de Porcelana Branco 26 cm", locationCode: "1000001-N1", requiredQty: 36, pickedQty: 0, stockQty: 144, packagingType: "Caixa reforcada", suggestedZone: "Mesa Frageis", status: "aguardando_separacao" },
      { id: "PK-7", sku: "GAZEBO-3X3-BR", ean: "7893000000009", productName: "Gazebo Dobravel 3x3 Branco", locationCode: "1000007", requiredQty: 2, pickedQty: 0, stockQty: 16, packagingType: "Caixa volumosa", suggestedZone: "Area Volumosos", status: "aguardando_separacao" },
    ],
  },
  {
    id: "ORD-1004", marketplace: "Site", customer: "Buffet Estrela", carrier: "Correios",
    items: [
      { id: "PK-8", sku: "XICARA-PORC-90", ean: "7893000000006", productName: "Xicara de Cafe Porcelana 90 ml", locationCode: "1000003-N2", requiredQty: 30, pickedQty: 0, stockQty: 72, packagingType: "Caixa com divisorias", suggestedZone: "Mesa Frageis", status: "aguardando_separacao" },
      { id: "PK-10", sku: "COOLER-50L-CZ", ean: "7893000000008", productName: "Cooler Termico 50L Cinza", locationCode: "1000008", requiredQty: 3, pickedQty: 0, stockQty: 18, packagingType: "Caixa grande", suggestedZone: "Area Volumosos", status: "aguardando_separacao" },
    ],
  },
  {
    id: "ORD-1005", marketplace: "Manual", customer: "Loja Fisica", carrier: "Retirada",
    items: [
      { id: "PK-9", sku: "GAZEBO-3X3-AZ", ean: "7893000000010", productName: "Gazebo Dobravel 3x3 Azul", locationCode: "1000007", requiredQty: 1, pickedQty: 1, stockQty: 12, packagingType: "Caixa volumosa", suggestedZone: "Area Volumosos", status: "aguardando_embalamento", finalZone: "Area Volumosos" },
    ],
  },
  {
    id: "ORD-1006", marketplace: "Site", customer: "Cliente Transferencia", carrier: "Correios",
    items: [
      { id: "PK-11", sku: "FRITADEIRA-5L-PR", ean: "7894000000001", productName: "Fritadeira Eletrica 5L Preta", locationCode: "288-A1", requiredQty: 3, pickedQty: 0, stockQty: 18, packagingType: "Caixa media", suggestedZone: "Area Volumosos", status: "aguardando_separacao" },
      { id: "PK-12", sku: "LIQUID-1200-INOX", ean: "7894000000002", productName: "Liquidificador 1200W Inox", locationCode: "288-A2", requiredQty: 4, pickedQty: 0, stockQty: 24, packagingType: "Caixa media", suggestedZone: "Area Volumosos", status: "aguardando_separacao" },
    ],
  },
];
