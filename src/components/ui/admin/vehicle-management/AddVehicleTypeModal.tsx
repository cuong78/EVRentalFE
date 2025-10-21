import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box, Typography } from '@mui/material';
import { vehicleAdminService } from '../../../../service/vehicleAdminService';
import { showSuccessToast, showErrorToast } from '../../../../utils/show-toast';

export default function AddVehicleTypeModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [depositAmount, setDepositAmount] = useState<number | ''>('' as any);
  const [rentalRate, setRentalRate] = useState<number | ''>('' as any);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    try {
      await vehicleAdminService.createVehicleType({ name, depositAmount: Number(depositAmount), rentalRate: Number(rentalRate) });
      showSuccessToast('Created');
      onClose();
    } catch (err) { showErrorToast('Failed'); }
    setLoading(false);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        <Typography variant="h6">Thêm loại xe</Typography>
      </DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          <Box sx={{ display: 'grid', gap: 2 }}>
            <TextField fullWidth label="Name" variant="outlined" value={name} onChange={(e) => setName(e.target.value)} required />
            <TextField fullWidth label="Deposit Amount" variant="outlined" type="number" value={depositAmount as any} onChange={(e) => setDepositAmount(e.target.value === '' ? '' : Number(e.target.value))} inputProps={{ min: 0 }} helperText="Số tiền đặt cọc (VND)" required />
            <TextField fullWidth label="Rental Rate" variant="outlined" type="number" value={rentalRate as any} onChange={(e) => setRentalRate(e.target.value === '' ? '' : Number(e.target.value))} inputProps={{ min: 0 }} helperText="Giá thuê (VND / ngày)" required />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={onClose} disabled={loading} sx={{ textTransform: 'none' }}>CANCEL</Button>
          <Button type="submit" variant="contained" disabled={loading} sx={{ textTransform: 'none' }}>CREATE</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
