import { useMemo, useState } from "react";
import { Box, Button, Paper, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "../../../shared/layout/MainLayout";
import { AddressingModeTabs } from "../components/AddressingModeTabs";
import { AddressingSummaryCards } from "../components/AddressingSummaryCards";
import { AddressingFilters } from "../components/AddressingFilters";
import { AddressingTable } from "../components/AddressingTable";
import { addressingService } from "../services/addressingService";
import { addressingItemNeedsAttention } from "../../../shared/utils/processAttention";

export const StockAddressingProductsPage = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState(() => addressingService.listItems());
  const [selectedIds, setSelectedIds] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("attention");
  const [period, setPeriod] = useState("all");
  const [warehouseId, setWarehouseId] = useState("all");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const filteredItems = useMemo(() => {
    const term = search.trim().toLowerCase();
    const now = new Date();
    return items.filter((item) => {
      const receivedAt = new Date(item.receivedAt);
      const ageInDays = (now - receivedAt) / 86400000;
      const matchesPeriod = period === "all" ||
        (period === "today" && receivedAt.toDateString() === now.toDateString()) ||
        (period === "week" && ageInDays <= 7);
      const matchesStatus =
        status === "all" ||
        (status === "attention" && addressingItemNeedsAttention(item)) ||
        item.status === status;
      const matchesWarehouse =
        warehouseId === "all" ||
        String(item.warehouseId || "742") === warehouseId;
      const matchesSearch = !term ||
        [item.orderCode, item.sku, item.ean, item.productName]
          .some((value) => String(value || "").toLowerCase().includes(term));
      return matchesPeriod && matchesStatus && matchesWarehouse && matchesSearch;
    });
  }, [items, period, search, status, warehouseId]);

  const summary = useMemo(() => {
    const today = new Date().toDateString();
    return {
      aguardando: items.filter((item) => item.status === "aguardando_enderecamento").length,
      parcial: items.filter((item) => item.status === "enderecamento_parcial").length,
      enderecadosHoje: items.filter((item) => item.movements?.some((movement) =>
        new Date(movement.timestamp).toDateString() === today)).length,
      comProblema: items.filter((item) => item.receivingHasIssue).length,
    };
  }, [items]);

  const startSelected = () => navigate("/enderecamento/operacao", {
    state: { itemIds: selectedIds, returnTo: "/enderecamento/produtos" },
  });

  return (
    <MainLayout>
      <Stack spacing={3}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2} flexWrap="wrap">
          <Box>
            <Box sx={{ fontSize: "2rem", fontWeight: 700 }}>Endereçamento por Produto</Box>
            <Box sx={{ color: "text.secondary" }}>Selecione um ou mais produtos para endereçar</Box>
          </Box>
          <AddressingModeTabs />
        </Stack>
        <AddressingSummaryCards summary={summary} />
        <AddressingFilters search={search} status={status} period={period} warehouseId={warehouseId}
          onSearchChange={(value) => { setSearch(value); setPage(0); }}
          onStatusChange={(value) => { setStatus(value); setPage(0); }}
          onPeriodChange={(value) => { setPeriod(value); setPage(0); }}
          onWarehouseChange={(value) => { setWarehouseId(value); setSelectedIds([]); setPage(0); }}
          onRefresh={() => setItems(addressingService.listItems())}
          onManualAddress={() => navigate("/enderecamento/operacao", { state: { returnTo: "/enderecamento/produtos" } })} />

        {selectedIds.length > 0 && (
          <Paper elevation={0} sx={{ position: "sticky", top: 8, zIndex: 5, p: 2, border: "1px solid", borderColor: "primary.main" }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2}>
              <Box sx={{ fontWeight: 700 }}>{selectedIds.length} produto(s) selecionado(s)</Box>
              <Button variant="contained" size="large" onClick={startSelected}>Endereçar selecionados</Button>
            </Stack>
          </Paper>
        )}

        <AddressingTable rows={filteredItems} page={page} rowsPerPage={rowsPerPage}
          selectedIds={selectedIds} onSelectionChange={setSelectedIds}
          onPageChange={(_, nextPage) => setPage(nextPage)}
          onRowsPerPageChange={(event) => { setRowsPerPage(Number(event.target.value)); setPage(0); }}
          onAddress={(item) => navigate("/enderecamento/operacao", {
            state: { itemIds: [item.id], returnTo: "/enderecamento/produtos" },
          })} />
      </Stack>
    </MainLayout>
  );
};
