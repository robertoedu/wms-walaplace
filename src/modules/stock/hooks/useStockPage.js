import { useEffect, useMemo, useState } from "react";
import { stockService } from "../services/stockService";

const emptyForm = {
  description: "",
  sku: "",
  ean: "",
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
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editQuantity, setEditQuantity] = useState("");
  const [editError, setEditError] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState(emptyForm);
  const [createError, setCreateError] = useState("");
  const [feedback, setFeedback] = useState("");

  useEffect(() => {
    const refresh = () => setProducts(stockService.listProducts());
    window.addEventListener("wms-stock-change", refresh);
    return () => window.removeEventListener("wms-stock-change", refresh);
  }, []);

  const filteredProducts = useMemo(
    () => products.filter((product) => productMatchesSearch(product, search)),
    [products, search],
  );

  const summary = useMemo(
    () => ({
      totalProducts: products.length,
      totalQuantity: products.reduce(
        (total, product) => total + Number(product.quantity || 0),
        0,
      ),
      withoutLocation: products.filter((product) => !product.currentLocation)
        .length,
      lowStock: products.filter((product) => Number(product.quantity) <= 10)
        .length,
    }),
    [products],
  );

  const handleSearchChange = (value) => {
    setSearch(value);
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

    stockService.updateQuantity(editingProduct.sku, nextQuantity);
    setProducts(stockService.listProducts());
    handleCloseEdit();
    setFeedback("Quantidade atualizada com sucesso.");
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
      createForm.ean,
      createForm.quantity,
    ].map((value) => String(value).trim());

    if (values.some((value) => !value)) return "Todos os campos são obrigatórios.";

    const quantity = Number(createForm.quantity);
    if (Number.isNaN(quantity)) return "Informe uma quantidade válida.";
    if (quantity < 0) return "Quantidade não pode ser negativa.";

    const skuExists = products.some(
      (product) =>
        product.sku.toLowerCase() === createForm.sku.trim().toLowerCase(),
    );
    if (skuExists) return "SKU já cadastrado.";

    const eanExists = products.some(
      (product) =>
        product.ean.toLowerCase() === createForm.ean.trim().toLowerCase(),
    );
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
    page,
    rowsPerPage,
    editingProduct,
    editQuantity,
    editError,
    createOpen,
    createForm,
    createError,
    feedback,
    setFeedback,
    setPage,
    setRowsPerPage,
    setEditQuantity,
    handleSearchChange,
    handleOpenEdit,
    handleCloseEdit,
    handleSaveEdit,
    handleOpenCreate,
    handleCloseCreate,
    handleCreateChange,
    handleSaveCreate,
  };
};
