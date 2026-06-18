import { useCallback, useEffect, useMemo, useState } from "react";
import { wmsMockRepository } from "../../../mocks/wmsMockRepository";
import { pickingService } from "../../picking/services/pickingService";
import { cutoffTimesService } from "../../cutoffTimes/services/cutoffTimesService";

export const useHomeDashboard = () => {
  const [snapshot, setSnapshot] = useState(null);
  const [updatedAt, setUpdatedAt] = useState(new Date());
  const [now, setNow] = useState(new Date());

  const refresh = useCallback(() => {
    const notes = wmsMockRepository.listNotes();
    const addressingItems = wmsMockRepository.listAddressingItems();
    const pickingItems = pickingService.listItems();
    const cutoffRules = cutoffTimesService.listCurrent();

    setSnapshot({ notes, addressingItems, pickingItems, cutoffRules });
    setUpdatedAt(new Date());
  }, []);

  useEffect(() => {
    const timer = setTimeout(refresh, 0);
    window.addEventListener("wms-mock-database-change", refresh);
    window.addEventListener("wms-picking-change", refresh);
    window.addEventListener("wms-cutoff-times-change", refresh);
    const clock = setInterval(() => setNow(new Date()), 60000);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("wms-mock-database-change", refresh);
      window.removeEventListener("wms-picking-change", refresh);
      window.removeEventListener("wms-cutoff-times-change", refresh);
      clearInterval(clock);
    };
  }, [refresh]);

  const dashboard = useMemo(() => {
    if (!snapshot) return null;

    const receivingAttention = snapshot.notes.filter((note) =>
      ["incompleta", "divergente"].includes(note.status),
    ).length;
    const receivingPending = snapshot.notes.filter((note) =>
      ["incompleta", "divergente"].includes(note.status),
    ).length;
    const addressingPending = snapshot.addressingItems.filter(
      (item) => item.pendingQty > 0,
    ).length;
    const addressingAttention = snapshot.addressingItems.filter((item) =>
      ["bloqueado_divergencia", "erro_endereco"].includes(item.status),
    ).length;
    const pickingPending = snapshot.pickingItems.filter((item) =>
      ["aguardando_separacao", "faltou_item", "em_separacao"].includes(item.status),
    ).length;
    const pickingAttention = snapshot.pickingItems.filter((item) =>
      ["faltou_item", "divergente"].includes(item.status),
    ).length;
    const packagingWaiting = snapshot.pickingItems.filter(
      (item) => item.status === "aguardando_embalamento",
    ).length;

    return {
      receivingAttention,
      receivingPending,
      addressingPending,
      addressingAttention,
      pickingPending,
      pickingAttention,
      packagingWaiting,
      totalAttention: receivingAttention + addressingAttention + pickingAttention,
    };
  }, [snapshot]);

  return {
    dashboard,
    snapshot,
    updatedAt,
    now,
    refresh,
  };
};
