import { useMemo, useState } from "react";
import { Box, Button, MenuItem, Paper, Stack, TextField } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { useNavigate } from "react-router-dom";
import { MainLayout } from "../../../shared/layout/MainLayout";
import { AddressingModeTabs } from "../components/AddressingModeTabs";
import { AddressingNotesTable } from "../components/AddressingNotesTable";
import { addressingService } from "../services/addressingService";
import { addressingNoteNeedsAttention } from "../../../shared/utils/processAttention";
import { addressingNoteStatusFilterOptions } from "../../../shared/utils/statusCatalog";
import { WAREHOUSES } from "../../../shared/utils/warehouseCatalog";

export const StockAddressingNotesPage = () => {
  const navigate = useNavigate();
  const [notes, setNotes] = useState(() => addressingService.listNotes());
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("attention");
  const [warehouseId, setWarehouseId] = useState("all");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const filteredNotes = useMemo(() => {
    const term = search.trim().toLowerCase();
    return notes.filter((note) => {
      const matchesStatus =
        status === "all" ||
        (status === "attention" && addressingNoteNeedsAttention(note)) ||
        note.addressingStatus === status ||
        note.receivingStatus === status;
      const matchesSearch = !term || [note.noteNumber, note.orderCode, note.supplier, ...note.items.flatMap((item) => [item.sku, item.ean, item.productName])]
        .some((value) => String(value || "").toLowerCase().includes(term));
      const matchesWarehouse =
        warehouseId === "all" ||
        String(note.warehouseId || "742") === warehouseId;
      return matchesStatus && matchesWarehouse && matchesSearch;
    });
  }, [notes, search, status, warehouseId]);

  const cards = [
    ["Notas aguardando", notes.filter((note) => note.addressingStatus === "aguardando_enderecamento").length],
    ["Notas parciais", notes.filter((note) => note.addressingStatus === "enderecamento_parcial").length],
    ["Notas concluídas", notes.filter((note) => note.addressingStatus === "aguardando_separacao").length],
    ["Notas com ocorrência", notes.filter((note) => note.receivingHasIssue).length],
  ];

  return (
    <MainLayout>
      <Stack spacing={3}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={2} flexWrap="wrap">
          <Box><Box sx={{ fontSize: "2rem", fontWeight: 700 }}>Endereçamento por Nota</Box>
            <Box sx={{ color: "text.secondary" }}>Abra uma nota para endereçar todos os seus produtos</Box></Box>
          <AddressingModeTabs />
        </Stack>
        <Stack direction="row" spacing={2} useFlexGap flexWrap="wrap">
          {cards.map(([label, value]) => <Paper key={label} elevation={0} sx={{ flex: "1 1 210px", p: 2.5, border: "1px solid", borderColor: "divider" }}>
            <Box color="text.secondary">{label}</Box><Box sx={{ fontSize: "2rem", fontWeight: 700, color: "primary.main" }}>{value}</Box>
          </Paper>)}
        </Stack>
        <Paper elevation={0} sx={{ p: 2.5, border: "1px solid", borderColor: "divider" }}>
          <Stack direction="row" spacing={2} useFlexGap flexWrap="wrap">
            <TextField label="Busca" placeholder="Nota, fornecedor, SKU, EAN ou produto" value={search}
              onChange={(event) => { setSearch(event.target.value); setPage(0); }} sx={{ flex: "1 1 380px" }} />
            <TextField select label="Status" value={status} onChange={(event) => { setStatus(event.target.value); setPage(0); }} sx={{ minWidth: 230 }}>
              {addressingNoteStatusFilterOptions.map((option) => (
                <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
              ))}
            </TextField>
            <TextField select label="Estoque" value={warehouseId} onChange={(event) => { setWarehouseId(event.target.value); setPage(0); }} sx={{ minWidth: 230 }}>
              <MenuItem value="all">Todos os estoques</MenuItem>
              {WAREHOUSES.map((warehouse) => (
                <MenuItem key={warehouse.id} value={warehouse.id}>{warehouse.label}</MenuItem>
              ))}
            </TextField>
            <Button variant="outlined" startIcon={<RefreshIcon />} onClick={() => setNotes(addressingService.listNotes())}>Atualizar</Button>
          </Stack>
        </Paper>
        <AddressingNotesTable notes={filteredNotes} page={page} rowsPerPage={rowsPerPage}
          onPageChange={(_, nextPage) => setPage(nextPage)}
          onRowsPerPageChange={(event) => { setRowsPerPage(Number(event.target.value)); setPage(0); }}
          onAddressNote={(_, itemIds) => navigate("/enderecamento/operacao", {
            state: { itemIds, returnTo: "/enderecamento" },
          })} />
      </Stack>
    </MainLayout>
  );
};
