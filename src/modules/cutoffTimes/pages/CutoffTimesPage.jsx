import { useState } from "react";
import { Alert, Box, Button, Chip, Paper, Snackbar, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import PowerSettingsNewIcon from "@mui/icons-material/PowerSettingsNew";
import { MainLayout } from "../../../shared/layout/MainLayout";
import { cutoffTimesService } from "../services/cutoffTimesService";
import { CutoffTimeDialog } from "../components/CutoffTimeDialog";

const formatDate = (date) => date ? new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(new Date(`${date}T00:00:00Z`)) : "Sem término";

export const CutoffTimesPage = () => {
  const [rules, setRules] = useState(() => cutoffTimesService.list());
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [notification, setNotification] = useState({ message: "", severity: "success" });
  const reload = () => setRules(cutoffTimesService.list());
  const openDialog = (rule = null) => { setEditing(rule); setOpen(true); };
  const closeDialog = () => { setOpen(false); setEditing(null); };
  const save = (form) => {
    cutoffTimesService.save(form);
    reload();
    closeDialog();
    setNotification({ message: "Horário de corte salvo com sucesso.", severity: "success" });
  };
  const toggle = (id) => {
    try {
      cutoffTimesService.toggle(id);
      reload();
      setNotification({ message: "Situação da regra atualizada.", severity: "success" });
    } catch (toggleError) {
      setNotification({ message: toggleError.message, severity: "error" });
    }
  };

  return (
    <MainLayout>
      <Stack spacing={3} sx={{ maxWidth: 1300, mx: "auto" }}>
        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={2}>
          <Stack direction="row" spacing={2} alignItems="center">
            <AccessTimeIcon sx={{ fontSize: 42, color: "primary.main" }} />
            <Box>
              <Typography variant="h4" fontWeight={800}>Horários de corte</Typography>
              <Typography color="text.secondary">Defina até quando os pedidos entram na expedição do dia.</Typography>
            </Box>
          </Stack>
          <Button variant="contained" size="large" startIcon={<AddIcon />} onClick={() => openDialog()}>Novo horário</Button>
        </Stack>
        <Alert severity="info">Uma nova vigência preserva o histórico. Não podem existir duas regras ativas do mesmo marketplace no mesmo período.</Alert>
        <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3 }}>
          <Table>
            <TableHead><TableRow><TableCell>Marketplace</TableCell><TableCell>Horário</TableCell><TableCell>Início da vigência</TableCell><TableCell>Fim da vigência</TableCell><TableCell>Situação</TableCell><TableCell>Observação</TableCell><TableCell align="right">Ações</TableCell></TableRow></TableHead>
            <TableBody>
              {rules.map((rule) => (
                <TableRow key={rule.id} hover>
                  <TableCell><Typography fontWeight={700}>{rule.marketplace}</Typography></TableCell>
                  <TableCell><Typography variant="h6" fontWeight={800}>{rule.cutoffTime}</Typography></TableCell>
                  <TableCell>{formatDate(rule.effectiveFrom)}</TableCell>
                  <TableCell>{formatDate(rule.effectiveTo)}</TableCell>
                  <TableCell><Chip label={rule.active ? "Ativa" : "Inativa"} color={rule.active ? "success" : "default"} size="small" /></TableCell>
                  <TableCell sx={{ maxWidth: 300 }}>{rule.observation || "-"}</TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button size="small" variant="outlined" startIcon={<EditIcon />} onClick={() => openDialog(rule)}>Editar</Button>
                      <Button size="small" color={rule.active ? "error" : "success"} startIcon={<PowerSettingsNewIcon />} onClick={() => toggle(rule.id)}>{rule.active ? "Desativar" : "Ativar"}</Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <CutoffTimeDialog open={open} rule={editing} onClose={closeDialog} onSave={save} />
        <Snackbar open={Boolean(notification.message)} autoHideDuration={3500} onClose={() => setNotification((current) => ({ ...current, message: "" }))} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
          <Alert severity={notification.severity} onClose={() => setNotification((current) => ({ ...current, message: "" }))}>{notification.message}</Alert>
        </Snackbar>
      </Stack>
    </MainLayout>
  );
};
