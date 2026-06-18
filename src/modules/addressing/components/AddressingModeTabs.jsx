import { Button, Stack } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";

export const AddressingModeTabs = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const productsActive = location.pathname.includes("/produtos");

  return (
    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
      <Button
        variant={productsActive ? "outlined" : "contained"}
        onClick={() => navigate("/enderecamento")}
      >
        Por nota
      </Button>
      <Button
        variant={productsActive ? "contained" : "outlined"}
        onClick={() => navigate("/enderecamento/produtos")}
      >
        Por produto
      </Button>
    </Stack>
  );
};
