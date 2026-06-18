import { useMemo, useRef, useState } from "react";
import { Alert, Box, Button, Paper, Stack } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { MainLayout } from "../../../shared/layout/MainLayout";
import { playScanError, playScanSuccess } from "../../../shared/utils/scanAudio";
import { pickingService } from "../services/pickingService";
import { PickingSessionHeader } from "../components/PickingSessionHeader";
import { CurrentPickingItemCard } from "../components/CurrentPickingItemCard";
import { LocationScanInput } from "../components/LocationScanInput";
import { ProductScanInput } from "../components/ProductScanInput";
import { PickingQuantityInput } from "../components/PickingQuantityInput";
import { PickingItemsQueuePanel } from "../components/PickingItemsQueuePanel";
import { PickingHistoryPanel } from "../components/PickingHistoryPanel";
import { RemoveItemFromSessionDialog } from "../components/RemoveItemFromSessionDialog";
import { FinishPickingSessionDialog } from "../components/FinishPickingSessionDialog";
import { useAuth } from "../../../auth/context/AuthContext";

export const PickingSessionPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [session, setSession] = useState(() => pickingService.getSession(id));
  const [items, setItems] = useState(() =>
    pickingService.listSessionItems(id),
  );
  const [currentId, setCurrentId] = useState(
    items.find((item) => item.missingQty > 0)?.id || items[0]?.id,
  );
  const [location, setLocation] = useState("");
  const [product, setProduct] = useState("");
  const [quantity, setQuantity] = useState(
    items.find((item) => item.id === currentId)?.missingQty || 1,
  );
  const [error, setError] = useState("");
  const [removeItem, setRemoveItem] = useState(null);
  const [finishOpen, setFinishOpen] = useState(false);
  const [zones, setZones] = useState(() =>
    Object.fromEntries(items.map((item) => [item.id, item.suggestedZone])),
  );
  const locationRef = useRef(null);
  const productRef = useRef(null);
  const current = items.find((item) => item.id === currentId);

  const refresh = (nextSession) => {
    const activeSession = nextSession || pickingService.getSession(id);
    setSession(activeSession);
    const nextItems = pickingService.listSessionItems(id);
    setItems(nextItems);
    return nextItems;
  };

  const select = (itemId) => {
    setCurrentId(itemId);
    const item = items.find((currentItem) => currentItem.id === itemId);
    setQuantity(item?.missingQty || 1);
    setLocation("");
    setProduct("");
    setError("");
    setTimeout(() => locationRef.current?.focus(), 40);
  };

  const rejectScan = (message) => {
    playScanError();
    setError(message);
  };

  const validateLocationScan = () => {
    if (location.trim().toLowerCase() !== current.locationCode.toLowerCase()) {
      rejectScan(`Local incorreto. Dirija-se ao local ${current.locationCode}.`);
      return;
    }
    playScanSuccess();
    setError("");
    productRef.current?.focus();
  };

  const validateProductScan = () => {
    const code = product.trim().toLowerCase();
    if (code !== current.sku.toLowerCase() && code !== current.ean.toLowerCase()) {
      rejectScan("Produto bipado não corresponde ao item atual.");
      return;
    }
    playScanSuccess();
    setError("");
  };

  const confirm = () => {
    if (session.status === "pausada") {
      rejectScan("Retome a sessão antes de confirmar.");
      return;
    }
    try {
      const result = pickingService.confirmPick({
        sessionId: id,
        itemId: current.id,
        locationCode: location,
        productCode: product,
        quantity,
      });
      playScanSuccess();
      const nextItems = refresh(result.session);
      const nextItem = nextItems.find((item) => item.id !== current.id && item.missingQty > 0);
      if (nextItem) select(nextItem.id);
      else {
        setLocation("");
        setProduct("");
        setQuantity(Math.max(1, result.item.missingQty));
        setTimeout(() => locationRef.current?.focus(), 40);
      }
      setError("");
    } catch (confirmationError) {
      rejectScan(confirmationError.message);
    }
  };

  const totals = useMemo(
    () => items.reduce((sum, item) => sum + item.missingQty, 0),
    [items],
  );

  if (!session) {
    return <MainLayout><Alert severity="error">Sessão não encontrada.</Alert></MainLayout>;
  }

  const isOwner = session.operatorId === user.id ||
    (!session.operatorId && session.operatorUsername === user.username);
  if (!isOwner) {
    return (
      <MainLayout>
        <Stack spacing={2} alignItems="flex-start">
          <Alert severity="warning">
            Esta sessão pertence a {session.operator}. Somente o operador que iniciou pode retomá-la.
          </Alert>
          <Button variant="contained" onClick={() => navigate("/separacao")}>Voltar para separação</Button>
        </Stack>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Stack spacing={2}>
        <PickingSessionHeader
          session={session}
          items={items}
          onPause={() => setSession(pickingService.pauseSession(id))}
          onCancel={() => {
            pickingService.cancelSession(id);
            navigate("/separacao");
          }}
          onFinish={() => setFinishOpen(true)}
        />
        {error && <Alert severity="error">{error}</Alert>}
        {current && (
          <Stack direction="row" spacing={2} useFlexGap flexWrap="wrap" alignItems="flex-start">
            <Box sx={{ flex: "2 1 620px" }}>
              <Stack spacing={2}>
                <CurrentPickingItemCard item={current} />
                <Paper elevation={0} sx={{ p: 2.5, border: "1px solid", borderColor: "divider" }}>
                  <Stack spacing={2}>
                    <LocationScanInput inputRef={locationRef} value={location}
                      onChange={setLocation} onSubmit={validateLocationScan} />
                    <ProductScanInput inputRef={productRef} value={product}
                      onChange={setProduct} onSubmit={validateProductScan} />
                    <PickingQuantityInput value={quantity} onChange={setQuantity} max={current.missingQty} />
                    <Button size="large" variant="contained" onClick={confirm}
                      disabled={session.status === "pausada"}>
                      4. Confirmar retirada
                    </Button>
                  </Stack>
                </Paper>
              </Stack>
            </Box>
            <Box sx={{ flex: "1 1 330px" }}>
              <Stack spacing={2}>
                <PickingItemsQueuePanel items={items} currentId={currentId}
                  onSelect={select} onRemove={setRemoveItem} />
                <PickingHistoryPanel events={session.events} />
                <Alert severity={totals === 0 ? "success" : "info"}>
                  {totals === 0
                    ? "Todos os itens foram separados."
                    : `${totals} unidade(s) ainda pendente(s).`}
                </Alert>
              </Stack>
            </Box>
          </Stack>
        )}
      </Stack>
      <RemoveItemFromSessionDialog
        open={Boolean(removeItem)}
        item={removeItem}
        onClose={() => setRemoveItem(null)}
        onConfirm={() => {
          const nextSession = pickingService.removeItem(id, removeItem.id);
          setRemoveItem(null);
          const remaining = refresh(nextSession);
          if (remaining.length) select(remaining[0].id);
          else navigate("/separacao");
        }}
      />
      <FinishPickingSessionDialog
        open={finishOpen}
        items={items}
        zones={zones}
        onZone={(itemId, value) => setZones((currentZones) => ({
          ...currentZones,
          [itemId]: value,
        }))}
        onClose={() => setFinishOpen(false)}
        onConfirm={() => {
          pickingService.finishSession(id, zones);
          navigate("/separacao");
        }}
      />
    </MainLayout>
  );
};
