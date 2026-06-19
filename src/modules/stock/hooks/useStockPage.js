import { useEffect, useMemo, useState } from "react";
import { stockService } from "../services/stockService";
import { DEFAULT_WAREHOUSE_ID, WAREHOUSES, getWarehouseLabel } from "../../../shared/utils/warehouseCatalog";

const emptyForm = {
  description: "",
  sku: "",
  ean: "",
  warehouseId: DEFAULT_WAREHOUSE_ID,
  currentLocation: "",
  quantity: "",
};

const normalizeSearchValue = (value) => String(value ?? "").toLowerCase();

const productMatchesSearch = (product, search) => {
  const term = search.trim().toLowerCase();

  if (!term) return true;

  return Object.values(product).some((value) =>
    normalizeSearchValue(value).includes(term),
  );
};

export const useStockPage = () => {
  const [products, setProducts] = useState(() => stockService.listProducts());
  const [search, setSearch] = useState("");
  const [warehouseFilter, setWarehouseFilter] = useState("all");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editQuantity, setEditQuantity] = useState("");
  const [editError, setEditError] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState(emptyForm);
  const [createError, setCreateError] = useState("");
  const [movingProduct, setMovingProduct] = useState(null);
  const [moveLocation, setMoveLocation] = useState("");
  const [moveQuantity, setMoveQuantity] = useState("");
  const [moveError, setMoveError] = useState("");
  const [transferringProduct, setTransferringProduct] = useState(null);
  const [transferWarehouseId, setTransferWarehouseId] = useState("");
  const [transferQuantity, setTransferQuantity] = useState("");
  const [transferError, setTransferError] = useState("");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    const refresh = () => setProducts(stockService.listProducts());
    window.addEventListener("wms-stock-change", refresh);
    return () => window.removeEventListener("wms-stock-change", refresh);
  }, []);

  const filteredProducts = useMemo(
    () => products.filter((product) =>
      (warehouseFilter === "all" || product.warehouseId === warehouseFilter) &&
      productMatchesSearch(product, search),
    ),
    [products, search, warehouseFilter],
  );

  const summary = useMemo(
    () => ({
      totalProducts: filteredProducts.length,
      totalQuantity: filteredProducts.reduce(
        (total, product) => total + Number(product.quantity || 0),
        0,
      ),
      transferPendingQuantity: filteredProducts.reduce(
        (total, product) => total + Number(product.transferPendingQty || 0),
        0,
      ),
      withoutLocation: filteredProducts.filter((product) => !product.currentLocation)
        .length,
      lowStock: filteredProducts.filter((product) => Number(product.quantity) <= 10)
        .length,
    }),
    [filteredProducts],
  );

  const handleSearchChange = (value) => {
    setSearch(value);
    setPage(0);
  };

  const handleWarehouseFilterChange = (value) => {
    setWarehouseFilter(value);
    setPage(0);
  };

  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setEditQuantity(String(product.quantity));
    setEditError("");
  };

  const handleCloseEdit = () => {
    setEditingProduct(null);
    setEditQuantity("");
    setEditError("");
  };

  const handleSaveEdit = () => {
    const nextQuantity = Number(editQuantity);

    if (editQuantity === "" || Number.isNaN(nextQuantity)) {
      setEditError("Informe uma quantidade válida.");
      return;
    }

    if (nextQuantity < 0) {
      setEditError("Quantidade não pode ser negativa.");
      return;
    }

    stockService.updateQuantity(editingProduct.sku, nextQuantity, editingProduct.warehouseId, editingProduct.id);
    setProducts(stockService.listProducts());
    handleCloseEdit();
    setFeedback("Quantidade atualizada com sucesso.");
  };

  const handleOpenMoveLocation = (product) => {
    setMovingProduct(product);
    setMoveLocation(product.currentLocation || "");
    setMoveQuantity(String(product.quantity || ""));
    setMoveError("");
  };

  const handleCloseMoveLocation = () => {
    setMovingProduct(null);
    setMoveLocation("");
    setMoveQuantity("");
    setMoveError("");
  };

  const handleSaveMoveLocation = () => {
    try {
      stockService.updateLocation({
        sku: movingProduct.sku,
        warehouseId: movingProduct.warehouseId,
        productId: movingProduct.id,
        locationCode: moveLocation,
        quantity: moveQuantity,
      });
      setProducts(stockService.listProducts());
      handleCloseMoveLocation();
      setFeedback("Localização atualizada com sucesso.");
    } catch (error) {
      setMoveError(error.message);
    }
  };

  const handleOpenTransfer = (product) => {
    const targetWarehouse = WAREHOUSES.find((warehouse) => warehouse.id !== product.warehouseId);
    setTransferringProduct(product);
    setTransferWarehouseId(targetWarehouse?.id || "");
    setTransferQuantity(String(product.quantity || ""));
    setTransferError("");
  };

  const handleCloseTransfer = () => {
    setTransferringProduct(null);
    setTransferWarehouseId("");
    setTransferQuantity("");
    setTransferError("");
  };

  const handleConfirmTransfer = () => {
    try {
      stockService.transferToWarehouse({
        product: transferringProduct,
        toWarehouseId: transferWarehouseId,
        quantity: transferQuantity,
      });
      setProducts(stockService.listProducts());
      handleCloseTransfer();
      setFeedback(`Transferencia enviada para confirmacao do estoque ${getWarehouseLabel(transferWarehouseId)}.`);
    } catch (error) {
      setTransferError(error.message);
    }
  };

  const handleOpenCreate = () => {
    setCreateForm(emptyForm);
    setCreateError("");
    setCreateOpen(true);
  };

  const handleCloseCreate = () => {
    setCreateOpen(false);
    setCreateForm(emptyForm);
    setCreateError("");
  };

  const handleCreateChange = (field, value) => {
    setCreateForm((currentForm) => ({ ...currentForm, [field]: value }));
  };

  const validateCreate = () => {
    const values = [
      createForm.description,
      createForm.sku,
      createForm.quantity,
    ].map((value) => String(value).trim());

    if (values.some((value) => !value)) return "Preencha descrição, SKU e quantidade.";

    const quantity = Number(createForm.quantity);
    if (Number.isNaN(quantity)) return "Informe uma quantidade válida.";
    if (quantity < 0) return "Quantidade não pode ser negativa.";

    const skuExists = products.some(
      (product) =>
        product.sku.toLowerCase() === createForm.sku.trim().toLowerCase(),
    );
    if (skuExists) return "SKU já cadastrado.";

    const normalizedEan = createForm.ean.trim().toLowerCase();
    const eanExists = normalizedEan
      ? products.some((product) => product.ean?.toLowerCase() === normalizedEan)
      : false;
    if (eanExists) return "EAN já cadastrado.";

    return "";
  };

  const handleSaveCreate = () => {
    const validationError = validateCreate();

    if (validationError) {
      setCreateError(validationError);
      return;
    }

    const nextProduct = {
      id: Date.now(),
      description: createForm.description.trim(),
      sku: createForm.sku.trim(),
      ean: createForm.ean.trim(),
      warehouseId: createForm.warehouseId,
      currentLocation: createForm.currentLocation.trim(),
      quantity: Number(createForm.quantity),
      status: "aguardando_separacao",
    };

    stockService.saveProduct(nextProduct);
    setProducts(stockService.listProducts());
    setPage(0);
    handleCloseCreate();
    setFeedback("Produto cadastrado com sucesso.");
  };

  return {
    filteredProducts,
    summary,
    search,
    warehouseFilter,
    page,
    rowsPerPage,
    editingProduct,
    editQuantity,
    editError,
    createOpen,
    createForm,
    createError,
    movingProduct,
    moveLocation,
    moveQuantity,
    moveError,
    transferringProduct,
    transferWarehouseId,
    transferQuantity,
    transferError,
    feedback,
    setFeedback,
    setPage,
    setRowsPerPage,
    setEditQuantity,
    setMoveLocation,
    setMoveQuantity,
    setTransferWarehouseId,
    setTransferQuantity,
    handleSearchChange,
    handleWarehouseFilterChange,
    handleOpenEdit,
    handleCloseEdit,
    handleSaveEdit,
    handleOpenMoveLocation,
    handleCloseMoveLocation,
    handleSaveMoveLocation,
    handleOpenTransfer,
    handleCloseTransfer,
    handleConfirmTransfer,
    handleOpenCreate,
    handleCloseCreate,
    handleCreateChange,
    handleSaveCreate,
  };
};
