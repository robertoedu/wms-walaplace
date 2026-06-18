import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../auth/context/AuthContext";
import { ProtectedRoute } from "../shared/components/ProtectedRoute";
import { LoginPage } from "../auth/pages/LoginPage";
import { HomePage } from "../modules/dashboard/pages/HomePage";
import { UsersPage } from "../modules/users/pages/UsersPage";
import { ReceivingNotesPage } from "../modules/receiving/pages/ReceivingNotesPage";
import { StockAddressingNotesPage } from "../modules/addressing/pages/StockAddressingNotesPage";
import { StockAddressingPage } from "../modules/addressing/pages/StockAddressingPage";
import { StockAddressingProductsPage } from "../modules/addressing/pages/StockAddressingProductsPage";
import { StockPage } from "../modules/stock/pages/StockPage";
import { PickingQueuePage } from "../modules/picking/pages/PickingQueuePage";
import { PickingSessionPage } from "../modules/picking/pages/PickingSessionPage";
import { CutoffTimesPage } from "../modules/cutoffTimes/pages/CutoffTimesPage";
import { LocationsPage } from "../modules/locations/pages/LocationsPage";
import { WarehouseMapEditorPage } from "../modules/warehouseMap/pages/WarehouseMapEditorPage";
import { PackagingTypesPage } from "../modules/packagingTypes/pages/PackagingTypesPage";

// Componente para redirecionar usuário logado
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota pública - Login */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          }
        />

        {/* Rota raiz - redireciona para dashboard ou login */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Rotas protegidas */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/recebimento"
          element={
            <ProtectedRoute requiredPermission="receiving">
              <ReceivingNotesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/enderecamento"
          element={
            <ProtectedRoute requiredPermission="addressing">
              <StockAddressingNotesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/enderecamento/produtos"
          element={
            <ProtectedRoute requiredPermission="addressing">
              <StockAddressingProductsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/enderecamento/operacao"
          element={
            <ProtectedRoute requiredPermission="addressing">
              <StockAddressingPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/separacao"
          element={
            <ProtectedRoute requiredPermission="picking">
              <PickingQueuePage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/separacao/sessao/:id"
          element={
            <ProtectedRoute requiredPermission="picking">
              <PickingSessionPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/locais"
          element={
            <ProtectedRoute requiredPermission="locations">
              <LocationsPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/mapa-galpao"
          element={
            <ProtectedRoute requiredPermission="warehouse_map">
              <WarehouseMapEditorPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/horarios-corte"
          element={
            <ProtectedRoute requiredPermission="cutoff_times">
              <CutoffTimesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/usuarios"
          element={
            <ProtectedRoute requiredPermission="users">
              <UsersPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/estoque"
          element={
            <ProtectedRoute requiredPermission="stock">
              <StockPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/tipos-embalagem"
          element={
            <ProtectedRoute requiredPermission="packaging_types">
              <PackagingTypesPage />
            </ProtectedRoute>
          }
        />

        {/* Rota 404 - redireciona para dashboard */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
