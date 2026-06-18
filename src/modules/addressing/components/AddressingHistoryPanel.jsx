import { Box, Card, Chip, Stack } from "@mui/material";

export const AddressingHistoryPanel = ({ history, alerts }) => (
  <Stack spacing={2}>
    <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", p: 2.2, borderRadius: 2 }}>
      <Box sx={{ fontWeight: 700, mb: 1.2 }}>Últimos endereçamentos</Box>
      <Stack spacing={1}>
        {history.length === 0 ? <Box sx={{ color: "text.secondary" }}>Sem movimentos recentes.</Box> : history.map((event) => (
          <Box key={event.id || event.timestamp} sx={{ borderBottom: "1px solid", borderColor: "divider", pb: 0.9 }}>
            <Box sx={{ fontWeight: 600 }}>{event.quantity} un em {event.locationCode}</Box>
            <Box sx={{ fontSize: "0.82rem", color: "text.secondary" }}>{new Date(event.timestamp).toLocaleString("pt-BR")}</Box>
            {event.operator && <Box sx={{ fontSize: "0.78rem", color: "text.secondary" }}>{event.operator}</Box>}
            {event.receivingStatus && event.receivingStatus !== "completa" && (
              <Box sx={{ fontSize: "0.78rem", color: "error.main" }}>
                Recebimento {event.receivingStatus}: {event.noteObservation || "sem observação"}
              </Box>
            )}
          </Box>
        ))}
      </Stack>
    </Card>
    <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider", p: 2.2, borderRadius: 2 }}>
      <Box sx={{ fontWeight: 700, mb: 1.2 }}>Alertas</Box>
      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
        {alerts.length === 0 ? <Chip label="Sem alertas" color="success" /> : alerts.map((alert) => (
          <Chip key={alert} label={alert} color="error" />
        ))}
      </Stack>
    </Card>
  </Stack>
);
