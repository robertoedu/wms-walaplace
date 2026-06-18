import { Box, Paper, Stack } from "@mui/material";
import { WarehouseElementCard } from "./WarehouseElementCard";

const elementOptions = [
  {
    type: "street",
    icon: "R",
    name: "Rua",
    description: "Adicionar rua ou corredor ao galpao",
  },
  {
    type: "location",
    icon: "L",
    name: "Local",
    description: "Adicionar local fisico do estoque",
  },
  {
    type: "environment",
    icon: "A",
    name: "Ambiente",
    description: "Adicionar area operacional",
  },
];

export const WarehouseMapSidebar = ({ onAddElement, message }) => {
  return (
    <Paper
      elevation={3}
      sx={{
        width: { xs: "100%", md: 320 },
        minWidth: { md: 320 },
        height: { xs: "auto", md: "100vh" },
        borderRadius: 0,
        p: 2,
        overflow: "auto",
      }}
    >
      <Stack spacing={2}>
        <Box>
          <Box sx={{ fontSize: 24, fontWeight: 900, color: "#0f172a" }}>Mapa do Galpao</Box>
          <Box sx={{ mt: 0.5, color: "#64748b", fontSize: 14 }}>
            Adicione os elementos e organize a planta do estoque.
          </Box>
        </Box>

        <Box
          sx={{
            p: 1.25,
            borderRadius: 2,
            bgcolor: "#fff7ed",
            color: "#9a3412",
            border: "1px solid #fed7aa",
            fontSize: 13,
            fontWeight: 800,
          }}
        >
          Para editar um elemento, clique duas vezes sobre ele.
        </Box>

        {message ? (
          <Box
            sx={{
              p: 1.25,
              borderRadius: 2,
              bgcolor: "#ecfdf5",
              color: "#166534",
              border: "1px solid #bbf7d0",
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            {message}
          </Box>
        ) : null}

        <Stack spacing={1.25}>
          {elementOptions.map((option) => (
            <WarehouseElementCard key={option.type} {...option} onClick={() => onAddElement(option.type)} />
          ))}
        </Stack>
      </Stack>
    </Paper>
  );
};
