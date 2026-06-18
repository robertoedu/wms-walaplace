import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Chip,
  MenuItem,
  Paper,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import LocalShippingOutlinedIcon from "@mui/icons-material/LocalShippingOutlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import TaskAltOutlinedIcon from "@mui/icons-material/TaskAltOutlined";
import { MainLayout } from "../../../shared/layout/MainLayout";
import { packagingTypesService } from "../services/packagingTypesService";

const typeIcons = {
  papel_pardo: <LocalShippingOutlinedIcon />,
  bolha: <ShieldOutlinedIcon />,
  pronto: <TaskAltOutlinedIcon />,
};

const normalize = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

const SummaryCard = ({ type, count, total }) => {
  const percent = total ? Math.round((count / total) * 100) : 0;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        border: "1px solid",
        borderColor: type.borderColor,
        bgcolor: type.bgColor,
        borderRadius: 2,
        minHeight: 134,
      }}
    >
      <Stack spacing={1.25}>
        <Stack direction="row" spacing={1.25} alignItems="center">
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "#ffffff",
              color: type.color,
              border: "1px solid",
              borderColor: type.borderColor,
            }}
          >
            {typeIcons[type.id]}
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Box sx={{ fontWeight: 900, color: "#0f172a" }}>{type.label}</Box>
            <Box sx={{ color: "text.secondary", fontSize: 13 }}>{type.helper}</Box>
          </Box>
        </Stack>
        <Stack direction="row" spacing={1} alignItems="baseline">
          <Box sx={{ fontSize: 30, fontWeight: 900, color: type.color }}>{count}</Box>
          <Box sx={{ color: "text.secondary", fontWeight: 700 }}>
            itens · {percent}%
          </Box>
        </Stack>
      </Stack>
    </Paper>
  );
};

export const PackagingTypesPage = () => {
  const [types] = useState(() => packagingTypesService.listTypes());
  const [products, setProducts] = useState(() =>
    packagingTypesService.listProductsWithPackagingTypes(),
  );
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("todos");
  const [feedback, setFeedback] = useState("");

  const typeById = useMemo(
    () => new Map(types.map((type) => [type.id, type])),
    [types],
  );

  const counts = useMemo(() => {
    const initial = Object.fromEntries(types.map((type) => [type.id, 0]));
    products.forEach((product) => {
      const currentType = product.packagingAssignment?.packagingType;
      if (currentType && initial[currentType] !== undefined) initial[currentType] += 1;
    });
    return initial;
  }, [products, types]);

  const filteredProducts = useMemo(() => {
    const term = normalize(search);
    return products.filter((product) => {
      const currentType = product.packagingAssignment?.packagingType;
      const matchesType = typeFilter === "todos" || currentType === typeFilter;
      const matchesSearch =
        !term ||
        [
          product.description,
          product.sku,
          product.ean,
          product.currentLocation,
          typeById.get(currentType)?.label,
        ]
          .map(normalize)
          .some((value) => value.includes(term));

      return matchesType && matchesSearch;
    });
  }, [products, search, typeFilter, typeById]);

  const handleTypeChange = (product, packagingType) => {
    if (!packagingType) return;
    const assignment = packagingTypesService.saveAssignment(product.sku, packagingType);
    setProducts((current) =>
      current.map((item) =>
        item.sku === product.sku
          ? { ...item, packagingAssignment: assignment }
          : item,
      ),
    );
    setFeedback(`${product.description} marcado como ${typeById.get(packagingType)?.label}.`);
  };

  return (
    <MainLayout>
      <Stack spacing={3}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", md: "center" }}
        >
          <Box>
            <Box sx={{ fontSize: "2rem", fontWeight: 800 }}>
              Tipos de Embalagem
            </Box>
            <Box sx={{ color: "text.secondary" }}>
              Defina como cada item do estoque deve chegar na etapa de separacao.
            </Box>
          </Box>
          <Chip
            icon={<Inventory2OutlinedIcon />}
            label={`${products.length} itens do estoque`}
            color="primary"
            sx={{ alignSelf: { xs: "flex-start", md: "center" }, fontWeight: 800 }}
          />
        </Stack>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              md: "repeat(3, minmax(0, 1fr))",
            },
            gap: 2,
          }}
        >
          {types.map((type) => (
            <SummaryCard
              key={type.id}
              type={type}
              count={counts[type.id] || 0}
              total={products.length}
            />
          ))}
        </Box>

        <Paper
          elevation={0}
          sx={{ p: 2, border: "1px solid", borderColor: "divider", borderRadius: 2 }}
        >
          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <TextField
              label="Buscar item"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Descricao, SKU, EAN, local ou tipo"
              fullWidth
            />
            <TextField
              label="Tipo"
              select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
              sx={{ minWidth: { xs: "100%", md: 240 } }}
            >
              <MenuItem value="todos">Todos os tipos</MenuItem>
              {types.map((type) => (
                <MenuItem key={type.id} value={type.id}>
                  {type.label}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
            overflow: "hidden",
          }}
        >
          <Box sx={{ overflow: "auto" }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800 }}>Item</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>SKU</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>EAN</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Local</TableCell>
                  <TableCell sx={{ fontWeight: 800, minWidth: 390 }}>
                    Tipo de embalagem
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <Box sx={{ py: 6, textAlign: "center", color: "text.secondary" }}>
                        Nenhum item encontrado.
                      </Box>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product) => {
                    const currentType = product.packagingAssignment?.packagingType;
                    return (
                      <TableRow key={product.sku} hover>
                        <TableCell>
                          <Stack spacing={0.5}>
                            <Box sx={{ fontWeight: 800 }}>{product.description}</Box>
                            <Box sx={{ color: "text.secondary", fontSize: 13 }}>
                              Quantidade em estoque: {product.quantity}
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell>{product.sku}</TableCell>
                        <TableCell>{product.ean || "-"}</TableCell>
                        <TableCell>{product.currentLocation || "-"}</TableCell>
                        <TableCell>
                          <ToggleButtonGroup
                            exclusive
                            value={currentType}
                            onChange={(_, nextType) => handleTypeChange(product, nextType)}
                            size="small"
                            sx={{
                              flexWrap: "wrap",
                              gap: 1,
                              "& .MuiToggleButtonGroup-grouped": {
                                border: "1px solid",
                                borderColor: "divider",
                                borderRadius: "8px !important",
                                px: 1.5,
                                py: 0.75,
                                fontWeight: 800,
                              },
                            }}
                          >
                            {types.map((type) => (
                              <ToggleButton
                                key={type.id}
                                value={type.id}
                                sx={{
                                  color: type.color,
                                  "&.Mui-selected": {
                                    bgcolor: type.bgColor,
                                    borderColor: type.borderColor,
                                    color: type.color,
                                  },
                                  "&.Mui-selected:hover": {
                                    bgcolor: type.bgColor,
                                  },
                                }}
                              >
                                <Stack direction="row" spacing={0.75} alignItems="center">
                                  {typeIcons[type.id]}
                                  <Box>{type.label}</Box>
                                </Stack>
                              </ToggleButton>
                            ))}
                          </ToggleButtonGroup>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </Box>
        </Paper>
      </Stack>

      <Snackbar
        open={!!feedback}
        autoHideDuration={2400}
        onClose={() => setFeedback("")}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert severity="success" variant="filled" onClose={() => setFeedback("")}>
          {feedback}
        </Alert>
      </Snackbar>
    </MainLayout>
  );
};
