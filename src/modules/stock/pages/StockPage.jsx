import { Box, Button, Paper, Stack } from "@mui/material";
import { MainLayout } from "../../../shared/layout/MainLayout";
import { StockCreateDialog } from "../components/StockCreateDialog";
import { StockEditDialog } from "../components/StockEditDialog";
import { StockFilters } from "../components/StockFilters";
import { StockSummaryCards } from "../components/StockSummaryCards";
import { StockTable } from "../components/StockTable";
import { useStockPage } from "../hooks/useStockPage";

export const StockPage = () => {
  const {
    filteredProducts,
    summary,
    search,
    page,
    rowsPerPage,
    editingProduct,
    editQuantity,
    editError,
    createOpen,
    createForm,
    createError,
    feedback,
    setFeedback,
    setPage,
    setRowsPerPage,
    setEditQuantity,
    handleSearchChange,
    handleOpenEdit,
    handleCloseEdit,
    handleSaveEdit,
    handleOpenCreate,
    handleCloseCreate,
    handleCreateChange,
    handleSaveCreate,
  } = useStockPage();

  return (
    <MainLayout>
      <Stack spacing={3}>
        <Stack spacing={0.5}>
          <Box>
            <Box sx={{ fontSize: "2rem", fontWeight: 700 }}>Estoque</Box>
            <Box sx={{ color: "text.secondary" }}>
              Consulta e ajuste de produtos em estoque
            </Box>
          </Box>
        </Stack>

        {feedback && (
          <Paper
            elevation={0}
            sx={{
              p: 1.5,
              border: "1px solid",
              borderColor: "success.main",
              bgcolor: "success.light",
              color: "success.contrastText",
            }}
          >
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              justifyContent="space-between"
            >
              <Box>{feedback}</Box>
              <Button variant="outlined" size="small" onClick={() => setFeedback("")}>
                Fechar
              </Button>
            </Stack>
          </Paper>
        )}

        <StockSummaryCards summary={summary} />

        <StockFilters search={search} onSearchChange={handleSearchChange} />

        <StockTable
          products={filteredProducts}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={(_, nextPage) => setPage(nextPage)}
          onRowsPerPageChange={(event) => {
            setRowsPerPage(Number(event.target.value));
            setPage(0);
          }}
          onEdit={handleOpenEdit}
        />
      </Stack>

      <StockEditDialog
        open={!!editingProduct}
        product={editingProduct}
        quantity={editQuantity}
        error={editError}
        onQuantityChange={setEditQuantity}
        onClose={handleCloseEdit}
        onSave={handleSaveEdit}
      />

      <StockCreateDialog
        open={createOpen}
        form={createForm}
        error={createError}
        onChange={handleCreateChange}
        onClose={handleCloseCreate}
        onSave={handleSaveCreate}
      />

      <Button
        variant="contained"
        onClick={handleOpenCreate}
        sx={{
          position: "fixed",
          right: { xs: 16, sm: 24 },
          bottom: { xs: 16, sm: 24 },
          minWidth: 56,
          width: 56,
          height: 56,
          borderRadius: "50%",
          fontSize: "2rem",
          lineHeight: 1,
          zIndex: 1200,
          boxShadow: "0 6px 18px rgba(0, 0, 0, 0.22)",
        }}
      >
        +
      </Button>
    </MainLayout>
  );
};
