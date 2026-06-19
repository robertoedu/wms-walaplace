import { useState } from "react";
import {
  Box,
  Paper,
  Stack,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  Snackbar,
} from "@mui/material";
import { MainLayout } from "../../../shared/layout/MainLayout";
import { usersService } from "../services/usersService";
import PeopleIcon from "@mui/icons-material/People";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import { UserFormDialog } from "../components/UserFormDialog";

export const UsersPage = () => {
  const [users, setUsers] = useState(() => usersService.listUsers());
  const [userRoles] = useState(() => usersService.listRoles());
  const [allModules] = useState(() => usersService.listModules());
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleOpenDialog = (user = null) => {
    if (user) {
      setEditingUser(user);
    } else {
      setEditingUser(null);
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUser(null);
  };

  const handleSave = (userData) => {
    const savedUser = usersService.saveUser({
      ...editingUser,
      ...userData,
      password: userData.password || editingUser?.password,
    });

    if (editingUser) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editingUser.id
            ? savedUser
            : u,
        ),
      );
      setSnackbar({
        open: true,
        message: "Usuário atualizado com sucesso!",
        severity: "success",
      });
    } else {
      setUsers((prev) => [...prev, savedUser]);
      setSnackbar({
        open: true,
        message: "Usuário criado com sucesso!",
        severity: "success",
      });
    }

    handleCloseDialog();
  };

  const getRoleLabel = (role) => {
    const roleObj = userRoles.find((r) => r.value === role);
    return roleObj?.label || role;
  };

  return (
    <MainLayout>
      <Stack spacing={3}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <PeopleIcon sx={{ fontSize: "2.5rem", color: "primary.main" }} />
            <Box>
              <Box sx={{ fontSize: "2rem", fontWeight: "bold" }}>
                Usuários e Permissões
              </Box>
              <Box sx={{ fontSize: "1rem", color: "text.secondary" }}>
                Gerencie usuários e suas permissões de acesso
              </Box>
            </Box>
          </Box>
          <Button
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
            sx={{ py: 1.5, px: 3 }}
          >
            Novo Usuário
          </Button>
        </Box>

        {/* Tabela */}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>Nome</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Usuário</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Email</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Tipo</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Permissões</TableCell>
                <TableCell sx={{ fontWeight: "bold" }} align="center">
                  Ações
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{getRoleLabel(user.role)}</TableCell>
                  <TableCell>
                    <Chip
                      label={`${user.permissions.length} módulo(s)`}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<EditIcon />}
                        onClick={() => handleOpenDialog(user)}
                      >
                        Editar
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <UserFormDialog
          open={openDialog}
          editingUser={editingUser}
          onClose={handleCloseDialog}
          onSave={handleSave}
          allModules={allModules}
          userRoles={userRoles}
        />

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            sx={{ width: "100%" }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Stack>
    </MainLayout>
  );
};
