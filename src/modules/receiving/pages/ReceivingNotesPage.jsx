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

const DAY_IN_MS = 24 * 60 * 60 * 1000;

const startOfDay = (date) => {
  const nextDate = new Date(date);
  nextDate.setHours(0, 0, 0, 0);
  return nextDate;
};

const endOfDay = (date) => {
  const nextDate = new Date(date);
  nextDate.setHours(23, 59, 59, 999);
  return nextDate;
};

const getNoteIssueDate = (note) =>
  new Date(note.issuedAt || note.emittedAt || note.createdAt);

const isDefaultExpectedWindow = (note, referenceDate = new Date()) => {
  const issuedAt = getNoteIssueDate(note);
  const windowStart = startOfDay(new Date(referenceDate.getTime() - 30 * DAY_IN_MS));
  const windowEnd = endOfDay(referenceDate);

  return issuedAt >= windowStart && issuedAt <= windowEnd;
};

const matchesDateRange = (note, dateStart, dateEnd) => {
  if (!dateStart && !dateEnd) return isDefaultExpectedWindow(note);

  const issuedAt = getNoteIssueDate(note);
  const start = dateStart ? startOfDay(new Date(`${dateStart}T00:00:00`)) : null;
  const end = dateEnd ? endOfDay(new Date(`${dateEnd}T00:00:00`)) : null;

  return (!start || issuedAt >= start) && (!end || issuedAt <= end);
};

export const ReceivingNotesPage = () => {
  const [notes, setNotes] = useState(() => receivingService.listNotes());
  const [stockProducts, setStockProducts] = useState(() =>
    receivingService.listStockProducts(),
  );
  const savedFilters = readReceivingFilters();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState(savedFilters.status || "prevista");
  const [dateStart, setDateStart] = useState(savedFilters.dateStart || "");
  const [dateEnd, setDateEnd] = useState(savedFilters.dateEnd || "");
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
      const matchesPeriod = matchesDateRange(note, dateStart, dateEnd);
      const matchesSearch = !term
        ? true
        : [
            note.key,
            note.nfeNumber,
            ...(note.items || []).flatMap((item) => [
              item.sku,
              item.description,
              item.ean,
            ]),
          ]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(term));

      return matchesStatus && matchesPeriod && matchesSearch;
    });
  }, [dateEnd, dateStart, notes, search, status]);

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
    writeReceivingFilters({ status: value, dateStart, dateEnd });
  };

  const handleDateStartChange = (value) => {
    setDateStart(value);
    setPage(0);
    writeReceivingFilters({ status, dateStart: value, dateEnd });
  };

  const handleDateEndChange = (value) => {
    setDateEnd(value);
    setPage(0);
    writeReceivingFilters({ status, dateStart, dateEnd: value });
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
          dateStart={dateStart}
          dateEnd={dateEnd}
          onSearchChange={handleSearchChange}
          onStatusChange={handleStatusChange}
          onDateStartChange={handleDateStartChange}
          onDateEndChange={handleDateEndChange}
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
