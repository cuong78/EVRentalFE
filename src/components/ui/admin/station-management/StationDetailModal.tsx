import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, Chip, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import { stationService } from '../../../../service/stationService';

interface Props {
  open: boolean;
  id: number | null;
  onClose: () => void;
}

export default function StationDetailModal({ open, id, onClose }: Props) {
  const [payload, setPayload] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || id == null) return;
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const resp = await stationService.getStationById(id);
        if (!mounted) return;
        // stationService returns response.data (may be wrapped). Keep full payload so we can display wrapper.
        setPayload(resp);
      } catch (err) {
        console.error('Failed to load station detail', err);
        setPayload(null);
      } finally {
        setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [open, id]);

  const renderContent = () => {
    if (loading) return <Typography>Loading...</Typography>;
    if (!payload) return <Typography>No data</Typography>;

    // Prefer wrapped data if present
    const station = payload?.data ?? payload;

    const statusColor = (s: string) => {
      switch (s) {
        case 'AVAILABLE': return 'success';
        case 'MAINTENANCE': return 'warning';
        case 'RENTED': return 'default';
        default: return 'default';
      }
    };

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          <Box sx={{ minWidth: 260 }}>
            <Typography variant="subtitle1" fontWeight={600}>Station</Typography>
            <Typography>ID: {station?.id ?? 'N/A'}</Typography>
            <Typography>City: {station?.city ?? 'N/A'}</Typography>
            <Typography>Address: {station?.address ?? 'N/A'}</Typography>
            {station?.admin && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="subtitle2">Admin</Typography>
                <Typography>{station.admin.name ?? 'N/A'}</Typography>
              </Box>
            )}
          </Box>

          <Box sx={{ minWidth: 260 }}>
            <Typography variant="subtitle1" fontWeight={600}>Staff Members</Typography>
            {Array.isArray(station?.staffMembers) && station.staffMembers.length > 0 ? (
              station.staffMembers.map((s: any) => (
                <Box key={s.id} sx={{ display: 'flex', gap: 2, alignItems: 'center', mt: 0.5 }}>
                  <Typography>{s.name}</Typography>
                  <Chip label={s.role} size="small" />
                </Box>
              ))
            ) : (
              <Typography>No staff members</Typography>
            )}
          </Box>
        </Box>

        <Box>
          <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>Vehicles</Typography>
          {Array.isArray(station?.vehicles) && station.vehicles.length > 0 ? (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Condition</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {station.vehicles.map((v: any) => (
                  <TableRow key={v.id}>
                    <TableCell>{v.id}</TableCell>
                    <TableCell>
                      <Chip label={v.status} color={statusColor(v.status)} size="small" />
                    </TableCell>
                    <TableCell>{v.conditionNotes ?? '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Typography>No vehicles</Typography>
          )}
        </Box>
      </Box>
    );
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>Station detail</DialogTitle>
      <DialogContent dividers>
        {renderContent()}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}
