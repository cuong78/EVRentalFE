import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, TextField, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { vehicleAdminService, type AdminVehicle, type CreateVehicleRequest, type VehicleType } from '../../../../service/vehicleAdminService';
import { stationService, type Station } from '../../../../service/stationService';
import { showSuccessToast, showErrorToast } from '../../../../utils/show-toast';

interface Props {
  open: boolean;
  id: number | null;
  onClose: () => void;
  onUpdated: () => void;
}

export default function VehicleEditModal({ open, id, onClose, onUpdated }: Props) {
  const [loading, setLoading] = useState(false);
  const [vehicle, setVehicle] = useState<AdminVehicle | null>(null);
  const [types, setTypes] = useState<VehicleType[]>([]);
  const [stations, setStations] = useState<Station[]>([]);
  const [form, setForm] = useState<CreateVehicleRequest>({ typeId: 0, stationId: 0, status: 'AVAILABLE', conditionNotes: '', photos: '' });

  useEffect(() => {
    if (!open || id == null) return;
    const load = async () => {
      setLoading(true);
      try {
        const [vResp, tResp, sResp] = await Promise.all([
          vehicleAdminService.getVehicleById(id),
          vehicleAdminService.getVehicleTypes(),
          stationService.getAllStations(),
        ]);
        setVehicle(vResp.data);
        setTypes(tResp.data);
        setStations(sResp.data);
        const v = vResp.data;
        setForm({
          typeId: v.type?.id ?? 0,
          stationId: v.station?.id ?? 0,
          status: v.status,
          conditionNotes: v.conditionNotes ?? '',
          photos: Array.isArray(v.photos) ? v.photos.join(',') : (v.photos || ''),
        });
      } catch (err) {
        console.error('Failed to load vehicle for edit', err);
        showErrorToast('Failed to load vehicle');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [open, id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target as any;
    setForm(prev => ({ ...prev, [name]: value } as any));
  };

  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: Number(value) } as any));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (id == null) return;
    setLoading(true);
    try {
      // normalize photos to string
      const payload: CreateVehicleRequest = {
        ...form,
        photos: form.photos,
      } as any;
      await vehicleAdminService.updateVehicle(id, payload as any);
      showSuccessToast('Vehicle updated');
      onUpdated();
      onClose();
    } catch (err: any) {
      console.error('Failed to update vehicle', err);
      showErrorToast(err?.response?.data?.message || 'Failed to update vehicle');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Edit vehicle</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Vehicle Type</InputLabel>
              <Select name="typeId" value={String(form.typeId)} onChange={handleSelectChange} label="Vehicle Type" required>
                {types.map(t => <MenuItem value={String(t.id)} key={t.id}>{t.name} - {t.rentalRate}</MenuItem>)}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Station</InputLabel>
              <Select name="stationId" value={String(form.stationId)} onChange={handleSelectChange} label="Station" required>
                {stations.map(s => <MenuItem value={String(s.id)} key={s.id}>{s.city} - {s.address}</MenuItem>)}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select name="status" value={form.status} onChange={(e:any) => setForm(prev => ({ ...prev, status: e.target.value }))} label="Status">
                <MenuItem value="AVAILABLE">Available</MenuItem>
                <MenuItem value="MAINTENANCE">Maintenance</MenuItem>
                <MenuItem value="RENTED">Rented</MenuItem>
              </Select>
            </FormControl>

            <TextField name="conditionNotes" label="Condition Notes" value={form.conditionNotes} onChange={handleChange} multiline rows={3} />

            <TextField name="photos" label="Photos (comma separated)" value={form.photos as any} onChange={handleChange} />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
