import { useState } from "react";
import {
  Box,
  Stack,
  Paper,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Divider,
  Typography,
} from "@mui/material";
import { useAuth } from "../../auth/context/AuthContext";
import { useNavigate } from "react-router-dom";
import LogoutIcon from "@mui/icons-material/Logout";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import MenuIcon from "@mui/icons-material/Menu";

export const TopBar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    logout();
    navigate("/login");
  };

  const getRoleName = (role) => {
    const roles = {
      admin: "Administrador",
      supervisor: "Supervisor",
      operator: "Operador",
    };
    return roles[role] || role;
  };

  const getInitials = (name) => {
    return (
      name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "??"
    );
  };

  return (
    <Paper
      elevation={2}
      sx={{
        height: 50,
        width: "100%",
        display: "flex",
        alignItems: "center",
        px: 3,
        borderRadius: 0,
        bgcolor: "white",
        borderBottom: "1px solid",
        borderColor: "divider",
        flexWrap: "wrap",
        placeContent: "space-between",
      }}
    >
      <Stack
        direction="row"
        sx={{
          width: "100%",
          alignItems: "center",
          flexWrap: "wrap",
          justifyContent: "space-between",
          placeContent: "space-between",
        }}
      >
        {/* Lado Esquerdo - Menu Hamburger + Logo */}
        <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
          <IconButton
            onClick={onToggleSidebar}
            sx={{
              color: "primary.main",
            }}
          >
            <MenuIcon />
          </IconButton>

          <Box
            sx={{
              fontWeight: "bold",
              fontSize: { xs: "1.2rem", sm: "1.5rem" },
              color: "primary.main",
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            WMS{" "}
            <Box
              component="span"
              sx={{ color: "text.secondary", fontWeight: 500 }}
            >
              Walaplace
            </Box>
          </Box>
        </Stack>

        {/* Lado Direito - Avatar e Menu do Usuário */}
        <Box
          onClick={handleClick}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            cursor: "pointer",
            px: 1.5,
            py: 0.5,
            borderRadius: 2,
            transition: "all 0.2s",
            "&:hover": {
              bgcolor: "rgba(255, 107, 53, 0.08)",
            },
          }}
        >
          <Box
            sx={{ display: { xs: "none", sm: "block" }, textAlign: "right" }}
          >
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, color: "text.primary" }}
            >
              {getRoleName(user?.role)}
            </Typography>
          </Box>
          <Avatar
            sx={{
              bgcolor: "primary.main",
              width: 40,
              height: 40,
              fontSize: "1rem",
              fontWeight: "bold",
            }}
          >
            {getInitials(user?.name)}
          </Avatar>
          <KeyboardArrowDownIcon
            sx={{ color: "text.secondary", fontSize: "1.2rem" }}
          />
        </Box>
      </Stack>

      {/* Menu Dropdown do Usuário */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          elevation: 3,
          sx: {
            minWidth: 220,
            mt: 1.5,
            borderRadius: 2,
            overflow: "visible",
            border: "1px solid",
            borderColor: "divider",
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 600, color: "text.primary" }}
          >
            {user?.name}
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
            {getRoleName(user?.role)}
          </Typography>
        </Box>

        <Divider />

        <MenuItem
          onClick={handleLogout}
          sx={{
            py: 1.5,
            color: "error.main",
            "&:hover": {
              bgcolor: "rgba(211, 47, 47, 0.08)",
            },
          }}
        >
          <LogoutIcon sx={{ mr: 1.5, fontSize: "1.2rem" }} />
          Sair
        </MenuItem>
      </Menu>
    </Paper>
  );
};
