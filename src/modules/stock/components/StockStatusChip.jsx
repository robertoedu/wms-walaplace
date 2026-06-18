import { Chip } from "@mui/material";
import { getStatusConfig } from "../../../shared/utils/statusCatalog";

export const StockStatusChip = ({ product }) => {
  const status = !product.currentLocation
    ? "sem_localizacao"
    : Number(product.quantity) <= 10
      ? "baixo_estoque"
      : "disponivel";
  const config = getStatusConfig(status);

  return <Chip label={config.label} color={config.color} size="small" />;
};
