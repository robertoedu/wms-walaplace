export const numberFormatter = new Intl.NumberFormat("pt-BR");

export const decimalFormatter = new Intl.NumberFormat("pt-BR", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

export const formatDate = (date) =>
  new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);

export const getCutoffState = (rule, referenceDate) => {
  const [hours, minutes] = rule.cutoffTime.split(":").map(Number);
  const cutoff = new Date(referenceDate);
  cutoff.setHours(hours, minutes, 0, 0);
  const differenceMinutes = Math.round((cutoff.getTime() - referenceDate.getTime()) / 60000);

  if (differenceMinutes <= 0) {
    const elapsed = Math.abs(differenceMinutes);
    return {
      color: "error",
      label: "Corte encerrado",
      detail: `Encerrado há ${Math.floor(elapsed / 60)}h ${elapsed % 60}min`,
    };
  }
  if (differenceMinutes <= 120) {
    return {
      color: "warning",
      label: "Corte próximo",
      detail: `Faltam ${Math.floor(differenceMinutes / 60)}h ${differenceMinutes % 60}min`,
    };
  }
  return {
    color: "info",
    label: "Dentro do prazo",
    detail: `Faltam ${Math.floor(differenceMinutes / 60)}h ${differenceMinutes % 60}min`,
  };
};
