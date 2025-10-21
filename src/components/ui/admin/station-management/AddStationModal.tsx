import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';
import { apiClient } from '../../../../service/api';
import { API } from '../../../../constants';

interface Props { open: boolean; onClose: (created?: boolean) => void; }

export default function AddStationModal({ open, onClose }: Props) {
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    setSaving(true);
    try {
      await apiClient.post(`${API.BASE}/rental-stations`, { city, address });
      onClose(true);
    } catch (err) {
      console.error('Create station failed', err);
      onClose(false);
    } finally { setSaving(false); }
  };

  return (
    <Dialog open={open} onClose={() => onClose(false)} fullWidth maxWidth="sm">
      <DialogTitle>Thêm trạm thuê</DialogTitle>
      <DialogContent>
        <TextField fullWidth label="City" value={city} onChange={(e) => setCity(e.target.value)} margin="normal" />
        <TextField fullWidth label="Address" value={address} onChange={(e) => setAddress(e.target.value)} margin="normal" />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose(false)}>Cancel</Button>
        <Button onClick={handleCreate} disabled={saving} variant="contained">Create</Button>
      </DialogActions>
    </Dialog>
  );
}
