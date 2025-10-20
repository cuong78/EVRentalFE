import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, Typography } from '@mui/material';
import { vehicleAdminService } from '../../../../service/vehicleAdminService';
import { showSuccessToast, showErrorToast } from '../../../../utils/show-toast';

export default function EditVehicleTypeModal({ open, id, onClose }: { open: boolean; id: number | null; onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [depositAmount, setDepositAmount] = useState<number | ''>('' as any);
  const [rentalRate, setRentalRate] = useState<number | ''>('' as any);

  useEffect(() => {
    if (!open || id == null) return;
    const load = async () => {
      setLoading(true);
      try {
        const resp = await vehicleAdminService.getVehicleTypes();
        const t = resp.data.find((x: any) => x.id === id);
        if (t) {
          setName(t.name);
          setDepositAmount(t.depositAmount);
          setRentalRate(t.rentalRate);
        }
      } catch (err) { console.error(err); }
      setLoading(false);
    };
    load();
  }, [open, id]);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (id == null) return;
    setLoading(true);
    try {
      await vehicleAdminService.updateVehicleType(id, { name, depositAmount: Number(depositAmount), rentalRate: Number(rentalRate) });
      showSuccessToast('Updated');
      onClose();
    } catch (err) { showErrorToast('Failed'); }
    setLoading(false);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        <Typography variant="h6">Edit vehicle type</Typography>
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          <Box sx={{ display: 'grid', gap: 2 }}>
            <TextField
              fullWidth
              label="Name"
              variant="outlined"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <TextField
              fullWidth
              label="Deposit Amount"
              variant="outlined"
              type="number"
              value={depositAmount as any}
              onChange={(e) => setDepositAmount(e.target.value === '' ? '' : Number(e.target.value))}
              inputProps={{ min: 0 }}
              helperText="Số tiền đặt cọc (VND)"
              required
            />

            <TextField
              fullWidth
              label="Rental Rate"
              variant="outlined"
              type="number"
              value={rentalRate as any}
              onChange={(e) => setRentalRate(e.target.value === '' ? '' : Number(e.target.value))}
              inputProps={{ min: 0 }}
              helperText="Giá thuê (VND / ngày)"
              required
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} disabled={loading} sx={{ textTransform: 'none' }}>CANCEL</Button>
          <Button type="submit" variant="contained" disabled={loading} sx={{ textTransform: 'none' }}>SAVE</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
