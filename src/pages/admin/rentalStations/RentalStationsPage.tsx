import React, { useEffect, useState } from 'react';
import { Box, Button, Card, CardContent, IconButton } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { MdOutlineAddCircle } from 'react-icons/md';
import { FaInfoCircle, FaEdit, FaTrash } from 'react-icons/fa';
import { stationService } from '../../../service/stationService';
import { TextField } from '@mui/material';
import AddStationModal from '../../../components/ui/admin/station-management/AddStationModal';
import EditStationModal from '../../../components/ui/admin/station-management/EditStationModal';
import StationDetailModal from '../../../components/ui/admin/station-management/StationDetailModal';
import { apiClient } from '../../../service/api';
import { API } from '../../../constants';

export default function RentalStationsPage() {
  const [stations, setStations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [cityQuery, setCityQuery] = useState<string>('');
  const [allStationsCache, setAllStationsCache] = useState<any[] | null>(null);
  const [stationDetailOpen, setStationDetailOpen] = useState(false);
  const [stationDetailId, setStationDetailId] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const resp = await stationService.getAllStations();
      const list = resp.data || [];
      setStations(list);
      setAllStationsCache(list);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  // helpers for client-side fuzzy search (case-insensitive, substring, strip diacritics)
  const normalize = (s: string) => {
    try {
      return s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
    } catch (e) {
      // fallback if Unicode property escapes unsupported
      return s.replace(/[\u0300-\u036f]/g, '').toLowerCase();
    }
  };

  const doClientFilter = (query: string) => {
    if (!query) {
      if (allStationsCache) setStations(allStationsCache);
      return;
    }
    const q = normalize(query.trim());
    const filtered = (allStationsCache || []).filter((st: any) => {
      const city = st.city || '';
      const address = st.address || '';
      const hay = normalize(`${city} ${address}`);
      // split tokens so typing multiple words matches in any order
      return q.split(/\s+/).every(token => hay.includes(token));
    });
    setStations(filtered);
  };

  // debounce client-side filter while typing
  useEffect(() => {
    const tid = setTimeout(() => {
      if (!cityQuery) {
        if (allStationsCache) setStations(allStationsCache);
        return;
      }
      doClientFilter(cityQuery);
    }, 250);
    return () => clearTimeout(tid);
  }, [cityQuery, allStationsCache]);

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Xóa trạm này?')) return;
    try {
      await apiClient.delete(`${API.BASE}/rental-stations/${id}`);
      await load();
    } catch (err) { console.error('Delete station failed', err); }
  };

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 80 },
    { field: 'city', headerName: 'City', flex: 1 },
    { field: 'address', headerName: 'Address', flex: 2 },
    {
      field: 'actions', headerName: 'Actions', width: 150, sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <div className="flex gap-2">
          <IconButton size="small" onClick={() => {
            const row = params?.row || {};
            const sid = row?.id ?? row?.stationId ?? null; // station row: id represents station id
            setStationDetailId(sid);
            setStationDetailOpen(true);
          }} title="Detail" sx={{ color: '#2563eb' }}>
            <FaInfoCircle />
          </IconButton>
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
          <h1 className="text-xl font-semibold text-gray-800 mb-4">Danh sách trạm</h1>

          <div className="flex items-center justify-between mb-4">
            <div />
            <div className="flex items-center gap-2">
                <TextField size="small" placeholder="Search city/province" value={cityQuery} onChange={(e) => setCityQuery(e.target.value)} sx={{ minWidth: 220 }} />
                <Button variant="outlined" size="small" onClick={async () => {
                  if (!cityQuery) return load();
                  try {
                    const resp = await stationService.getStationsByCity(cityQuery);
                    setStations(resp.data || []);
                  } catch (err) {
                    console.error('City search failed, falling back to client filter', err);
                    doClientFilter(cityQuery);
                  }
                }}>Search</Button>
                <Button variant="text" size="small" onClick={() => { setCityQuery(''); if (allStationsCache) setStations(allStationsCache); else load(); }}>Clear</Button>
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
                Thêm trạm
              </Button>
            </div>
          </div>

          <div className="min-w-[600px] max-w-full">
            <DataGrid rows={stations} columns={columns} loading={loading} autoHeight />
          </div>

        </CardContent>
      </Card>

      <AddStationModal open={openAdd} onClose={(created?: boolean) => { setOpenAdd(false); if (created) load(); }} />
      <EditStationModal open={openEdit} id={editId} onClose={(updated?: boolean) => { setOpenEdit(false); if (updated) load(); }} />
      <StationDetailModal open={stationDetailOpen} id={stationDetailId} onClose={() => setStationDetailOpen(false)} />
    </Box>
  );
}
