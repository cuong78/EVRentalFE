import { Tabs, Tab, Box, Card, CardContent } from "@mui/material";
import { useState } from "react";
import { VehiclesManagementPage } from "./index.tsx";
import VehicleTypesPage from "../../vehicleTypes/VehicleTypesPage";

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
        <Tab label="Xe" />
        <Tab label="Loại xe" />
      </Tabs>

      {value === 0 && (
        <Card sx={{ borderRadius: 4, boxShadow: 3 }}>
          <CardContent>
            <VehiclesManagementPage />
          </CardContent>
        </Card>
      )}

      {value === 1 && (
        <Card sx={{ borderRadius: 4, boxShadow: 3 }}>
          <CardContent>
            <VehicleTypesPage />
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
