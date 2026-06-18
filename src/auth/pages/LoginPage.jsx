import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  TextField,
  Button,
  Stack,
  Alert,
  Avatar,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";
import LoginIcon from "@mui/icons-material/Login";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import WarehouseIcon from "@mui/icons-material/Warehouse";

export const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("Preencha todos os campos");
      return;
    }

    const result = login(username, password);

    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.message);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        bgcolor: "linear-gradient(135deg, #ff6b35 0%, #f57c00 100%)",
        background: "linear-gradient(135deg, #ff6b35 0%, #f57c00 100%)",
        p: 2,
      }}
    >
      <Paper
        elevation={8}
        sx={{
          p: 4,
          width: "100%",
          maxWidth: 420,
          borderRadius: 3,
        }}
      >
        <Stack spacing={3}>
          <Box sx={{ textAlign: "center" }}>
            <Avatar
              sx={{
                bgcolor: "primary.main",
                width: 64,
                height: 64,
                margin: "0 auto 16px",
              }}
            >
              <WarehouseIcon sx={{ fontSize: "2rem" }} />
            </Avatar>
            <Box
              sx={{
                fontSize: "2rem",
                fontWeight: "bold",
                color: "primary.main",
                mb: 0.5,
              }}
            >
              WMS Walaplace
            </Box>
            <Box sx={{ fontSize: "0.95rem", color: "text.secondary" }}>
              Sistema de Gestão de Estoque
            </Box>
          </Box>

          {error && <Alert severity="error">{error}</Alert>}

          <form onSubmit={handleSubmit}>
            <Stack spacing={2.5}>
              <TextField
                label="Usuário"
                fullWidth
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoFocus
                autoComplete="username"
                variant="outlined"
              />

              <TextField
                label="Senha"
                type={showPassword ? "text" : "password"}
                fullWidth
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                variant="outlined"
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label={
                            showPassword ? "Ocultar senha" : "Mostrar senha"
                          }
                          onClick={() => setShowPassword((current) => !current)}
                          onMouseDown={(e) => e.preventDefault()}
                          edge="end"
                        >
                          {showPassword ? (
                            <VisibilityOffIcon />
                          ) : (
                            <VisibilityIcon />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />

              <Button
                type="submit"
                variant="contained"
                fullWidth
                size="large"
                startIcon={<LoginIcon />}
                sx={{
                  py: 1.5,
                  fontSize: "1.1rem",
                  fontWeight: 600,
                  boxShadow: "0 4px 12px rgba(255, 107, 53, 0.3)",
                }}
              >
                Entrar
              </Button>
            </Stack>
          </form>

          <Paper
            elevation={0}
            sx={{
              fontSize: "0.85rem",
              color: "text.secondary",
              textAlign: "center",
              pt: 2,
              pb: 1,
              bgcolor: "grey.50",
              borderRadius: 2,
              px: 2,
            }}
          >
            <Box sx={{ fontWeight: 600, mb: 1, color: "text.primary" }}>
              Credenciais de teste:
            </Box>
            <Stack spacing={0.5}>
              <Box>
                <strong>admin</strong> / admin123
              </Box>
              <Box>
                <strong>joao.silva</strong> / 123456
              </Box>
            </Stack>
          </Paper>
        </Stack>
      </Paper>
    </Box>
  );
};
