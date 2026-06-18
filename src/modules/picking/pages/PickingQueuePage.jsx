import { useEffect, useMemo, useState } from "react";
import { Alert, Box, Stack, Tab, Tabs } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "../../../shared/layout/MainLayout";
import { PickingSummaryCards } from "../components/PickingSummaryCards";
import { PickingFilters } from "../components/PickingFilters";
import { PickingSelectableTable } from "../components/PickingSelectableTable";
import { StartPickingSessionBar } from "../components/StartPickingSessionBar";
import { pickingService } from "../services/pickingService";
import { useAuth } from "../../../auth/context/AuthContext";
import { ActivePickingSessionsPanel } from "../components/ActivePickingSessionsPanel";
import { ReleasePickingSessionDialog } from "../components/ReleasePickingSessionDialog";
import { pickingNeedsAttention } from "../../../shared/utils/statusCatalog";
import {
  readPickingQueuePreferences,
  writePickingQueuePreferences,
} from "../utils/pickingQueuePreferences";

export const PickingQueuePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [initialPreferences] = useState(readPickingQueuePreferences);
  const [mode, setMode] = useState(initialPreferences.mode);
  const [items, setItems] = useState(() => pickingService.listItems());
  const [orders, setOrders] = useState(() => pickingService.listOrders());
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState(initialPreferences.search);
  const [marketplace, setMarketplace] = useState(initialPreferences.marketplace);
  const [status, setStatus] = useState(initialPreferences.status);
  const [error, setError] = useState("");
  const [activeSessions, setActiveSessions] = useState(() => pickingService.listActiveSessions());
  const [releaseSession, setReleaseSession] = useState(null);

  useEffect(() => {
    writePickingQueuePreferences({ mode, search, marketplace, status });
  }, [marketplace, mode, search, status]);

  const refresh = () => {
    setItems(pickingService.listItems());
    setOrders(pickingService.listOrders());
    setActiveSessions(pickingService.listActiveSessions());
    setSelected([]);
  };

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase();
    const source = mode === "items" ? items : orders;

    return source.filter((row) => {
      const matchesMarketplace = marketplace === "Todos" || row.marketplace === marketplace;
      const matchesStatus =
        status === "all" ||
        (status === "attention" && pickingNeedsAttention(row.status)) ||
        row.status === status;
      const fields = mode === "items"
        ? [row.orderId, row.sku, row.ean, row.productName, row.marketplace, row.locationCode]
        : [row.id, row.marketplace, row.customer, row.carrier];
      const matchesSearch = !term || fields.some(
        (value) => String(value || "").toLowerCase().includes(term),
      );

      return matchesMarketplace && matchesStatus && matchesSearch;
    });
  }, [items, marketplace, mode, orders, search, status]);

  const summary = useMemo(() => {
    const packaging = pickingService.listPackagingQueue();
    const today = new Date().toDateString();
    const packagingIds = new Set([
      ...items.filter((item) => item.status === "aguardando_embalamento").map((item) => item.id),
      ...packaging.map((item) => item.id),
    ]);
    return {
      pending: items.filter((item) => item.status === "aguardando_separacao").length,
      active: items.filter((item) => item.status === "em_separacao").length,
      missing: items.filter((item) => item.status === "faltou_item").length,
      packaging: packagingIds.size,
      today: packaging.filter((item) => new Date(item.queuedAt).toDateString() === today).length,
    };
  }, [items]);

  const selectedItems = mode === "items"
    ? items.filter((item) => selected.includes(item.id))
    : items.filter((item) => selected.includes(item.orderId));

  const start = (ids = selected, selectedMode = mode) => {
    try {
      const itemIds = selectedMode === "items"
        ? ids
        : items.filter((item) => ids.includes(item.orderId)).map((item) => item.id);
      const session = pickingService.createSession({
        itemIds,
        mode: selectedMode === "orders" ? "order" : "items",
        operator: user.name,
        operatorId: user.id,
        operatorUsername: user.username,
      });
      navigate(`/separacao/sessao/${session.id}`);
    } catch (sessionError) {
      setError(sessionError.message);
      refresh();
    }
  };

  return (
    <MainLayout>
      <Stack spacing={3}>
        <Box>
          <Box sx={{ fontSize: "2rem", fontWeight: 700 }}>Separação</Box>
          <Box color="text.secondary">Selecione itens ou pedidos para iniciar a separação</Box>
        </Box>
        <PickingSummaryCards summary={summary} />
        <ActivePickingSessionsPanel
          sessions={activeSessions}
          user={user}
          canRelease={["admin", "supervisor"].includes(user.role)}
          onResume={(sessionId) => navigate(`/separacao/sessao/${sessionId}`)}
          onRelease={setReleaseSession}
        />
        {error && <Alert severity="error">{error}</Alert>}
        <Tabs value={mode} onChange={(_, value) => {
          setMode(value);
          setSelected([]);
        }}>
          <Tab value="items" label="Por itens" />
          <Tab value="orders" label="Por pedidos" />
        </Tabs>
        <PickingFilters
          mode={mode}
          search={search}
          marketplace={marketplace}
          status={status}
          onSearch={setSearch}
          onMarketplace={setMarketplace}
          onStatus={(value) => {
            setStatus(value);
            setSelected([]);
          }}
          onRefresh={refresh}
        />
        <PickingSelectableTable
          mode={mode}
          rows={rows}
          selectedIds={selected}
          onSelection={setSelected}
          onStartOne={(row) => start([row.id], mode)}
        />
        <StartPickingSessionBar items={selectedItems} onStart={() => start()} />
      </Stack>
      <ReleasePickingSessionDialog
        open={Boolean(releaseSession)}
        session={releaseSession}
        onClose={() => setReleaseSession(null)}
        onConfirm={() => {
          try {
            pickingService.releaseSession(releaseSession.id, user.name);
            setReleaseSession(null);
            setError("");
            refresh();
          } catch (releaseError) {
            setError(releaseError.message);
            setReleaseSession(null);
          }
        }}
      />
    </MainLayout>
  );
};
