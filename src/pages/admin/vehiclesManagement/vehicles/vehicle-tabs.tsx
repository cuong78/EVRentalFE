import { Tabs, Tab, Box, Card, CardContent } from "@mui/material";
import { useState } from "react";
import { GenreListPage } from "../../genres-management/index.tsx";
import { VehicleListPage } from "./index.tsx";
import VersionManagementPage from "../../version-management/index";

export default function VehicleManagementTabs () {
  const [value, setValue] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Tabs
        value={value}
        onChange={handleChange}
        aria-label="Vehicle Management Tabs"
        textColor="primary"
        indicatorColor="primary"
        sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
      >
        <Tab label="Phim" />
        <Tab label="Thể loại" />
        <Tab label="Phiên bản" />
      </Tabs>

      {value === 0 && (
        <Card sx={{ borderRadius: 4, boxShadow: 3 }}>
          <CardContent>
            <VehicleListPage />
          </CardContent>
        </Card>
      )}

      {value === 1 && (
        <Card sx={{ borderRadius: 4, boxShadow: 3 }}>
          <CardContent>
            <GenreListPage />
          </CardContent>
        </Card>
      )}

      {value === 2 && (
        <Card sx={{ borderRadius: 4, boxShadow: 3 }}>
          <CardContent>
            <VersionManagementPage />
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
