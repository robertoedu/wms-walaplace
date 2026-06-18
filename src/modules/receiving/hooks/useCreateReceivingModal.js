import { useEffect, useRef, useState } from "react";
import { playScanError, playScanSuccess } from "../../../shared/utils/scanAudio";

const emptyStockForm = {
  description: "",
  sku: "",
  ean: "",
  currentLocation: "",
  quantity: "",
};

const buildSearchKeys = (values) =>
  values
    .filter(Boolean)
    .map((value) => String(value).trim().toLowerCase());

export const useCreateReceivingModal = ({
  open,
  initialNote,
  stockProducts,
  onSaveNote,
  onCreateStockProduct,
  onClose,
}) => {
  const invoiceRef = useRef(null);
  const productRef = useRef(null);
  const quantityRef = useRef(null);

  const [invoiceKey, setInvoiceKey] = useState("");
  const [productScan, setProductScan] = useState("");
  const [currentProduct, setCurrentProduct] = useState(null);
  const [quantity, setQuantity] = useState("1");
  const [items, setItems] = useState([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [finishOpen, setFinishOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [stockCreateOpen, setStockCreateOpen] = useState(false);
  const [stockCreateForm, setStockCreateForm] = useState(emptyStockForm);
  const [stockCreateError, setStockCreateError] = useState("");

  useEffect(() => {
    const initializeTimer = setTimeout(() => {
      if (open) {
        if (initialNote) {
          setInvoiceKey(initialNote.key || "");
          setItems(
            (initialNote.items || []).map((item) => ({
              sku: item.sku,
              description: item.description,
              ean: item.ean,
              quantity: item.quantity,
            })),
          );
          setEditingNoteId(initialNote.id || null);
        } else {
          setInvoiceKey("");
          setItems([]);
          setEditingNoteId(null);
        }
        setProductScan("");
        setCurrentProduct(null);
        setQuantity("1");
        setEditingIndex(null);
        setFinishOpen(false);
        setStockCreateOpen(false);
        setStockCreateForm(emptyStockForm);
        setStockCreateError("");
        setTimeout(() => invoiceRef.current?.focus(), 100);
      } else {
        setInvoiceKey("");
        setProductScan("");
        setCurrentProduct(null);
        setQuantity("1");
        setItems([]);
        setEditingIndex(null);
        setEditingNoteId(null);
        setFinishOpen(false);
        setStockCreateOpen(false);
        setStockCreateForm(emptyStockForm);
        setStockCreateError("");
      }
    }, 0);

    return () => clearTimeout(initializeTimer);
  }, [open, initialNote]);

  const title = invoiceKey ? `Recebimento - ${invoiceKey}` : "Adicionar nota";
  const productWasTyped = productScan.trim().length > 0;
  const showCreateProductButton = productWasTyped && !currentProduct;

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleProductScan = (value) => {
    setProductScan(value);

    if (!value) {
      setCurrentProduct(null);
      return;
    }

    const term = value.trim().toLowerCase();
    const foundProduct = stockProducts.find(
      (product) =>
        product.sku.toLowerCase() === term ||
        product.ean.toLowerCase() === term ||
        product.description.toLowerCase().includes(term) ||
        product.searchKeys?.includes(term),
    );

    if (!foundProduct) {
      setCurrentProduct(null);
      return;
    }

    setCurrentProduct(foundProduct);
    setQuantity("1");
    setTimeout(() => quantityRef.current?.focus(), 50);
  };

  const handleInvoiceScan = () => {
    if (!invoiceKey.trim()) {
      playScanError();
      return;
    }
    playScanSuccess();
    productRef.current?.focus();
  };

  const handleProductScanSubmit = () => {
    if (!currentProduct) {
      playScanError();
      showSnackbar("Produto não encontrado no estoque.", "error");
      return;
    }
    playScanSuccess();
    quantityRef.current?.focus();
  };

  const handleOpenStockCreate = () => {
    const value = productScan.trim();

    setStockCreateForm({
      ...emptyStockForm,
      sku: value.toUpperCase().startsWith("SKU") ? value : "",
      ean: /^\d+$/.test(value) ? value : "",
    });
    setStockCreateError("");
    setStockCreateOpen(true);
  };

  const handleCloseStockCreate = () => {
    setStockCreateOpen(false);
    setStockCreateForm(emptyStockForm);
    setStockCreateError("");
  };

  const handleStockCreateChange = (field, value) => {
    setStockCreateForm((currentForm) => ({ ...currentForm, [field]: value }));
  };

  const validateStockCreate = () => {
    const requiredValues = [
      stockCreateForm.description,
      stockCreateForm.sku,
      stockCreateForm.ean,
      stockCreateForm.quantity,
    ].map((value) => String(value).trim());

    if (requiredValues.some((value) => !value)) {
      return "Preencha descrição, SKU, EAN e quantidade.";
    }

    const quantityValue = Number(stockCreateForm.quantity);

    if (Number.isNaN(quantityValue)) return "Informe uma quantidade válida.";
    if (quantityValue < 0) return "Quantidade não pode ser negativa.";

    const skuExists = stockProducts.some(
      (product) =>
        product.sku.toLowerCase() ===
        stockCreateForm.sku.trim().toLowerCase(),
    );

    if (skuExists) return "SKU já cadastrado.";

    const eanExists = stockProducts.some(
      (product) =>
        product.ean.toLowerCase() ===
        stockCreateForm.ean.trim().toLowerCase(),
    );

    if (eanExists) return "EAN já cadastrado.";

    return "";
  };

  const handleSaveStockCreate = () => {
    const validationError = validateStockCreate();

    if (validationError) {
      setStockCreateError(validationError);
      return;
    }

    const createdProduct = {
      id: Date.now(),
      description: stockCreateForm.description.trim(),
      sku: stockCreateForm.sku.trim(),
      ean: stockCreateForm.ean.trim(),
      currentLocation: stockCreateForm.currentLocation.trim(),
      quantity: Number(stockCreateForm.quantity),
      status: "aguardando_separacao",
      searchKeys: buildSearchKeys([
        stockCreateForm.description,
        stockCreateForm.sku,
        stockCreateForm.ean,
        stockCreateForm.currentLocation,
      ]),
    };

    onCreateStockProduct?.(createdProduct);
    setCurrentProduct(createdProduct);
    setProductScan(createdProduct.sku);
    setQuantity("1");
    handleCloseStockCreate();
    showSnackbar("Produto cadastrado no estoque.");
    setTimeout(() => quantityRef.current?.focus(), 50);
  };

  const handleAddItem = () => {
    if (!currentProduct) {
      playScanError();
      showSnackbar("Bipe um produto válido antes de adicionar.", "error");
      return;
    }

    const parsedQuantity = Number(quantity);
    if (!parsedQuantity || parsedQuantity <= 0) {
      playScanError();
      showSnackbar("A quantidade não pode ser zero.", "error");
      return;
    }

    const alreadyAdded = items.some((item) => item.sku === currentProduct.sku);
    if (alreadyAdded && editingIndex === null) {
      playScanError();
      showSnackbar(
        "Este produto já foi adicionado na nota. Edite a quantidade diretamente na lista de itens.",
        "error",
      );
      return;
    }

    const nextItems = [...items];
    const itemToSave = {
      sku: currentProduct.sku,
      description: currentProduct.description,
      ean: currentProduct.ean,
      quantity: parsedQuantity,
    };

    if (editingIndex !== null) nextItems[editingIndex] = itemToSave;
    else nextItems.push(itemToSave);

    setItems(nextItems);
    playScanSuccess();
    setProductScan("");
    setCurrentProduct(null);
    setQuantity("1");
    setEditingIndex(null);
    showSnackbar("Item adicionado com sucesso.");
    setTimeout(() => productRef.current?.focus(), 50);
  };

  const handleEditItem = (index) => {
    const item = items[index];
    setEditingIndex(index);
    setCurrentProduct({
      sku: item.sku,
      description: item.description,
      ean: item.ean,
    });
    setProductScan(item.sku);
    setQuantity(String(item.quantity));
    setTimeout(() => quantityRef.current?.focus(), 50);
  };

  const handleRemoveItem = (index) => {
    setItems((currentItems) =>
      currentItems.filter((_, currentIndex) => currentIndex !== index),
    );
    showSnackbar("Item removido.");
  };

  const handleFinish = (finishData) => {
    onSaveNote({
      id: editingNoteId,
      key: invoiceKey,
      status: finishData.status,
      observation: finishData.observation,
      createdAt: initialNote?.createdAt || new Date().toISOString(),
      finalizedAt: new Date().toISOString(),
      supplier: initialNote?.supplier || "Fornecedor manual",
      items: items.map((item) => ({
        ...item,
        status: "aguardando_enderecamento",
      })),
    });
    setFinishOpen(false);
    onClose();
  };

  return {
    refs: { invoiceRef, productRef, quantityRef },
    title,
    invoiceKey,
    setInvoiceKey,
    productScan,
    currentProduct,
    quantity,
    setQuantity,
    items,
    snackbar,
    setSnackbar,
    finishOpen,
    setFinishOpen,
    editingNoteId,
    stockCreateOpen,
    stockCreateForm,
    stockCreateError,
    showCreateProductButton,
    handleProductScan,
    handleInvoiceScan,
    handleProductScanSubmit,
    handleOpenStockCreate,
    handleCloseStockCreate,
    handleStockCreateChange,
    handleSaveStockCreate,
    handleAddItem,
    handleEditItem,
    handleRemoveItem,
    handleFinish,
  };
};
