import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  Stack,
} from "@mui/material";
import { StockCreateDialog } from "../../stock/components/StockCreateDialog";
import { FinishReceivingDialog } from "./FinishReceivingDialog";
import { ReceivingInvoiceInput } from "./ReceivingInvoiceInput";
import { ReceivingItemsTable } from "./ReceivingItemsTable";
import { ReceivingProductScanInput } from "./ReceivingProductScanInput";
import { ReceivingQuantityInput } from "./ReceivingQuantityInput";
import { ReceivingReviewPanel } from "./ReceivingReviewPanel";
import { useCreateReceivingModal } from "../hooks/useCreateReceivingModal";

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
            <ReceivingInvoiceInput
              value={invoiceKey}
              onChange={setInvoiceKey}
              inputRef={refs.invoiceRef}
              title={title}
              disabled={Boolean(editingNoteId)}
              onSubmit={handleInvoiceScan}
            />

            <ReceivingProductScanInput
              value={productScan}
              onChange={handleProductScan}
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

            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                size="large"
                onClick={handleAddItem}
                sx={{ minWidth: 180 }}
              >
                Adicionar item
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => setFinishOpen(true)}
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
                onEditItem={handleEditItem}
                onRemoveItem={handleRemoveItem}
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
