export const STATUS_CONFIG = {
  aguardando_enderecamento: {
    label: "Aguardando Endereçamento",
    color: "warning",
    order: 10,
  },
  enderecamento_parcial: {
    label: "Endereçamento Parcial",
    color: "info",
    order: 20,
  },
  erro_endereco: {
    label: "Erro de Endereço",
    color: "error",
    order: 30,
  },
  bloqueado_divergencia: {
    label: "Bloqueado / Quarentena",
    color: "error",
    order: 40,
  },
  enderecado: {
    label: "Endereçado",
    color: "success",
    order: 50,
  },
  aguardando_separacao: {
    label: "Aguardando Separação",
    color: "warning",
    order: 60,
  },
  aguardando_transferencia: {
    label: "Aguardando Transferencia",
    color: "warning",
    order: 65,
  },
  em_separacao: {
    label: "Em Separação",
    color: "info",
    order: 70,
  },
  separado_parcial: {
    label: "Separado Parcial",
    color: "warning",
    order: 80,
  },
  separado_completo: {
    label: "Separado Completo",
    color: "success",
    order: 90,
  },
  faltou_item: {
    label: "Faltou Item",
    color: "error",
    order: 100,
  },
  aguardando_embalamento: {
    label: "Aguardando Embalamento",
    color: "success",
    order: 110,
  },
  aguardando_romaneio: {
    label: "Aguardando Romaneio",
    color: "info",
    order: 120,
  },
  romaneio_finalizado: {
    label: "Romaneio Finalizado",
    color: "success",
    order: 130,
  },
  divergente: {
    label: "Divergente",
    color: "error",
    order: 140,
  },
  incompleta: {
    label: "Incompleta",
    color: "warning",
    order: 150,
  },
  completa: {
    label: "Completa",
    color: "success",
    order: 160,
  },
  prevista: {
    label: "Prevista",
    color: "info",
    order: 165,
  },
  pausada: {
    label: "Pausada",
    color: "warning",
    order: 170,
  },
  cancelada: {
    label: "Cancelada",
    color: "default",
    order: 180,
  },
  liberada: {
    label: "Liberada",
    color: "default",
    order: 190,
  },
  removido_sessao: {
    label: "Removido",
    color: "default",
    order: 200,
  },
  disponivel: {
    label: "Disponível",
    color: "success",
    order: 210,
  },
  baixo_estoque: {
    label: "Baixo estoque",
    color: "error",
    order: 220,
  },
  sem_localizacao: {
    label: "Sem localização",
    color: "warning",
    order: 230,
  },
};

export const COMPLETED_FORWARD_STATUSES = new Set([
  "aguardando_separacao",
  "aguardando_embalamento",
  "aguardando_romaneio",
  "romaneio_finalizado",
]);

export const PICKING_ATTENTION_STATUSES = new Set([
  "aguardando_separacao",
  "aguardando_transferencia",
  "faltou_item",
  "divergente",
]);

export const PICKING_SELECTABLE_STATUSES = new Set([
  "aguardando_separacao",
  "faltou_item",
]);

export const RECEIVING_ATTENTION_STATUSES = new Set([
  "incompleta",
  "divergente",
]);

export const ADDRESSING_ACTIONABLE_STATUSES = new Set([
  "aguardando_enderecamento",
  "enderecamento_parcial",
  "erro_endereco",
]);

export const getStatusConfig = (status) =>
  STATUS_CONFIG[status] || { label: status || "-", color: "default", order: Number.MAX_SAFE_INTEGER };

export const getStatusLabel = (status) => getStatusConfig(status).label;

export const getStatusColor = (status) => getStatusConfig(status).color;

export const needsProcessAttention = (status) =>
  !COMPLETED_FORWARD_STATUSES.has(status);

export const pickingNeedsAttention = (status) =>
  PICKING_ATTENTION_STATUSES.has(status);

export const receivingNeedsAttention = (status) =>
  RECEIVING_ATTENTION_STATUSES.has(status);

export const canSelectForPicking = (status) =>
  PICKING_SELECTABLE_STATUSES.has(status);

export const canAddressStockItem = (status) =>
  ADDRESSING_ACTIONABLE_STATUSES.has(status);

export const toStatusOption = (status) => ({
  value: status,
  label: getStatusLabel(status),
});

export const pickingStatusFilterOptions = [
  { value: "attention", label: "Precisa de atenção" },
  { value: "all", label: "Todos" },
  ...[
    "aguardando_separacao",
    "aguardando_transferencia",
    "em_separacao",
    "faltou_item",
    "aguardando_embalamento",
    "divergente",
  ].map(toStatusOption),
];

export const receivingStatusFilterOptions = [
  { value: "all", label: "Todos" },
  { value: "attention", label: "Precisa de atenção" },
  ...["prevista", "completa", "incompleta", "divergente"].map(toStatusOption),
];

export const receivingProblemStatusOptions = [
  "incompleta",
  "divergente",
].map(toStatusOption);

export const addressingStatusFilterOptions = [
  { value: "all", label: "Todos" },
  { value: "attention", label: "Precisa de atenção" },
  ...[
    "aguardando_enderecamento",
    "enderecamento_parcial",
    "aguardando_separacao",
    "bloqueado_divergencia",
    "erro_endereco",
  ].map(toStatusOption),
];

export const addressingNoteStatusFilterOptions = [
  { value: "all", label: "Todos" },
  { value: "attention", label: "Precisa de atenção" },
  { value: "aguardando_enderecamento", label: "Aguardando" },
  { value: "enderecamento_parcial", label: "Parcial" },
  { value: "aguardando_separacao", label: "Concluída" },
  { value: "incompleta", label: "Recebimento incompleto" },
  { value: "divergente", label: "Recebimento divergente" },
];

export const productStatusOptions = [
  "aguardando_enderecamento",
  "aguardando_separacao",
  "aguardando_embalamento",
  "aguardando_romaneio",
  "romaneio_finalizado",
].map((status) => ({
  value: status,
  label: getStatusLabel(status),
  color: getStatusColor(status),
}));
