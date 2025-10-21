import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';
import { apiClient } from '../../../../service/api';
import { API } from '../../../../constants';

interface Props { open: boolean; id: number | null; onClose: (updated?: boolean) => void; }

export default function EditStationModal({ open, id, onClose }: Props) {
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !id) return;
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const resp = await apiClient.get(`${API.BASE}/rental-stations/${id}`);
        if (!mounted) return;
        // resp.data may be a wrapper { statusCode, message, data: { ... } } or the station object itself
        const payload = resp?.data?.data ?? resp?.data ?? resp;
        setCity(payload?.city ?? '');
        setAddress(payload?.address ?? '');
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    })();
    return () => { mounted = false; };
  }, [open, id]);

  const handleSave = async () => {
    if (!id) return;
    setSaving(true);
    try {
      await apiClient.put(`${API.BASE}/rental-stations/${id}`, { city, address });
      onClose(true);
    } catch (err) { console.error('Update failed', err); onClose(false); }
    finally { setSaving(false); }
  };

  return (
    <Dialog open={open} onClose={() => onClose(false)} fullWidth maxWidth="sm">
      <DialogTitle>Edit station</DialogTitle>
      <DialogContent>
        <TextField fullWidth label="City" value={city} onChange={(e) => setCity(e.target.value)} margin="normal" />
        <TextField fullWidth label="Address" value={address} onChange={(e) => setAddress(e.target.value)} margin="normal" />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose(false)}>Cancel</Button>
        <Button onClick={handleSave} disabled={saving} variant="contained">Save</Button>
      </DialogActions>
    </Dialog>
  );
}
