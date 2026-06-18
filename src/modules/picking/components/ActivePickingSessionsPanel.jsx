import { Box, Button, Chip, Paper, Stack, Typography } from "@mui/material";
import LoginIcon from "@mui/icons-material/Login";
import LockOpenIcon from "@mui/icons-material/LockOpen";

const formatStartedAt = (value) => new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
}).format(new Date(value));

export const ActivePickingSessionsPanel = ({ sessions, user, canRelease, onResume, onRelease }) => {
  if (!sessions.length) return null;

  return (
    <Paper elevation={0} sx={{ p: 2.5, border: "1px solid", borderColor: "info.light", borderRadius: 3 }}>
      <Stack spacing={2}>
        <Box>
          <Typography variant="h6" fontWeight={800}>Sessões em andamento</Typography>
          <Typography variant="body2" color="text.secondary">
            Retome uma separação iniciada ou consulte quem está operando cada sessão.
          </Typography>
        </Box>
        <Stack spacing={1.25}>
          {sessions.map((session) => {
            const isOwner = session.operatorId === user?.id ||
              (!session.operatorId && session.operatorUsername === user?.username);
            return (
              <Paper key={session.id} variant="outlined" sx={{ p: 1.75, borderRadius: 2 }}>
                <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "stretch", md: "center" }} justifyContent="space-between">
                  <Stack direction="row" spacing={2} useFlexGap flexWrap="wrap" alignItems="center" sx={{ flex: "1 1 auto", minWidth: 0 }}>
                    <Box>
                      <Typography fontWeight={800}>{session.id}</Typography>
                      <Typography variant="caption" color="text.secondary">Iniciada em {formatStartedAt(session.createdAt)}</Typography>
                    </Box>
                    <Chip label={session.status === "pausada" ? "Pausada" : "Em separação"} color={session.status === "pausada" ? "warning" : "info"} size="small" />
                    <Typography variant="body2"><strong>Operador:</strong> {session.operator}</Typography>
                    <Typography variant="body2"><strong>Pedidos:</strong> {session.orderIds.length}</Typography>
                    <Typography variant="body2"><strong>Itens:</strong> {session.itemIds.length}</Typography>
                  </Stack>
                  <Stack
                    direction="row"
                    spacing={1}
                    justifyContent="flex-end"
                    sx={{ ml: { xs: 0, md: "auto" }, flexShrink: 0 }}
                  >
                    {isOwner && <Button variant="contained" startIcon={<LoginIcon />} onClick={() => onResume(session.id)}>Retomar</Button>}
                    {canRelease && <Button color="warning" variant="outlined" startIcon={<LockOpenIcon />} onClick={() => onRelease(session)}>Liberar para separação</Button>}
                  </Stack>
                </Stack>
              </Paper>
            );
          })}
        </Stack>
      </Stack>
    </Paper>
  );
};
