import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography } from '@mui/material';
import { vehicleAdminService, type AdminVehicle } from '../../../../service/vehicleAdminService';
import { API } from '../../../../constants';

interface Props {
  open: boolean;
  id: number | null;
  onClose: () => void;
}

export default function VehicleDetailModal({ open, id, onClose }: Props) {
  const [vehicle, setVehicle] = useState<AdminVehicle | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || id == null) return;
    const load = async () => {
      setLoading(true);
      try {
        const resp = await vehicleAdminService.getVehicleById(id);
        setVehicle(resp.data);
      } catch (err) {
        console.error('Failed to load vehicle detail', err);
        setVehicle(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [open, id]);

  const renderPhotos = () => {
    if (!vehicle?.photos) return null;
    const photos = Array.isArray(vehicle.photos) ? vehicle.photos : String(vehicle.photos).split(',');
    return (
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
        {photos.map((p, i) => {
          const url = p.startsWith('http') ? p : `${API.BASE.replace(/\/$/, '')}${p.startsWith('/') ? p : `/${p}`}`;
          return <img key={i} src={url} alt={`photo-${i}`} style={{ width: 160, height: 100, objectFit: 'cover', borderRadius: 6 }} />;
        })}
      </Box>
    );
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Vehicle details</DialogTitle>
      <DialogContent dividers>
        {loading && <Typography>Loading...</Typography>}
        {!loading && vehicle && (
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 2 }}>
            <Box>
              {renderPhotos()}
            </Box>
            <Box>
              <Typography variant="h6">ID: {vehicle.id}</Typography>
              <Typography><strong>Type:</strong> {vehicle.type?.name ?? 'N/A'}</Typography>
              <Typography><strong>Deposit:</strong> {vehicle.type?.depositAmount ?? 'N/A'}</Typography>
              <Typography><strong>Rental rate:</strong> {vehicle.type?.rentalRate ?? 'N/A'}</Typography>
              <Typography><strong>Station:</strong> {vehicle.station ? `${vehicle.station.city} - ${vehicle.station.address}` : 'N/A'}</Typography>
              <Typography><strong>Status:</strong> {vehicle.status}</Typography>
              <Typography sx={{ mt: 1 }}><strong>Condition notes:</strong></Typography>
              <Typography sx={{ whiteSpace: 'pre-wrap' }}>{vehicle.conditionNotes}</Typography>
              <Typography sx={{ mt: 1 }}><strong>Created at:</strong> {vehicle.createdAt}</Typography>
              <Typography><strong>Updated at:</strong> {vehicle.updatedAt}</Typography>
            </Box>
          </Box>
        )}
        {!loading && !vehicle && <Typography>No data</Typography>}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
