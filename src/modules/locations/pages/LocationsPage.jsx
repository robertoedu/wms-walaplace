import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Paper,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import SearchIcon from "@mui/icons-material/Search";
import Inventory2OutlinedIcon from "@mui/icons-material/Inventory2Outlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteForeverOutlined";
import { MainLayout } from "../../../shared/layout/MainLayout";
import { locationsService } from "../services/locationsService";
import { LocationFormDialog } from "../components/LocationFormDialog";
import { LocationItemsDialog } from "../components/LocationItemsDialog";
import { RemoveLocationItemDialog } from "../components/RemoveLocationItemDialog";
import { DeleteLocationDialog } from "../components/DeleteLocationDialog";

export const LocationsPage = () => {
  const [locations, setLocations] = useState(() => locationsService.list());
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [notification, setNotification] = useState({ message: "", severity: "success" });
  const [itemsLocation, setItemsLocation] = useState(null);
  const [locationItems, setLocationItems] = useState([]);
  const [removingItem, setRemovingItem] = useState(null);
  const [deletingLocation, setDeletingLocation] = useState(null);

  useEffect(() => {
    const refresh = () => setLocations(locationsService.list());
    window.addEventListener("wms-mock-database-change", refresh);
    return () => window.removeEventListener("wms-mock-database-change", refresh);
  }, []);

  const filteredLocations = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return locations;
    return locations.filter((location) =>
      [location.code, location.description, location.parentLocationCode].some((value) =>
        String(value || "").toLowerCase().includes(term),
      ),
    );
  }, [locations, search]);

  const summary = useMemo(() => ({
    total: locations.length,
    itemQuantity: locations.reduce((total, location) => total + Number(location.occupied || 0), 0),
  }), [locations]);

  const closeDialog = () => {
    setOpen(false);
    setEditing(null);
  };

  const save = (form) => {
    locationsService.save(form);
    setLocations(locationsService.list());
    closeDialog();
    setNotification({ message: editing ? "Local atualizado com sucesso." : "Local cadastrado com sucesso.", severity: "success" });
  };

  const openItems = (location) => {
    setItemsLocation(location);
    setLocationItems(locationsService.listItems(location.code));
  };

  const removeItem = () => {
    try {
      locationsService.removeItem(itemsLocation.code, removingItem.sku);
      setLocations(locationsService.list());
      setLocationItems(locationsService.listItems(itemsLocation.code));
      setRemovingItem(null);
      setItemsLocation((current) => locationsService.list().find((location) => location.id === current.id) || current);
      setNotification({ message: "Item removido do local. O produto agora esta sem localizacao.", severity: "success" });
    } catch (removeError) {
      setRemovingItem(null);
      setNotification({ message: removeError.message, severity: "error" });
    }
  };

  const deleteLocation = () => {
    try {
      locationsService.delete(deletingLocation.id);
      setLocations(locationsService.list());
      setDeletingLocation(null);
      setNotification({ message: "Local excluido com sucesso.", severity: "success" });
    } catch (deleteError) {
      setDeletingLocation(null);
      setNotification({ message: deleteError.message, severity: "error" });
    }
  };

  return (
    <MainLayout>
      <Stack spacing={3} sx={{ maxWidth: 1400, mx: "auto" }}>
        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={2}>
          <Stack direction="row" spacing={2} alignItems="center">
            <LocationOnIcon sx={{ fontSize: 44, color: "primary.main" }} />
            <Box>
              <Typography variant="h4" fontWeight={800}>Cadastro de locais</Typography>
              <Typography color="text.secondary">Gerencie os enderecos fisicos e a rota de separacao.</Typography>
            </Box>
          </Stack>
          <Button variant="contained" size="large" startIcon={<AddIcon />} onClick={() => setOpen(true)}>Cadastrar local</Button>
        </Stack>

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" }, gap: 2 }}>
          {[
            ["Locais cadastrados", summary.total, "primary"],
            ["Itens nos locais", summary.itemQuantity, "success"],
          ].map(([label, value, color]) => (
            <Paper key={label} elevation={0} sx={{ p: 2, border: "1px solid", borderColor: "divider", borderRadius: 3 }}>
              <Typography variant="body2" color="text.secondary" fontWeight={600}>{label}</Typography>
              <Typography variant="h4" fontWeight={800} color={`${color}.main`}>{value}</Typography>
            </Paper>
          ))}
        </Box>

        <Paper elevation={0} sx={{ p: 2, border: "1px solid", borderColor: "divider", borderRadius: 3 }}>
          <TextField
            fullWidth
            label="Buscar local"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Codigo, descricao fisica ou local principal"
            slotProps={{ input: { startAdornment: <SearchIcon sx={{ mr: 1, color: "text.secondary" }} /> } }}
          />
        </Paper>

        <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3 }}>
          <Table sx={{ minWidth: 980 }}>
            <TableHead>
              <TableRow>
                <TableCell>Codigo</TableCell>
                <TableCell>Descricao fisica</TableCell>
                <TableCell>Vinculo</TableCell>
                <TableCell sx={{ minWidth: 360 }}>Rota</TableCell>
                <TableCell>Itens no local</TableCell>
                <TableCell align="right">Acoes</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredLocations.map((location) => {
                return (
                  <TableRow key={location.id} hover>
                    <TableCell><Typography fontWeight={800}>{location.code}</Typography></TableCell>
                    <TableCell sx={{ maxWidth: 430 }}>{location.description}</TableCell>
                    <TableCell>
                      {location.isSubLocation ? (
                        <Chip label={`Sublocal de ${location.parentLocationCode}`} size="small" variant="outlined" color="primary" />
                      ) : (
                        <Typography variant="body2" color="text.secondary">Local principal</Typography>
                      )}
                    </TableCell>
                    <TableCell sx={{ minWidth: 360, maxWidth: 520 }}>
                      <Stack spacing={0.25}>
                        <Typography variant="body2" fontWeight={700}>
                          Seq. {location.pickingSequence ?? "-"}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {[location.zone, location.aisle, location.side, location.position !== null ? `Pos. ${location.position}` : ""].filter(Boolean).join(" / ") || "Sem dados de rota"}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={700}>
                        {Number(location.occupied || 0)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Button size="small" startIcon={<Inventory2OutlinedIcon />} onClick={() => openItems(location)}>Ver itens</Button>
                        <Button variant="outlined" size="small" startIcon={<EditIcon />} onClick={() => { setEditing(location); setOpen(true); }}>Editar</Button>
                        {String(location.id).startsWith("LOC-") && (
                          <Button color="error" size="small" startIcon={<DeleteOutlineIcon />} onClick={() => setDeletingLocation(location)}>Excluir</Button>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
              {!filteredLocations.length && (
                <TableRow>
                  <TableCell colSpan={6}><Alert severity="info">Nenhum local encontrado.</Alert></TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <LocationFormDialog open={open} location={editing} locations={locations} onClose={closeDialog} onSave={save} />
        <LocationItemsDialog open={Boolean(itemsLocation)} location={itemsLocation} items={locationItems} onClose={() => setItemsLocation(null)} onRemove={setRemovingItem} />
        <RemoveLocationItemDialog open={Boolean(removingItem)} location={itemsLocation} item={removingItem} onClose={() => setRemovingItem(null)} onConfirm={removeItem} />
        <DeleteLocationDialog open={Boolean(deletingLocation)} location={deletingLocation} onClose={() => setDeletingLocation(null)} onConfirm={deleteLocation} />
        <Snackbar open={Boolean(notification.message)} autoHideDuration={4000} onClose={() => setNotification((current) => ({ ...current, message: "" }))} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
          <Alert severity={notification.severity} onClose={() => setNotification((current) => ({ ...current, message: "" }))}>{notification.message}</Alert>
        </Snackbar>
      </Stack>
    </MainLayout>
  );
};
