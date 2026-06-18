import { Alert, Box, Button, Chip, Paper, Stack, TextField } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import { MainLayout } from "../../../shared/layout/MainLayout";
import { AddressingConfirmDialog } from "../components/AddressingConfirmDialog";
import { AddressingHistoryPanel } from "../components/AddressingHistoryPanel";
import { LocationScanInput } from "../components/LocationScanInput";
import { ProductPendingCard } from "../components/ProductPendingCard";
import { SelectedLocationCard } from "../components/SelectedLocationCard";
import { StockStatusChip } from "../components/StockStatusChip";
import { useAddressingOperation } from "../hooks/useAddressingOperation";
import { addressingService } from "../services/addressingService";
import { ReceivingStatusChip } from "../../receiving/components/ReceivingStatusChip";

export const StockAddressingPage = () => {
  const navigate = useNavigate();
  const routeLocation = useLocation();
  const initialIds = routeLocation.state?.itemIds ||
    (routeLocation.state?.itemId ? [routeLocation.state.itemId] : []);
  const initialItems = initialIds.map((itemId) => addressingService.findItemById(itemId)).filter(Boolean);
  const returnTo = routeLocation.state?.returnTo || "/enderecamento";
  const operation = useAddressingOperation(initialItems);
  const item = operation.selectedItem;

  return (
    <MainLayout>
      <Stack spacing={3}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2} flexWrap="wrap">
          <Box>
            <Box sx={{ fontSize: "2rem", fontWeight: 700 }}>Endereçamento Operacional</Box>
            <Box sx={{ color: "text.secondary" }}>Bipagem e alocação física de produtos recebidos</Box>
          </Box>
          <Button variant="outlined" onClick={() => navigate(returnTo)}>Voltar para fila</Button>
        </Stack>

        {!item ? (
          <Paper elevation={0} sx={{ border: "1px solid", borderColor: "divider", p: { xs: 2, md: 4 }, borderRadius: 2 }}>
            <Stack spacing={2} alignItems="stretch">
              <Box sx={{ fontSize: "1.25rem", fontWeight: 700 }}>Localizar produto pendente</Box>
              <TextField
                inputRef={operation.productRef}
                value={operation.productScan}
                onChange={(event) => operation.setProductScan(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") { event.preventDefault(); operation.handleFindProduct(); }
                }}
                fullWidth
                autoComplete="off"
                placeholder="Bipe ou digite o SKU, EAN ou nome do produto"
                inputProps={{ style: { fontSize: "1.2rem", padding: "20px" } }}
              />
              {operation.errorMessage && <Alert severity="error">{operation.errorMessage}</Alert>}
              <Button variant="contained" size="large" onClick={operation.handleFindProduct}>Localizar produto</Button>
            </Stack>
          </Paper>
        ) : (
          <>
            {operation.sessionItems.length > 1 && (
              <Paper elevation={0} sx={{ p: 2, border: "1px solid", borderColor: "divider" }}>
                <Stack spacing={1.2}>
                  <Box sx={{ fontWeight: 700 }}>Produtos desta operação</Box>
                  <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                    {operation.sessionItems.map((sessionItem) => (
                      <Chip
                        key={sessionItem.id}
                        clickable
                        color={sessionItem.id === item.id ? "primary" : sessionItem.pendingQty === 0 ? "success" : "default"}
                        variant={sessionItem.id === item.id ? "filled" : "outlined"}
                        label={`${sessionItem.sku} · ${sessionItem.pendingQty} pendente(s)`}
                        onClick={() => operation.selectItem(sessionItem.id)}
                      />
                    ))}
                  </Stack>
                </Stack>
              </Paper>
            )}
            <Paper elevation={0} sx={{ border: "1px solid", borderColor: "divider", p: 2.5, borderRadius: 2 }}>
              <Stack direction="row" spacing={2.5} useFlexGap flexWrap="wrap" alignItems="center">
                <Box><strong>Ordem/NF:</strong> {item.orderCode}</Box>
                <Box><strong>SKU:</strong> {item.sku}</Box>
                <Box sx={{ flex: "1 1 260px" }}><strong>Produto:</strong> {item.productName}</Box>
                <StockStatusChip status={item.status} />
                <ReceivingStatusChip status={item.receivingStatus} />
                <Button variant="outlined" onClick={operation.changeProduct}>Trocar produto</Button>
              </Stack>
            </Paper>

            {item.receivingHasIssue && (
              <Alert severity={item.receivingStatus === "divergente" ? "error" : "warning"}>
                <strong>Ocorrência no recebimento da nota {item.noteNumber}:</strong>{" "}
                {item.noteObservation || "Nenhuma observação foi informada."} O endereçamento está liberado, mas a ocorrência continuará vinculada ao produto e aos movimentos.
              </Alert>
            )}

            <Stack direction="row" spacing={2} useFlexGap flexWrap="wrap" alignItems="flex-start">
              <Box sx={{ flex: "2 1 650px", minWidth: 300 }}>
                <Stack spacing={2}>
                  <ProductPendingCard product={item} />
                  {item.pendingQty > 0 ? (
                    <Paper elevation={0} sx={{ border: "1px solid", borderColor: "divider", p: 2.5, borderRadius: 2 }}>
                      <Stack spacing={2.2}>
                        <LocationScanInput
                          locationCode={operation.locationCode}
                          quantity={operation.quantity}
                          maxQuantity={Math.min(item.pendingQty, operation.availableCapacity || item.pendingQty)}
                          onLocationChange={operation.setLocationCode}
                          onQuantityChange={operation.setQuantity}
                          onConfirm={operation.validateConfirm}
                          locationRef={operation.locationRef}
                        />
                        {operation.errorMessage && <Alert severity="error">{operation.errorMessage}</Alert>}
                        <Button variant="contained" size="large" onClick={operation.validateConfirm} sx={{ minHeight: 52 }}>
                          Confirmar endereçamento
                        </Button>
                      </Stack>
                    </Paper>
                  ) : (
                    <Alert severity="success">Produto totalmente endereçado e liberado para separação.</Alert>
                  )}
                </Stack>
              </Box>

              <Box sx={{ flex: "1 1 320px", minWidth: 280 }}>
                <Stack spacing={2}>
                  <SelectedLocationCard location={operation.selectedLocation} />
                  <AddressingHistoryPanel history={operation.history} alerts={operation.alerts} />
                </Stack>
              </Box>
            </Stack>
          </>
        )}
      </Stack>

      <AddressingConfirmDialog
        open={operation.confirmOpen}
        onClose={operation.closeConfirm}
        onConfirm={operation.handleConfirm}
        product={item}
        location={operation.selectedLocation}
        quantity={operation.quantity}
      />
    </MainLayout>
  );
};
