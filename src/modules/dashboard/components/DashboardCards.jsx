import { Box, Button, Chip, Paper, Stack, Typography } from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { getCutoffState, numberFormatter } from "../utils/dashboardFormatters";

export const StatCard = ({ icon, label, value, helper, tone = "primary" }) => (
  <Paper
    elevation={0}
    sx={{
      p: 2.25,
      border: "1px solid",
      borderColor: "divider",
      borderRadius: 3,
      minWidth: 0,
      height: "100%",
    }}
  >
    <Stack direction="row" spacing={1.5} alignItems="flex-start">
      <Box
        sx={{
          display: "grid",
          placeItems: "center",
          width: 42,
          height: 42,
          flexShrink: 0,
          borderRadius: 2.25,
          bgcolor: `${tone}.light`,
          color: `${tone}.dark`,
        }}
      >
        {icon}
      </Box>
      <Box minWidth={0}>
        <Typography variant="body2" color="text.secondary" fontWeight={600}>
          {label}
        </Typography>
        <Typography variant="h5" fontWeight={800} lineHeight={1.25}>
          {value}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {helper}
        </Typography>
      </Box>
    </Stack>
  </Paper>
);

export const FlowCard = ({ icon, title, value, detail, attention, onOpen }) => (
  <Paper
    elevation={0}
    sx={{
      p: 2.25,
      border: "1px solid",
      borderColor: attention ? "warning.main" : "divider",
      borderRadius: 3,
      bgcolor: attention ? "warning.light" : "background.paper",
      height: "100%",
    }}
  >
    <Stack spacing={1.5} height="100%">
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Box sx={{ color: attention ? "warning.dark" : "primary.main" }}>{icon}</Box>
        {attention > 0 && <Chip size="small" color="warning" label={`${attention} atenção`} />}
      </Stack>
      <Box>
        <Typography fontWeight={700}>{title}</Typography>
        <Typography variant="h4" fontWeight={800}>{numberFormatter.format(value)}</Typography>
        <Typography variant="body2" color="text.secondary">{detail}</Typography>
      </Box>
      <Button
        onClick={onOpen}
        endIcon={<ArrowForwardIcon />}
        sx={{ mt: "auto", alignSelf: "flex-start", px: 0 }}
      >
        Abrir módulo
      </Button>
    </Stack>
  </Paper>
);

export const CutoffCard = ({ rule, now }) => {
  const state = getCutoffState(rule, now);
  const brandColor = rule.marketplace === "Mercado Livre" ? "#ffe600" : "#ee4d2d";

  return (
    <Paper elevation={0} sx={{ p: 2.25, border: "1px solid", borderColor: `${state.color}.main`, borderRadius: 3 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box sx={{ width: 12, height: 44, borderRadius: 2, bgcolor: brandColor }} />
          <Box>
            <Typography fontWeight={800}>{rule.marketplace}</Typography>
            <Typography variant="body2" color="text.secondary">Corte para expedição de hoje</Typography>
          </Box>
        </Stack>
        <Chip label={state.label} color={state.color} size="small" />
      </Stack>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-end" mt={2}>
        <Box>
          <Typography variant="h3" fontWeight={850}>{rule.cutoffTime}</Typography>
          <Typography variant="body2" color={`${state.color}.dark`} fontWeight={700}>{state.detail}</Typography>
        </Box>
        <AccessTimeIcon sx={{ color: `${state.color}.main`, fontSize: 38 }} />
      </Stack>
    </Paper>
  );
};
