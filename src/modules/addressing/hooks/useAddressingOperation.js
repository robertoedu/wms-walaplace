import { useEffect, useMemo, useRef, useState } from "react";
import { addressingService } from "../services/addressingService";
import { playScanError, playScanSuccess } from "../../../shared/utils/scanAudio";

export const useAddressingOperation = (initialItems = []) => {
  const [sessionItems, setSessionItems] = useState(initialItems);
  const [selectedItemId, setSelectedItemId] = useState(initialItems[0]?.id || "");
  const [productScan, setProductScan] = useState("");
  const [locationCode, setLocationCode] = useState("");
  const [quantity, setQuantity] = useState(initialItems[0] ? String(initialItems[0].pendingQty) : "1");
  const [errorMessage, setErrorMessage] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const productRef = useRef(null);
  const locationRef = useRef(null);
  const selectedItem = sessionItems.find((item) => item.id === selectedItemId) || null;

  useEffect(() => {
    const target = selectedItem ? locationRef : productRef;
    setTimeout(() => target.current?.focus(), 40);
  }, [selectedItem]);

  const selectedLocation = useMemo(
    () => addressingService.findStockLocationByCode(locationCode),
    [locationCode],
  );
  const locationError = locationCode.trim() && !selectedLocation ? "Local inexistente." : "";
  const availableCapacity = selectedLocation ? selectedLocation.capacity - selectedLocation.occupied : 0;

  const alerts = useMemo(() => {
    const output = [];
    if (selectedLocation && availableCapacity === 0) output.push("Local sem capacidade disponível");
    else if (selectedLocation && selectedLocation.occupied / selectedLocation.capacity >= 0.9) output.push("Local com ocupação crítica");
    if (selectedItem && !selectedLocation) output.push("Aguardando leitura de local");
    if (selectedItem?.receivingHasIssue) output.push(
      `Recebimento ${selectedItem.receivingStatus}: ${selectedItem.noteObservation || "sem observação informada"}`,
    );
    return output;
  }, [availableCapacity, selectedItem, selectedLocation]);

  const selectItem = (itemId) => {
    const item = sessionItems.find((current) => current.id === itemId);
    if (!item) return;
    setSelectedItemId(itemId);
    setLocationCode("");
    setQuantity(item.pendingQty > 0 ? String(item.pendingQty) : "1");
    setErrorMessage("");
  };

  const handleFindProduct = () => {
    const found = addressingService.searchPendingItem(productScan);
    if (!found) {
      playScanError();
      return setErrorMessage("Produto pendente não encontrado ou bloqueado para quarentena.");
    }
    playScanSuccess();
    setSessionItems([found]);
    setSelectedItemId(found.id);
    setQuantity(String(found.pendingQty));
    setLocationCode("");
    setErrorMessage("");
  };

  const changeProduct = () => {
    setSessionItems([]);
    setSelectedItemId("");
    setProductScan("");
    setLocationCode("");
    setQuantity("1");
    setErrorMessage("");
  };

  const validateConfirm = () => {
    const reject = (message) => {
      playScanError();
      setErrorMessage(message);
    };
    if (!selectedItem) return reject("Selecione um produto antes de confirmar.");
    if (!selectedLocation) return reject("Bipe um local válido antes de confirmar.");
    const value = Number(quantity);
    if (!Number.isInteger(value) || value <= 0) return reject("Informe uma quantidade inteira maior que zero.");
    if (value > selectedItem.pendingQty) return reject("Quantidade maior que a pendente do produto.");
    if (value > availableCapacity) return reject(`O local possui capacidade disponível para ${availableCapacity} unidade(s).`);
    setErrorMessage("");
    setConfirmOpen(true);
  };

  const handleConfirm = () => {
    try {
      const result = addressingService.confirmAddressing({
        itemId: selectedItem.id,
        locationCode: selectedLocation.code,
        quantity: Number(quantity),
      });
      playScanSuccess();
      const nextItems = sessionItems.map((item) => item.id === result.item.id ? result.item : item);
      setSessionItems(nextItems);
      setConfirmOpen(false);
      setLocationCode("");
      setErrorMessage("");

      if (result.item.pendingQty === 0) {
        const nextPending = nextItems.find((item) => item.id !== result.item.id && item.pendingQty > 0);
        if (nextPending) {
          setSelectedItemId(nextPending.id);
          setQuantity(String(nextPending.pendingQty));
          return;
        }
      }
      setQuantity(result.item.pendingQty > 0 ? String(result.item.pendingQty) : "1");
      setTimeout(() => locationRef.current?.focus(), 40);
    } catch (error) {
      playScanError();
      setConfirmOpen(false);
      setErrorMessage(error.message);
    }
  };

  return {
    sessionItems, selectedItem, selectItem, productScan, setProductScan,
    locationCode, setLocationCode, quantity, setQuantity, selectedLocation,
    availableCapacity, errorMessage: locationError || errorMessage,
    history: selectedItem?.movements || [], alerts, confirmOpen,
    closeConfirm: () => setConfirmOpen(false), productRef, locationRef,
    handleFindProduct, changeProduct, validateConfirm, handleConfirm,
  };
};
