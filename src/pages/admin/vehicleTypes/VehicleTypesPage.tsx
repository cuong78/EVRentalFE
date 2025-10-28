import React, { useEffect, useState } from 'react';
import { Box, Card, CardContent, Button, IconButton } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { MdOutlineAddCircle } from 'react-icons/md';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { vehicleAdminService } from '../../../service/vehicleAdminService';
import AddVehicleTypeModal from '../../../components/ui/admin/vehicle-management/AddVehicleTypeModal';
import EditVehicleTypeModal from '../../../components/ui/admin/vehicle-management/EditVehicleTypeModal';
import { stationService } from '../../../service/stationService';
import { TextField } from '@mui/material';

export default function VehicleTypesPage() {
  const [types, setTypes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [stations, setStations] = useState<any[]>([]);
  const [filterStationId, setFilterStationId] = useState<number | ''>('');
  const [filterStartDate, setFilterStartDate] = useState<string>('');
  const [filterEndDate, setFilterEndDate] = useState<string>('');

  const load = async () => {
    setLoading(true);
    try {
      const resp = await vehicleAdminService.getVehicleTypes();
      setTypes(resp.data || []);
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);
  useEffect(() => {
    const loadStations = async () => {
      try {
        const resp = await stationService.getAllStations();
        setStations(resp.data || []);
      } catch (err) { console.error(err); }
    };
    loadStations();
  }, []);

  // When station filter changes, automatically fetch types for that station (so availableCount is populated)
  useEffect(() => {
    const fetchByStation = async () => {
      if (!filterStationId) return;
      try {
        const resp = await vehicleAdminService.getVehicleTypesByStation(Number(filterStationId), filterStartDate || undefined, filterEndDate || undefined);
        setTypes(resp.data || []);
      } catch (err) {
        console.error('Failed to fetch types by station on select', err);
      }
    };
    fetchByStation();
  }, [filterStationId, filterStartDate, filterEndDate]);

  const handleDelete = async (id: number) => {
    if (!confirm('Xóa loại xe này?')) return;
    try {
      await vehicleAdminService.deleteVehicleType(id);
      await load();
    } catch (e) { console.error(e); }
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'name', headerName: 'Name', flex: 1 },
  { field: 'depositAmount', headerName: 'Deposit Amount', width: 140 },
  { field: 'rentalRate', headerName: 'Rental Rate', width: 140 },
  { field: 'availableCount', headerName: 'Available', width: 120, valueGetter: (params: any) => typeof params?.row?.availableCount !== 'undefined' ? params.row.availableCount : '-' },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <div className="flex gap-2">
          <IconButton size="small" onClick={() => { setEditId(params.row.id); setOpenEdit(true); }} title="Edit" sx={{ color: '#f59e0b' }}>
            <FaEdit />
          </IconButton>
          <IconButton size="small" onClick={() => handleDelete(params.row.id)} title="Delete" sx={{ color: '#ef4444' }}>
            <FaTrash />
          </IconButton>
        </div>
      )
    }
  ];

  return (
    <Box sx={{ width: '100%' }}>
      <Card sx={{ borderRadius: 4, boxShadow: 3 }}>
        <CardContent>
          <h1 className="text-xl font-semibold text-gray-800 mb-4">Danh Sách Loại Xe</h1>

          <div className="flex items-center justify-between mb-4">
            <div />
            <div className="flex items-center gap-2">
              {/* Station select */}
              <select value={filterStationId ?? ''} onChange={(e) => setFilterStationId(e.target.value ? Number(e.target.value) : '')} className="border rounded px-2 py-1">
                <option value="">All stations</option>
                {stations.map(s => <option key={s.id} value={s.id}>{s.city} - {s.address}</option>)}
              </select>

              {/* Date inputs */}
              <input type="date" value={filterStartDate} onChange={(e) => setFilterStartDate(e.target.value)} className="border rounded px-2 py-1" />
              <input type="date" value={filterEndDate} onChange={(e) => setFilterEndDate(e.target.value)} className="border rounded px-2 py-1" />

              <Button variant="outlined" size="small" onClick={async () => {
                try {
                  if (filterStationId) {
                    const resp = await vehicleAdminService.getVehicleTypesByStation(Number(filterStationId), filterStartDate || undefined, filterEndDate || undefined);
                    setTypes(resp.data || []);
                    return;
                  }
                  await load();
                } catch (err) { console.error(err); }
              }}>Filter</Button>

              <Button variant="text" size="small" onClick={() => { setFilterStationId(''); setFilterStartDate(''); setFilterEndDate(''); load(); }}>Clear</Button>

              <Button
                variant="contained"
                color="primary"
                onClick={() => setOpenAdd(true)}
                startIcon={<MdOutlineAddCircle />}
                size="small"
                sx={{
                  backgroundColor: '#2563eb',
                  '&:hover': { backgroundColor: '#1d4ed8' },
                  textTransform: 'none',
                  borderRadius: '8px',
                  fontWeight: 500,
                  fontSize: '14px',
                  height: '40px',
                  width: '200px',
                }}
              >
                Thêm loại xe
              </Button>
            </div>
          </div>

          <div className="min-w-[600px] max-w-full">
            <DataGrid rows={types} columns={columns} loading={loading} autoHeight />
          </div>
        </CardContent>
      </Card>

      <AddVehicleTypeModal open={openAdd} onClose={() => { setOpenAdd(false); load(); }} />
      <EditVehicleTypeModal open={openEdit} id={editId} onClose={() => { setOpenEdit(false); load(); }} />
    </Box>
  );
}
