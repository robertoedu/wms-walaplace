import { createMockStorage } from "./mockStorage.js";

const STORAGE_KEY = "wms_cutoff_times_v1";
const STORAGE_VERSION = 1;

const initialRules = [
  { id: "CUT-ML-001", marketplace: "Mercado Livre", cutoffTime: "12:00", effectiveFrom: "2026-06-01", effectiveTo: "2026-12-31", active: true, observation: "Pedidos aprovados após o corte seguem para o próximo ciclo." },
  { id: "CUT-SHOPEE-001", marketplace: "Shopee", cutoffTime: "14:00", effectiveFrom: "2026-06-01", effectiveTo: "2026-12-31", active: true, observation: "Priorizar pedidos com coleta no mesmo dia." },
];

const storage = createMockStorage({
  key: STORAGE_KEY,
  version: STORAGE_VERSION,
  eventName: "wms-cutoff-times-change",
  createInitial: () => ({
    version: STORAGE_VERSION,
    rules: JSON.parse(JSON.stringify(initialRules)),
  }),
  migrate: (value) => {
    if (Array.isArray(value)) return { version: STORAGE_VERSION, rules: value };
    return null;
  },
});

const { clone, read, write } = storage;
const readRules = () => read().rules;
const writeRules = (rules) => write({ version: STORAGE_VERSION, rules });
const datesOverlap = (first, second) => {
  const firstEnd = first.effectiveTo || "9999-12-31";
  const secondEnd = second.effectiveTo || "9999-12-31";
  return first.effectiveFrom <= secondEnd && second.effectiveFrom <= firstEnd;
};

export const cutoffTimesMockRepository = {
  list() {
    return clone(readRules().sort((a, b) => a.marketplace.localeCompare(b.marketplace) || b.effectiveFrom.localeCompare(a.effectiveFrom)));
  },
  listCurrent(referenceDate = new Date()) {
    const date = referenceDate.toLocaleDateString("en-CA");
    return this.list().filter((rule) => rule.active && rule.effectiveFrom <= date && (!rule.effectiveTo || rule.effectiveTo >= date));
  },
  save(data) {
    if (!data.marketplace || !data.cutoffTime || !data.effectiveFrom) throw new Error("Marketplace, horário e início da vigência são obrigatórios.");
    if (data.effectiveTo && data.effectiveTo < data.effectiveFrom) throw new Error("O fim da vigência não pode ser anterior ao início.");
    const rules = readRules();
    const candidate = { ...data, active: data.active !== false, observation: data.observation?.trim() || "" };
    const overlapping = rules.some((rule) => rule.id !== candidate.id && rule.active && candidate.active && rule.marketplace === candidate.marketplace && datesOverlap(rule, candidate));
    if (overlapping) throw new Error("Já existe uma regra ativa para esse marketplace dentro da vigência informada.");
    const index = rules.findIndex((rule) => rule.id === candidate.id);
    if (index >= 0) rules[index] = candidate;
    else rules.push({ ...candidate, id: `CUT-${Date.now()}` });
    writeRules(rules);
    return clone(candidate);
  },
  toggle(id) {
    const rules = readRules();
    const rule = rules.find((current) => current.id === id);
    if (!rule) throw new Error("Horário de corte não encontrado.");
    if (!rule.active) {
      const overlapping = rules.some((current) => current.id !== rule.id && current.active && current.marketplace === rule.marketplace && datesOverlap(current, rule));
      if (overlapping) throw new Error("Esta vigência conflita com outra regra ativa do marketplace.");
    }
    rule.active = !rule.active;
    writeRules(rules);
    return clone(rule);
  },
};
