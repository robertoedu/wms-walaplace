import { Navigate } from "react-router-dom";
import { useAuth } from "../../auth/context/AuthContext";
import { Box, Alert, Stack, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

export const ProtectedRoute = ({ children, requiredPermission = null }) => {
  const { isAuthenticated, hasPermission, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        Carregando...
      </Box>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          p: 3,
        }}
      >
        <Stack spacing={2} alignItems="center">
          <Alert severity="error">
            Você não tem permissão para acessar esta página.
          </Alert>
          <Button variant="contained" onClick={() => navigate("/dashboard")}>
            Voltar ao início
          </Button>
        </Stack>
      </Box>
    );
  }

  return children;
};
