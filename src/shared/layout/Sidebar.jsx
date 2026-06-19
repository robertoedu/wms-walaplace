import {
  Paper,
  Stack,
  Button,
  Box,
  Divider,
  Tooltip,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../auth/context/AuthContext";
import { modulesService } from "../services/modulesService";

// Ícones
import HomeIcon from "@mui/icons-material/Home";
import InventoryIcon from "@mui/icons-material/Inventory";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import CategoryIcon from "@mui/icons-material/Category";
import MapIcon from "@mui/icons-material/Map";
import PeopleIcon from "@mui/icons-material/People";
import MoveToInboxIcon from "@mui/icons-material/MoveToInbox";
import PlaceIcon from "@mui/icons-material/Place";
import ContentCutIcon from "@mui/icons-material/ContentCut";
import AssignmentIcon from "@mui/icons-material/Assignment";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";

const iconMap = {
  receiving: <MoveToInboxIcon />,
  addressing: <PlaceIcon />,
  transfers: <SwapHorizIcon />,
  picking: <ContentCutIcon />,
  packaging: <CategoryIcon />,
  manifest: <AssignmentIcon />,
  stock: <InventoryIcon />,
  locations: <LocationOnIcon />,
  packaging_types: <CategoryIcon />,
  warehouse_map: <MapIcon />,
  cutoff_times: <AccessTimeIcon />,
  users: <PeopleIcon />,
};

const SidebarMenuItem = ({ icon, label, route, active, isExpanded, onNavigate }) => {
  const button = (
    <Button
      fullWidth
      variant={active ? "contained" : "text"}
      startIcon={icon}
      onClick={() => onNavigate(route)}
      sx={{
        justifyContent: isExpanded ? "flex-start" : "center",
        py: 1.5,
        fontSize: "0.95rem",
        minWidth: isExpanded ? "auto" : 56,
        px: isExpanded ? 2 : 1,
        "& .MuiButton-startIcon": { margin: isExpanded ? "0 8px 0 0" : 0 },
        transition: "all 0.3s",
        bgcolor: active ? "primary.main" : "transparent",
        color: active ? "white" : "text.primary",
        "&:hover": { bgcolor: active ? "primary.dark" : "rgba(255, 107, 53, 0.08)" },
      }}
    >
      {isExpanded && label}
    </Button>
  );

  return isExpanded ? button : <Tooltip title={label} placement="right">{button}</Tooltip>;
};

export const Sidebar = ({ isExpanded }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { hasPermission } = useAuth();
  const allModules = modulesService.listModules();

  const allowedModules = allModules.filter((module) =>
    module.route && hasPermission(module.id),
  );

  const operationalModules = allowedModules.filter(
    (m) => m.type === "operational",
  );
  const administrativeModules = allowedModules.filter(
    (m) => m.type === "administrative",
  );

  const isActive = (route) =>
    location.pathname === route ||
    (route !== "/dashboard" && location.pathname.startsWith(`${route}/`));

  return (
    <Paper
      elevation={2}
      sx={{
        width: isExpanded ? 280 : 72,
        height: "100%",
        borderRadius: 0,
        display: "flex",
        flexDirection: "column",
        overflow: "auto",
        transition: "width 0.3s ease",
        bgcolor: "white",
        borderRight: "1px solid",
        borderColor: "divider",
      }}
    >
      <Stack spacing={1} sx={{ p: isExpanded ? 2 : 1, pt: 2 }}>
        <SidebarMenuItem
          icon={<HomeIcon />}
          label="Dashboard"
          route="/dashboard"
          active={isActive("/dashboard")}
          isExpanded={isExpanded}
          onNavigate={navigate}
        />

        {operationalModules.length > 0 && (
          <>
            <Divider sx={{ my: 1 }} />
            {isExpanded && (
              <Box
                sx={{
                  fontSize: "0.7rem",
                  color: "text.secondary",
                  px: 2,
                  fontWeight: "bold",
                  letterSpacing: 0.5,
                }}
              >
                OPERACIONAIS
              </Box>
            )}
            {operationalModules.map((module) => (
              <SidebarMenuItem
                key={module.id}
                icon={iconMap[module.id]}
                label={module.name}
                route={module.route}
                active={isActive(module.route)}
                isExpanded={isExpanded}
                onNavigate={navigate}
              />
            ))}
          </>
        )}

        {administrativeModules.length > 0 && (
          <>
            <Divider sx={{ my: 1 }} />
            {isExpanded && (
              <Box
                sx={{
                  fontSize: "0.7rem",
                  color: "text.secondary",
                  px: 2,
                  fontWeight: "bold",
                  letterSpacing: 0.5,
                }}
              >
                ADMINISTRATIVOS
              </Box>
            )}
            {administrativeModules.map((module) => (
              <SidebarMenuItem
                key={module.id}
                icon={iconMap[module.id]}
                label={module.name}
                route={module.route}
                active={isActive(module.route)}
                isExpanded={isExpanded}
                onNavigate={navigate}
              />
            ))}
          </>
        )}
      </Stack>
    </Paper>
  );
};
