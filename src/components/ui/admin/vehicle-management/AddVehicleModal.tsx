import { useState, useEffect } from 'react';
import { showSuccessToast, showErrorToast } from '../../../../utils/show-toast';
import { vehicleAdminService, type CreateVehicleRequest, type VehicleType } from '../../../../service/vehicleAdminService';
import { stationService, type Station } from '../../../../service/stationService';
import { Box, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';

interface AddVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVehicleAdded: () => void;
}

export default function AddVehicleModal({ isOpen, onClose, onVehicleAdded }: AddVehicleModalProps) {
  const [stations, setStations] = useState<Station[]>([]);
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
  const [loading, setLoading] = useState(false);
  // Local form state uses photos as string[] for easy textarea binding
  type FormState = {
    typeId: number;
    stationId: number;
    status: 'AVAILABLE' | 'MAINTENANCE' | 'RENTED';
    conditionNotes: string;
    photos: string[];
  };

  const [formData, setFormData] = useState<FormState>({
    typeId: 0,
    stationId: 0,
    status: 'AVAILABLE',
    conditionNotes: '',
    photos: []
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [stationsResponse, typesResponse] = await Promise.all([
          stationService.getAllStations(),
          vehicleAdminService.getVehicleTypes()
        ]);

        setStations(stationsResponse.data);
        setVehicleTypes(typesResponse.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        showErrorToast('Error fetching form data');
      }
    };

    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target as HTMLInputElement;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    } as unknown as FormState));
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target as HTMLSelectElement & { name: string };
    // typeId and stationId are numeric in our state
    if (name === 'typeId' || name === 'stationId') {
      setFormData(prev => ({ ...prev, [name]: parseInt(value) } as unknown as FormState));
    } else if (name === 'status') {
      setFormData(prev => ({ ...prev, status: value as FormState['status'] } as FormState));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await vehicleAdminService.createVehicle(formData);
      showSuccessToast('Vehicle added successfully');
      onVehicleAdded();
      onClose();
    } catch (error) {
      console.error('Failed to create vehicle:', error);
      // If axios error, show server response for debugging
      if ((error as any)?.response) {
        console.error('Server returned status', (error as any).response.status);
        console.error('Server response data:', (error as any).response.data);
      }
      showErrorToast('Failed to create vehicle');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New Vehicle</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Vehicle Type</InputLabel>
              <Select
                name="typeId"
                value={String(formData.typeId)}
                onChange={handleSelectChange}
                required
                label="Vehicle Type"
              >
                {vehicleTypes.map(type => (
                  <MenuItem key={type.id} value={String(type.id)}>
                    {type.name} - Rate: ${type.rentalRate}/day
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Station</InputLabel>
              <Select
                name="stationId"
                value={String(formData.stationId)}
                onChange={handleSelectChange}
                required
                label="Station"
              >
                {stations.map(station => (
                  <MenuItem key={station.id} value={String(station.id)}>
                    {station.city} - {station.address}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                name="status"
                value={formData.status}
                onChange={handleSelectChange}
                required
                label="Status"
              >
                <MenuItem value="AVAILABLE">Available</MenuItem>
                <MenuItem value="MAINTENANCE">Maintenance</MenuItem>
                <MenuItem value="RENTED">Rented</MenuItem>
              </Select>
            </FormControl>

            <TextField
              name="conditionNotes"
              label="Condition Notes"
              value={formData.conditionNotes}
              onChange={handleInputChange}
              multiline
              rows={4}
              required
            />

            <TextField
              name="photos"
              label="Photos (URLs, one per line)"
              value={formData.photos.join('\n')}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                photos: e.target.value.split('\n').filter(url => url.trim() !== '')
              }))}
              multiline
              rows={3}
              placeholder="Enter photo URLs, one per line"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary" disabled={loading}>
            {loading ? 'Adding...' : 'Add Vehicle'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}