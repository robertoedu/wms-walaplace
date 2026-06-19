import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";

const emptyForm = {
  username: "",
  password: "",
  name: "",
  email: "",
  role: "operator",
  active: true,
  permissions: [],
};

export const UserFormDialog = ({
  open,
  editingUser,
  onClose,
  onSave,
  allModules,
  userRoles,
}) => {
  const [formData, setFormData] = useState(emptyForm);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      if (editingUser) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setFormData({
          username: editingUser.username,
          password: "",
          name: editingUser.name,
          email: editingUser.email,
          role: editingUser.role,
          active: editingUser.active,
          permissions: [...editingUser.permissions],
        });
      } else {
        setFormData(emptyForm);
      }
      setError("");
    }
  }, [open, editingUser]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePermissionToggle = (moduleId) => {
    setFormData((prev) => {
      const permissions = [...prev.permissions];
      const index = permissions.indexOf(moduleId);

      if (index > -1) {
        permissions.splice(index, 1);
      } else {
        permissions.push(moduleId);
      }

      return { ...prev, permissions };
    });
  };

  const handleSave = () => {
    if (!formData.name || !formData.username || !formData.email) {
      setError("Preencha todos os campos obrigatórios");
      return;
    }

    if (!editingUser && !formData.password) {
      setError("A senha é obrigatória para novos usuários");
      return;
    }

    if (!editingUser && formData.password.length < 6) {
      setError("A senha deve ter no mínimo 6 caracteres");
      return;
    }

    if (editingUser && formData.password && formData.password.length < 6) {
      setError("A nova senha deve ter no mínimo 6 caracteres");
      return;
    }

    setError("");
    onSave({
      ...formData,
      permissions:
        formData.role === "admin"
          ? allModules.map((module) => module.id)
          : formData.permissions,
    });
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {editingUser ? "Editar Usuário" : "Novo Usuário"}
      </DialogTitle>
      <DialogContent>
        <Stack spacing={3} sx={{ mt: 2 }}>
          {error && <Alert severity="error">{error}</Alert>}

          <Box>
            <Box sx={{ fontSize: "1.1rem", fontWeight: "bold", mb: 2 }}>
              Dados Básicos
            </Box>
            <Stack spacing={2}>
              <TextField
                label="Nome Completo"
                fullWidth
                required
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
              />
              <Stack direction="row" spacing={2}>
                <TextField
                  label="Usuário"
                  fullWidth
                  required
                  value={formData.username}
                  onChange={(e) =>
                    handleInputChange("username", e.target.value)
                  }
                  disabled={!!editingUser}
                />
                <TextField
                  label="Email"
                  type="email"
                  fullWidth
                  required
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                />
              </Stack>
              <Stack direction="row" spacing={2}>
                <TextField
                  label={
                    editingUser
                      ? "Nova Senha (deixe vazio para manter)"
                      : "Senha"
                  }
                  type="password"
                  fullWidth
                  required={!editingUser}
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                />
                <FormControl fullWidth>
                  <InputLabel>Tipo de Usuário</InputLabel>
                  <Select
                    value={formData.role}
                    label="Tipo de Usuário"
                    onChange={(e) => handleInputChange("role", e.target.value)}
                  >
                    {userRoles.map((role) => (
                      <MenuItem key={role.value} value={role.value}>
                        {role.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
            </Stack>
          </Box>

          {formData.role !== "admin" ? (
            <Box>
              <Box sx={{ fontSize: "1.1rem", fontWeight: "bold", mb: 2 }}>
                Permissões de Acesso
              </Box>
              <Alert severity="info" sx={{ mb: 2 }}>
                Selecione os módulos que o usuário poderá acessar.
                Administradores têm acesso automático a todos os módulos.
              </Alert>
              <Stack spacing={1}>
                {allModules.map((module) => (
                  <Paper
                    key={module.id}
                    sx={{
                      p: 2,
                      cursor: "pointer",
                      bgcolor: formData.permissions.includes(module.id)
                        ? "primary.light"
                        : "background.paper",
                      border: "1px solid",
                      borderColor: formData.permissions.includes(module.id)
                        ? "primary.main"
                        : "divider",
                      transition: "all 0.2s",
                      "&:hover": {
                        borderColor: "primary.main",
                      },
                    }}
                    onClick={() => handlePermissionToggle(module.id)}
                  >
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <Box>
                        <Box sx={{ fontWeight: "bold" }}>{module.name}</Box>
                        <Box
                          sx={{ fontSize: "0.85rem", color: "text.secondary" }}
                        >
                          {module.type === "operational"
                            ? "Operacional"
                            : module.type === "warehouse"
                              ? "Estoque recebedor"
                              : "Administrativo"}
                        </Box>
                      </Box>
                      {formData.permissions.includes(module.id) && (
                        <CheckIcon color="primary" />
                      )}
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            </Box>
          ) : (
            <Alert severity="info">
              Administradores possuem acesso automático a todos os módulos do
              sistema.
            </Alert>
          )}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} startIcon={<CloseIcon />}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSave}
          startIcon={<CheckIcon />}
        >
          {editingUser ? "Salvar Alterações" : "Criar Usuário"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
