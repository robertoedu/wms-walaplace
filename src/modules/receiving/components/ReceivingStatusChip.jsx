import { Chip } from "@mui/material";
import { getStatusConfig } from "../../../shared/utils/statusCatalog";

export const ReceivingStatusChip = ({ status }) => {
  const config = getStatusConfig(status);
  return <Chip size="small" label={config.label} color={config.color} />;
};
