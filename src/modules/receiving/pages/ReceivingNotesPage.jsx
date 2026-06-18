import { useMemo, useState } from "react";
import { Box, Stack, Alert, Snackbar } from "@mui/material";
import { MainLayout } from "../../../shared/layout/MainLayout";
import { CreateReceivingModal } from "../components/CreateReceivingModal";
import { ReceivingSummaryCards } from "../components/ReceivingSummaryCards";
import { ReceivingFilters } from "../components/ReceivingFilters";
import { ReceivingTable } from "../components/ReceivingTable";
import { ReceivingDetailsModal } from "../components/ReceivingDetailsModal";
import { receivingService } from "../services/receivingService";
import { receivingNoteNeedsAttention } from "../../../shared/utils/processAttention";
import { readReceivingFilters, writeReceivingFilters } from "../utils/receivingFilters";

export const ReceivingNotesPage = () => {
  const [notes, setNotes] = useState(() => receivingService.listNotes());
  const [stockProducts, setStockProducts] = useState(() =>
    receivingService.listStockProducts(),
  );
  const savedFilters = readReceivingFilters();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(savedFilters.status || "attention");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [createOpen, setCreateOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState(null);
  const [editingNote, setEditingNote] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const filteredNotes = useMemo(() => {
    const term = search.trim().toLowerCase();

    return notes.filter((note) => {
      const matchesStatus =
        status === "all" ||
        (status === "attention" && receivingNoteNeedsAttention(note)) ||
        note.status === status;
      const matchesSearch = !term
        ? true
        : [
            note.key,
            ...(note.items || []).flatMap((item) => [
              item.sku,
              item.description,
              item.ean,
            ]),
          ]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(term));

      return matchesStatus && matchesSearch;
    });
  }, [notes, search, status]);

  const summary = useMemo(() => {
    const today = new Date().toDateString();
    const isToday = (value) => new Date(value).toDateString() === today;

    return {
      notasCadastradas: notes.filter((note) => isToday(note.createdAt)).length,
      recebidasHoje: notes.filter((note) =>
        isToday(note.finalizedAt || note.createdAt),
      ).length,
      notasCompletas: notes.filter(
        (note) =>
          isToday(note.finalizedAt || note.createdAt) &&
          note.status === "completa",
      ).length,
      notasComProblema: notes.filter(
        (note) =>
          isToday(note.finalizedAt || note.createdAt) &&
          (note.status === "incompleta" || note.status === "divergente"),
      ).length,
    };
  }, [notes]);

  const handleSaveNote = (noteData) => {
    const isEditing = Boolean(noteData.id);
    receivingService.saveNote(noteData);
    setNotes(receivingService.listNotes());

    if (isEditing) {
      setSnackbar({
        open: true,
        message: "Nota atualizada com sucesso.",
        severity: "success",
      });
      return;
    }

    setSnackbar({
      open: true,
      message: "Nota recebida com sucesso.",
      severity: "success",
    });
  };

  const handleCreateStockProduct = (product) => {
    receivingService.saveStockProduct(product);
    setStockProducts(receivingService.listStockProducts());
  };

  const handleSearchChange = (value) => {
    setSearch(value);
    setPage(0);
  };

  const handleStatusChange = (value) => {
    setStatus(value);
    setPage(0);
    writeReceivingFilters({ status: value });
  };

  return (
    <MainLayout>
      <Stack spacing={3}>
        <Box>
          <Box
            sx={{ fontSize: "2rem", fontWeight: 700, color: "text.primary" }}
          >
            Recebimento
          </Box>
          <Box sx={{ color: "text.secondary" }}>
            Controle das remessas recebidas no estoque
          </Box>
        </Box>

        <ReceivingSummaryCards summary={summary} />

        <ReceivingFilters
          search={search}
          status={status}
          onSearchChange={handleSearchChange}
          onStatusChange={handleStatusChange}
          onRefresh={() => setNotes((prev) => [...prev])}
          onAddNote={() => setCreateOpen(true)}
        />

        <ReceivingTable
          notes={filteredNotes}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={(_, nextPage) => setPage(nextPage)}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(Number(event.target.value));
            setPage(0);
          }}
          onViewItems={(note) => {
            setSelectedNote(note);
            setDetailsOpen(true);
          }}
          onEditNote={(note) => {
            setEditingNote(note);
            setCreateOpen(true);
          }}
        />
      </Stack>

      <CreateReceivingModal
        open={createOpen}
        onClose={() => {
          setCreateOpen(false);
          setEditingNote(null);
        }}
        stockProducts={stockProducts}
        initialNote={editingNote}
        onSaveNote={handleSaveNote}
        onCreateStockProduct={handleCreateStockProduct}
      />

      <ReceivingDetailsModal
        open={detailsOpen}
        note={selectedNote}
        onClose={() => setDetailsOpen(false)}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3500}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </MainLayout>
  );
};
