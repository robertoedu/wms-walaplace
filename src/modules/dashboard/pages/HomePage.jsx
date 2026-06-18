import { useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import MoveToInboxOutlinedIcon from "@mui/icons-material/MoveToInboxOutlined";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import ContentCutOutlinedIcon from "@mui/icons-material/ContentCutOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import { MainLayout } from "../../../shared/layout/MainLayout";
import { useAuth } from "../../../auth/context/AuthContext";
import {
  dashboardPerformanceMock,
  performanceRanges,
} from "../mocks/dashboardMockData";
import { CutoffCard, FlowCard, StatCard } from "../components/DashboardCards";
import { useHomeDashboard } from "../hooks/useHomeDashboard";
import { decimalFormatter, formatDate, numberFormatter } from "../utils/dashboardFormatters";

export const HomePage = () => {
  const { user, hasPermission } = useAuth();
  const navigate = useNavigate();
  const { dashboard, snapshot, updatedAt, now, refresh } = useHomeDashboard();

  const performance = dashboardPerformanceMock;
  const completion = Math.round((performance.shippedNotes / performance.plannedNotes) * 100);
  const hourlyGoalProgress = Math.min(100, (performance.hourlyAverage / performance.hourlyGoal) * 100);
  const currentRange = performanceRanges.find((range) => performance.shippedNotes >= range.min);
  const firstName = user?.name?.split(" ")[0] || "operador";

  if (!dashboard) {
    return (
      <MainLayout>
        <Box sx={{ minHeight: 320, display: "grid", placeItems: "center" }}>
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  const attentionItems = [
    {
      label: "Notas com divergência ou conferência incompleta",
      value: dashboard.receivingAttention,
      route: "/recebimento",
      permission: "receiving",
    },
    {
      label: "Produtos bloqueados ou com erro de endereço",
      value: dashboard.addressingAttention,
      route: "/enderecamento",
      permission: "addressing",
    },
    {
      label: "Itens com falta ou divergência na separação",
      value: dashboard.pickingAttention,
      route: "/separacao",
      permission: "picking",
    },
  ].filter((item) => hasPermission(item.permission));

  return (
    <MainLayout>
      <Stack spacing={3} sx={{ maxWidth: 1500, mx: "auto" }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={2}
        >
          <Box>
            <Typography variant="h4" fontWeight={800}>Visão operacional</Typography>
            <Typography color="text.secondary">
              Olá, {firstName}. Acompanhe o ritmo e os pontos de atenção de {formatDate(new Date())}.
            </Typography>
          </Box>
          <Button variant="outlined" startIcon={<RefreshIcon />} onClick={refresh}>
            Atualizar
          </Button>
        </Stack>

        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, md: 3.5 },
            borderRadius: 4,
            color: "white",
            background: "linear-gradient(120deg, #172033 0%, #273957 58%, #1e4f76 100%)",
            overflow: "hidden",
            position: "relative",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              width: 300,
              height: 300,
              borderRadius: "50%",
              bgcolor: "rgba(249, 115, 22, 0.14)",
              right: -80,
              top: -145,
            }}
          />
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1.35fr 1fr" }, gap: 4 }}>
            <Box>
              <Stack direction="row" spacing={1} alignItems="center" mb={1.5}>
                <Chip
                  size="small"
                  label={currentRange.label}
                  sx={{ bgcolor: currentRange.color, color: "white", fontWeight: 800 }}
                />
                <Typography variant="body2" sx={{ color: "rgba(255,255,255,.72)" }}>
                  desempenho do dia
                </Typography>
              </Stack>
              <Typography variant="h2" fontWeight={850} lineHeight={1}>
                {numberFormatter.format(performance.shippedNotes)}
              </Typography>
              <Typography sx={{ color: "rgba(255,255,255,.78)", mt: 1 }}>
                notas expedidas de {numberFormatter.format(performance.plannedNotes)} previstas
              </Typography>
              <Box mt={3}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 0.75 }}>
                  <Typography variant="body2" fontWeight={700}>Realizado</Typography>
                  <Typography variant="body2" fontWeight={800} sx={{ ml: "auto" }}>{completion}%</Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={completion}
                  sx={{
                    height: 12,
                    borderRadius: 8,
                    bgcolor: "rgba(255,255,255,.16)",
                    "& .MuiLinearProgress-bar": { bgcolor: "primary.main", borderRadius: 8 },
                  }}
                />
              </Box>
            </Box>

            <Stack
              divider={<Divider flexItem sx={{ borderColor: "rgba(255,255,255,.14)" }} />}
              spacing={2}
              justifyContent="center"
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" sx={{ color: "rgba(255,255,255,.68)" }}>Média por hora</Typography>
                  <Typography variant="h5" fontWeight={800}>{decimalFormatter.format(performance.hourlyAverage)} NF/h</Typography>
                </Box>
                <TrendingUpIcon sx={{ color: "success.light", fontSize: 34 }} />
              </Stack>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="body2" sx={{ color: "rgba(255,255,255,.68)" }}>Melhor dia</Typography>
                  <Typography variant="h5" fontWeight={800}>{numberFormatter.format(performance.bestDay.value)} notas</Typography>
                </Box>
                <EmojiEventsOutlinedIcon sx={{ color: "#facc15", fontSize: 34 }} />
              </Stack>
            </Stack>
          </Box>
        </Paper>

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }, gap: 2 }}>
          <StatCard icon={<LocalShippingOutlinedIcon />} label="Notas expedidas" value={numberFormatter.format(performance.shippedNotes)} helper={`${completion}% do volume previsto`} tone="info" />
          <StatCard icon={<AccessTimeIcon />} label="Ritmo médio" value={`${decimalFormatter.format(performance.hourlyAverage)} NF/h`} helper={`${Math.round(hourlyGoalProgress)}% da meta horária`} tone="success" />
          <StatCard icon={<CheckCircleOutlineIcon />} label="Notas concluídas" value={numberFormatter.format(performance.completedNotes)} helper="Concluídas no fluxo de hoje" tone="success" />
        </Box>

        <Paper elevation={0} sx={{ p: 2.5, border: "1px solid", borderColor: "divider", borderRadius: 3 }}>
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={1} mb={2.5}>
            <Box>
              <Typography variant="h6" fontWeight={800}>Próximos horários de corte</Typography>
              <Typography variant="body2" color="text.secondary">Prazo para os pedidos seguirem na expedição de hoje.</Typography>
            </Box>
            {hasPermission("cutoff_times") && <Button onClick={() => navigate("/horarios-corte")}>Gerenciar horários</Button>}
          </Stack>
          {snapshot.cutoffRules.length ? (
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" }, gap: 2 }}>
              {snapshot.cutoffRules.map((rule) => <CutoffCard key={rule.id} rule={rule} now={now} />)}
            </Box>
          ) : (
            <Alert severity="warning">Não há horário de corte vigente para hoje.</Alert>
          )}
        </Paper>

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", xl: "1.55fr .85fr" }, gap: 3, alignItems: "stretch" }}>
          <Paper elevation={0} sx={{ p: 2.5, border: "1px solid", borderColor: "divider", borderRadius: 3 }}>
            <Box mb={2.5}>
              <Typography variant="h6" fontWeight={800}>Fluxo do armazém</Typography>
              <Typography variant="body2" color="text.secondary">Quantidade que ainda precisa avançar em cada etapa.</Typography>
            </Box>
            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" }, gap: 2 }}>
              {hasPermission("receiving") && (
                <FlowCard icon={<MoveToInboxOutlinedIcon />} title="Recebimento" value={dashboard.receivingPending} detail="notas que precisam de atenção" attention={dashboard.receivingAttention} onOpen={() => navigate("/recebimento")} />
              )}
              {hasPermission("addressing") && (
                <FlowCard icon={<PlaceOutlinedIcon />} title="Endereçamento" value={dashboard.addressingPending} detail="produtos ainda pendentes" attention={dashboard.addressingAttention} onOpen={() => navigate("/enderecamento")} />
              )}
              {hasPermission("picking") && (
                <FlowCard icon={<ContentCutOutlinedIcon />} title="Separação" value={dashboard.pickingPending} detail={`${dashboard.packagingWaiting} aguardando embalagem`} attention={dashboard.pickingAttention} onOpen={() => navigate("/separacao")} />
              )}
            </Box>
          </Paper>

          <Paper elevation={0} sx={{ p: 2.5, border: "1px solid", borderColor: dashboard.totalAttention ? "error.light" : "divider", borderRadius: 3 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
              <Box>
                <Typography variant="h6" fontWeight={800}>Precisa de atenção</Typography>
                <Typography variant="body2" color="text.secondary">Exceções que podem travar o fluxo.</Typography>
              </Box>
              <Chip label={dashboard.totalAttention} color={dashboard.totalAttention ? "error" : "success"} />
            </Stack>
            {dashboard.totalAttention === 0 ? (
              <Alert severity="success" icon={<CheckCircleOutlineIcon />}>
                Nenhuma ocorrência crítica nos módulos disponíveis.
              </Alert>
            ) : (
              <Stack divider={<Divider flexItem />}>
                {attentionItems.map((item) => (
                  <Button
                    key={item.label}
                    onClick={() => navigate(item.route)}
                    color="inherit"
                    sx={{ py: 1.5, px: 0, justifyContent: "space-between", textAlign: "left" }}
                    endIcon={<ArrowForwardIcon color="action" />}
                  >
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Chip label={item.value} color={item.value ? "error" : "default"} size="small" />
                      <Typography variant="body2" fontWeight={600}>{item.label}</Typography>
                    </Stack>
                  </Button>
                ))}
              </Stack>
            )}
          </Paper>
        </Box>

        <Typography variant="caption" color="text.secondary" textAlign="right">
          Atualizado às {updatedAt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })} · dados operacionais simulados
        </Typography>
      </Stack>
    </MainLayout>
  );
};
