import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Snackbar,
  Stack,
  TextField,
} from "@mui/material";
import { StockCreateDialog } from "../../stock/components/StockCreateDialog";
import { FinishReceivingDialog } from "./FinishReceivingDialog";
import { ReceivingInvoiceInput } from "./ReceivingInvoiceInput";
import { ReceivingItemsTable } from "./ReceivingItemsTable";
import { ReceivingProductScanInput } from "./ReceivingProductScanInput";
import { ReceivingQuantityInput } from "./ReceivingQuantityInput";
import { ReceivingReviewPanel } from "./ReceivingReviewPanel";
import { useCreateReceivingModal } from "../hooks/useCreateReceivingModal";
import { WAREHOUSES } from "../../../shared/utils/warehouseCatalog";

export const CreateReceivingModal = ({
  open,
  onClose,
  stockProducts,
  initialNote = null,
  onSaveNote,
  onCreateStockProduct,
}) => {
  const {
    refs,
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
    conferenceStatus,
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
  } = useCreateReceivingModal({
    open,
    initialNote,
    stockProducts,
    onSaveNote,
    onCreateStockProduct,
    onClose,
  });

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              select
              label="Estoque"
              value={warehouseId}
              onChange={(event) => handleWarehouseChange(event.target.value)}
              fullWidth
              helperText="Os itens desta nota serão enviados para o estoque selecionado."
            >
              {WAREHOUSES.map((warehouse) => (
                <MenuItem key={warehouse.id} value={warehouse.id}>
                  {warehouse.label}
                </MenuItem>
              ))}
            </TextField>

            <ReceivingInvoiceInput
              value={invoiceKey}
              onChange={setInvoiceKey}
              inputRef={refs.invoiceRef}
              title="Número da nota"
              disabled={Boolean(editingNoteId) && !isConferenceMode}
              onSubmit={handleInvoiceScan}
            />

            {!isConferenceMode && (
              <>
                <ReceivingProductScanInput
                  value={productScan}
                  options={warehouseProducts}
                  selectedProduct={currentProduct}
                  onChange={handleProductScan}
                  onSelectProduct={handleProductSelect}
                  inputRef={refs.productRef}
                  showCreateButton={showCreateProductButton}
                  onCreateProduct={handleOpenStockCreate}
                  onSubmit={handleProductScanSubmit}
                />

                <ReceivingReviewPanel product={currentProduct} />

                <ReceivingQuantityInput
                  value={quantity}
                  onChange={setQuantity}
                  inputRef={refs.quantityRef}
                  onSubmit={handleAddItem}
                />
              </>
            )}

            <Stack direction="row" spacing={2}>
              {!isConferenceMode && (
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleAddItem}
                  sx={{ minWidth: 180 }}
                >
                  Adicionar item
                </Button>
              )}
              <Button
                variant="outlined"
                size="large"
                onClick={handleOpenFinish}
                disabled={!items.length}
              >
                Finalizar recebimento
              </Button>
            </Stack>

            <Box>
              <Box sx={{ fontSize: "1rem", fontWeight: 700, mb: 1 }}>
                Itens recebidos
              </Box>
              <ReceivingItemsTable
                items={items}
                mode={isConferenceMode ? "conference" : "manual"}
                onEditItem={isConferenceMode ? undefined : handleEditItem}
                onRemoveItem={isConferenceMode ? undefined : handleRemoveItem}
                onReceivedQtyChange={handleReceivedQtyChange}
              />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
        </DialogActions>
      </Dialog>

      <FinishReceivingDialog
        open={finishOpen}
        note={{
          key: invoiceKey,
          items,
          status: initialNote?.status,
          computedStatus: conferenceStatus,
          isConference: isConferenceMode,
          observation: initialNote?.observation,
        }}
        onClose={() => setFinishOpen(false)}
        onConfirm={handleFinish}
      />

      <StockCreateDialog
        open={stockCreateOpen}
        form={stockCreateForm}
        error={stockCreateError}
        onChange={handleStockCreateChange}
        onClose={handleCloseStockCreate}
        onSave={handleSaveStockCreate}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={() => setSnackbar((current) => ({ ...current, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};
