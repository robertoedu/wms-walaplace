import { useState } from "react";
import { Box } from "@mui/material";
import { TopBar } from "./TopBar";
import { Sidebar } from "./Sidebar";

export const MainLayout = ({ children }) => {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

  const handleToggleSidebar = () => {
    setSidebarExpanded((prev) => !prev);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <TopBar onToggleSidebar={handleToggleSidebar} />
      <Box sx={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <Sidebar isExpanded={sidebarExpanded} />
        <Box
          component="main"
          sx={{
            flex: 1,
            overflow: "auto",
            bgcolor: "#fafafa",
            p: 3,
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};
