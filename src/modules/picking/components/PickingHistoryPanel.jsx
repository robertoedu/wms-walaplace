import { Box, Paper, Stack } from "@mui/material";

const getEventText = (event) =>
  event.type === "retirada"
    ? `${event.quantity} un retiradas em ${event.locationCode}`
    : "Item removido";

export const PickingHistoryPanel = ({ events }) => (
  <Paper
    elevation={0}
    sx={{ p: 2, border: "1px solid", borderColor: "divider" }}
  >
    <Box fontWeight={700} mb={1}>Histórico</Box>
    <Stack spacing={1}>
      {events.length ? (
        events.map((event) => (
          <Box key={event.id} fontSize=".85rem">
            {getEventText(event)}
            <Box color="text.secondary">
              {new Date(event.timestamp).toLocaleString("pt-BR")}
            </Box>
          </Box>
        ))
      ) : (
        <Box color="text.secondary">Nenhum evento.</Box>
      )}
    </Stack>
  </Paper>
);
