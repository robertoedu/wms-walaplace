import { useEffect, useRef, useState } from "react";
import { playScanError, playScanSuccess } from "../../../shared/utils/scanAudio";
import { DEFAULT_WAREHOUSE_ID, getWarehouseLabel } from "../../../shared/utils/warehouseCatalog";

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

const NOTE_NUMBER_LENGTH = 9;
const NOTE_NUMBER_PATTERN = new RegExp(`^\\d{${NOTE_NUMBER_LENGTH}}$`);
const NOTE_NUMBER_VALIDATION_MESSAGE = `Informe o número da nota com ${NOTE_NUMBER_LENGTH} dígitos, usando somente números.`;

const isValidNoteNumber = (value) =>
  NOTE_NUMBER_PATTERN.test(String(value || "").trim());

const getEditableNoteNumber = (note) => {
  if (!note) return "";
  if (note.nfeNumber) return String(note.nfeNumber);

  const digits = String(note.key || "").replace(/\D/g, "");
  return digits.length === NOTE_NUMBER_LENGTH ? digits : String(note.key || "");
};

const getConferenceStatus = (items) => {
  const hasOverage = items.some(
    (item) => Number(item.receivedQty) > Number(item.issuedQty ?? item.quantity ?? 0),
  );
  const hasShortage = items.some(
    (item) => Number(item.receivedQty) < Number(item.issuedQty ?? item.quantity ?? 0),
  );

  if (hasOverage) return "divergente";
  if (hasShortage) return "incompleta";
  return "completa";
};

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
  const [warehouseId, setWarehouseId] = useState(DEFAULT_WAREHOUSE_ID);
  const isConferenceMode = initialNote?.status === "prevista";
  const isExistingManualNote = Boolean(initialNote) && !isConferenceMode;
  const warehouseProducts = stockProducts.filter(
    (product) => (product.warehouseId || DEFAULT_WAREHOUSE_ID) === warehouseId,
  );

  useEffect(() => {
    const initializeTimer = setTimeout(() => {
      if (open) {
        if (initialNote) {
          setWarehouseId(initialNote.warehouseId || DEFAULT_WAREHOUSE_ID);
          setInvoiceKey(
            initialNote.status === "prevista"
              ? initialNote.nfeNumber || ""
              : getEditableNoteNumber(initialNote),
          );
          setItems(
            (initialNote.items || []).map((item) => ({
              sku: item.sku,
              description: item.description,
              ean: item.ean,
              quantity: Number(item.quantity ?? item.issuedQty ?? 0),
              expectedQty: Number(item.expectedQty ?? item.quantity ?? 0),
              issuedQty: Number(item.issuedQty ?? item.quantity ?? 0),
              receivedQty:
                initialNote.status === "prevista"
                  ? item.receivedQty ?? ""
                  : Number(item.receivedQty ?? item.quantity ?? 0),
            })),
          );
          setEditingNoteId(initialNote.id || null);
        } else {
          setWarehouseId(DEFAULT_WAREHOUSE_ID);
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
        setWarehouseId(DEFAULT_WAREHOUSE_ID);
      }
    }, 0);

    return () => clearTimeout(initializeTimer);
  }, [open, initialNote]);

  const title = isConferenceMode
    ? `Conferir nota - ${initialNote.key}`
    : invoiceKey
      ? `Recebimento - ${invoiceKey}`
      : "Adicionar nota";
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
    const foundProduct = warehouseProducts.find(
      (product) =>
        product.sku.toLowerCase() === term ||
        product.description.toLowerCase() === term,
    );

    if (!foundProduct) {
      setCurrentProduct(null);
      return;
    }

    setCurrentProduct(foundProduct);
    setQuantity("1");
    setTimeout(() => quantityRef.current?.focus(), 50);
  };

  const handleProductSelect = (product) => {
    if (!product) {
      setCurrentProduct(null);
      return;
    }

    setProductScan(product.sku);
    setCurrentProduct(product);
    setQuantity("1");
    setTimeout(() => quantityRef.current?.focus(), 50);
  };

  const handleWarehouseChange = (value) => {
    setWarehouseId(value);
    if (isConferenceMode) return;

    setProductScan("");
    setCurrentProduct(null);
    setQuantity("1");
    setEditingIndex(null);
    setItems([]);
  };

  const handleInvoiceScan = () => {
    if (!invoiceKey.trim()) {
      playScanError();
      return;
    }
    if (!isExistingManualNote && !isValidNoteNumber(invoiceKey)) {
      playScanError();
      showSnackbar(NOTE_NUMBER_VALIDATION_MESSAGE, "error");
      return;
    }
    playScanSuccess();
    productRef.current?.focus();
  };

  const handleProductScanSubmit = () => {
    if (!currentProduct) {
      playScanError();
      showSnackbar("Produto não encontrado pelo nome ou SKU.", "error");
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
      stockCreateForm.quantity,
    ].map((value) => String(value).trim());

    if (requiredValues.some((value) => !value)) {
      return "Preencha descrição, SKU e quantidade.";
    }

    const quantityValue = Number(stockCreateForm.quantity);

    if (Number.isNaN(quantityValue)) return "Informe uma quantidade válida.";
    if (quantityValue < 0) return "Quantidade não pode ser negativa.";

    const skuExists = warehouseProducts.some(
      (product) =>
        product.sku.toLowerCase() ===
        stockCreateForm.sku.trim().toLowerCase(),
    );

    if (skuExists) return "SKU já cadastrado.";

    const normalizedEan = stockCreateForm.ean.trim().toLowerCase();
    const eanExists = normalizedEan
      ? warehouseProducts.some(
          (product) => product.ean?.toLowerCase() === normalizedEan,
        )
      : false;

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
      warehouseId,
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
      showSnackbar("Digite um produto válido antes de adicionar.", "error");
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
      warehouseId,
      warehouseName: getWarehouseLabel(warehouseId),
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

  const handleReceivedQtyChange = (index, value) => {
    setItems((currentItems) =>
      currentItems.map((item, currentIndex) =>
        currentIndex === index ? { ...item, receivedQty: value } : item,
      ),
    );
  };

  const validateConference = () => {
    if (!isExistingManualNote && !isValidNoteNumber(invoiceKey)) {
      return NOTE_NUMBER_VALIDATION_MESSAGE;
    }
    if (!isConferenceMode) return "";
    if (!items.length) {
      return "A nota precisa ter ao menos um item.";
    }

    const invalidItem = items.find((item) => {
      const value = Number(item.receivedQty);
      return (
        item.receivedQty === "" ||
        !Number.isInteger(value) ||
        value < 0
      );
    });

    return invalidItem ? "Preencha a quantidade recebida de todos os itens." : "";
  };

  const handleOpenFinish = () => {
    const validationError = validateConference();

    if (validationError) {
      playScanError();
      showSnackbar(validationError, "error");
      return;
    }

    setFinishOpen(true);
  };

  const handleFinish = (finishData) => {
    const noteStatus = isConferenceMode
      ? getConferenceStatus(items)
      : finishData.status;

    onSaveNote({
      id: editingNoteId,
      key: isConferenceMode ? initialNote.key : invoiceKey.trim(),
      nfeNumber: invoiceKey.trim(),
      status: noteStatus,
      observation: finishData.observation,
      createdAt: initialNote?.createdAt || new Date().toISOString(),
      issuedAt: initialNote?.issuedAt,
      finalizedAt: new Date().toISOString(),
      supplier: initialNote?.supplier || "Fornecedor manual",
      warehouseId,
      warehouseName: getWarehouseLabel(warehouseId),
      items: items.map((item) => ({
        ...item,
        warehouseId,
        warehouseName: getWarehouseLabel(warehouseId),
        quantity: Number(item.issuedQty ?? item.quantity ?? 0),
        expectedQty: Number(item.expectedQty ?? item.quantity ?? 0),
        issuedQty: Number(item.issuedQty ?? item.quantity ?? 0),
        receivedQty: Number(item.receivedQty ?? item.quantity ?? 0),
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
    warehouseId,
    warehouseProducts,
    quantity,
    setQuantity,
    items,
    snackbar,
    setSnackbar,
    finishOpen,
    setFinishOpen,
    handleOpenFinish,
    editingNoteId,
    isConferenceMode,
    conferenceStatus: isConferenceMode ? getConferenceStatus(items) : initialNote?.status,
    stockCreateOpen,
    stockCreateForm,
    stockCreateError,
    showCreateProductButton,
    handleWarehouseChange,
    handleProductScan,
    handleProductSelect,
    handleInvoiceScan,
    handleProductScanSubmit,
    handleOpenStockCreate,
    handleCloseStockCreate,
    handleStockCreateChange,
    handleSaveStockCreate,
    handleAddItem,
    handleEditItem,
    handleRemoveItem,
    handleReceivedQtyChange,
    handleFinish,
  };
};
