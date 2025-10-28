import { DataGrid } from "@mui/x-data-grid";
import type { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { MdOutlineAddCircle } from "react-icons/md";
import { FaInfoCircle, FaEdit, FaTrash } from "react-icons/fa";
import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
} from "@mui/material";
import { useVehicle } from "../../../../hooks/useVehicle";
import { vehicleAdminService } from "../../../../service/vehicleAdminService";
import { stationService } from "../../../../service/stationService";
import AddVehicleModal from "../../../../components/ui/admin/vehicle-management/AddVehicleModal";
import VehicleDetailModal from "../../../../components/ui/admin/vehicle-management/VehicleDetailModal";
import StationDetailModal from '../../../../components/ui/admin/station-management/StationDetailModal';
import VehicleEditModal from "../../../../components/ui/admin/vehicle-management/VehicleEditModal";
import { showSuccessToast, showErrorToast } from "../../../../utils/show-toast";
import type { AdminVehicle } from "../../../../service/vehicleAdminService";
import { API } from "../../../../constants";

export const VehiclesManagementPage = () => {
  const {
    vehicles,
    loading,
    pageNo,
    setPageNo,
    pageSize,
    setPageSize,
    totalElements,
    getVehicles,
    deleteVehicle,
    setVehicles,
    setTotalElements,
  } = useVehicle();

  const [openAdd, setOpenAdd] = useState(false);
  
  const [typesMap, setTypesMap] = useState<Record<number, any>>({});
  const [stationsMap, setStationsMap] = useState<Record<number, any>>({});
  const [filterTypeId, setFilterTypeId] = useState<number | null>(null);
  const [filterStationId, setFilterStationId] = useState<number | null>(null);
  const [allTypes, setAllTypes] = useState<any[]>([]);
  const [allStations, setAllStations] = useState<any[]>([]);

  const handleOpenAdd = () => setOpenAdd(true);
  const handleCloseAdd = () => setOpenAdd(false);

  const handleVehicleAdded = () => {
    getVehicles();
  };

  const handleDeleteVehicle = async (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa xe này?")) {
      try {
        await deleteVehicle(id);
        showSuccessToast("Xóa xe thành công");
        getVehicles();
      } catch (error) {
        showErrorToast("Không thể xóa xe");
      }
    }
  };

  useEffect(() => {
    getVehicles();
  }, [pageNo, pageSize]);

  useEffect(() => {
    // Load vehicle types and stations once so we can map IDs to objects if backend returns IDs only
    const loadHelpers = async () => {
      try {
        const [typesResp, stationsResp] = await Promise.all([
          vehicleAdminService.getVehicleTypes(),
          stationService.getAllStations(),
        ]);
        const types = typesResp?.data ?? [];
        const stations = stationsResp?.data ?? [];
        setTypesMap(Object.fromEntries(types.map((t: any) => [t.id, t])));
        setAllTypes(types);
        setAllStations(stations);
        setStationsMap(Object.fromEntries(stations.map((s: any) => [s.id, s])));
      } catch (err) {
        console.error('Failed to load types/stations:', err);
      }
    };
    loadHelpers();
  }, []);

  const handleDetail = (id: number) => {
    setDetailId(id);
    setDetailOpen(true);
  };

  const handleEdit = (id: number) => {
    setEditId(id);
    setEditOpen(true);
  };

  const [editOpen, setEditOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);

  const [stationDetailOpen, setStationDetailOpen] = useState(false);
  const [stationDetailId, setStationDetailId] = useState<number | null>(null);

  const columns: GridColDef[] = [
    { field: "id", headerName: "Mã xe", flex: 1, width: 80 },
    {
      field: 'image',
      headerName: 'Hình ảnh',
      flex: 1,
      width: 100,
      sortable: false,
      renderCell: (params: any) => {
        const photoField = params?.row?.photos;
        let photoUrl = '';
        if (Array.isArray(photoField) && photoField.length > 0) photoUrl = photoField[0];
        else if (typeof photoField === 'string' && photoField) photoUrl = photoField.split(',')[0];
        if (!photoUrl) return null;
        // If photoUrl already absolute, use it; otherwise prefix with API base
        const absolute = photoUrl.startsWith('http')
          ? photoUrl
          : `${API.BASE.replace(/\/$/, '')}${photoUrl.startsWith('/') ? photoUrl : `/${photoUrl}`}`;
        return (
          <img src={absolute} alt="thumbnail" style={{ width: 60, height: 40, objectFit: 'cover', borderRadius: 6 }} />
        );
      }
    },
    {
      field: "type",
      headerName: "Loại xe",
      flex: 2,
      width: 180,
      renderCell: (params: any) => {
        const row = params?.row || {};
        
        if (row.type && row.type.name) return <span>{row.type.name}</span>;
        if (row.typeId) return <span>{`Type #${row.typeId}`}</span>;
        return <span>N/A</span>;
      }
    },
    {
      field: 'depositAmount',
      headerName: 'Deposit Amount',
      flex: 1,
      width: 140,
      renderCell: (params: any) => {
        const row = params?.row || {};
        const value = row.type && typeof row.type.depositAmount !== 'undefined' ? row.type.depositAmount : null;
        return value !== null ? <span>{value}</span> : <span>N/A</span>;
      }
    },
    {
      field: 'rentalRate',
      headerName: 'Rental Rate',
      flex: 1,
      width: 140,
      renderCell: (params: any) => {
        const row = params?.row || {};
        const value = row.type && typeof row.type.rentalRate !== 'undefined' ? row.type.rentalRate : null;
        return value !== null ? <span>{value}</span> : <span>N/A</span>;
      }
    },
    {
      field: "station",
      headerName: "Trạm xe",
      flex: 3,
      width: 240,
      renderCell: (params: any) => {
        const row = params?.row || {};
        const st = row.station;
        if (st && st.city) return <span>{`${st.city} - ${st.address}`}</span>;
        if (row.stationId) return <span>{`Station #${row.stationId}`}</span>;
        return <span>N/A</span>;
      },
    },
    { field: "status", headerName: "Trạng thái", flex: 1, width: 120 },
          {
            field: "action",
            headerName: "Hành động",
            flex: 1.5,
            sortable: false,
            renderCell: (params: GridRenderCellParams) => (
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    // Open station detail modal for the vehicle's station
                    const row = params?.row || {};
                    const stationId = row?.station?.id ?? row?.stationId ?? null;
                    setStationDetailId(stationId);
                    setStationDetailOpen(true);
                  }}
                  className="text-blue-600 cursor-pointer"
                >
                  <FaInfoCircle />
                </button>
                <button
                  onClick={() => handleEdit(params?.row?.id ?? params.id)}
                  className="text-yellow-600 cursor-pointer"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => handleDeleteVehicle(params?.row?.id ?? params.id)}
                  className="text-red-600 cursor-pointer"
                >
                  <FaTrash />
                </button>
              </div>
            ),
          },
  ];

  const rows = vehicles ?? [];
  // Map rows to ensure type/station objects exist when API only provides IDs
  const rowsMapped: AdminVehicle[] = (rows as AdminVehicle[]).map((r: any) => {
    const copy = { ...r } as any;
    if (!copy.type && copy.typeId && typesMap[copy.typeId]) copy.type = typesMap[copy.typeId];
    if (!copy.station && copy.stationId && stationsMap[copy.stationId]) copy.station = stationsMap[copy.stationId];
    return copy as AdminVehicle;
  });

  return (
    <Box sx={{ width: "100%" }}>
      <Card sx={{ borderRadius: 4, boxShadow: 3 }}>
        <CardContent>
          <h1 className="text-xl font-semibold text-gray-800 mb-4">
            Danh sách xe
          </h1>
          <div className="flex items-center justify-between mb-4">
            <div />
            <div className="flex items-center gap-2">
              <select value={filterTypeId ?? ''} onChange={(e) => setFilterTypeId(e.target.value ? Number(e.target.value) : null)} className="border rounded px-2 py-1">
                <option value="">All types</option>
                {allTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              <select value={filterStationId ?? ''} onChange={(e) => setFilterStationId(e.target.value ? Number(e.target.value) : null)} className="border rounded px-2 py-1">
                <option value="">All stations</option>
                {allStations.map(s => <option key={s.id} value={s.id}>{s.city} - {s.address}</option>)}
              </select>
              <Button variant="outlined" size="small" onClick={async () => {
                try {
                  if (filterStationId && filterTypeId) {
                    const resp = await vehicleAdminService.getVehiclesByStationAndType(filterStationId, filterTypeId);
                    setVehicles(resp.data);
                    setTotalElements(resp.data.length);
                  } else if (filterStationId) {
                    const resp = await vehicleAdminService.getVehiclesByStation(filterStationId);
                    setVehicles(resp.data);
                    setTotalElements(resp.data.length);
                  } else if (filterTypeId) {
                    const resp = await vehicleAdminService.getVehiclesByType(filterTypeId);
                    setVehicles(resp.data);
                    setTotalElements(resp.data.length);
                  } else {
                    await getVehicles();
                  }
                } catch (err) { console.error('Filter fetch failed', err); }
              }}>
                Filter
              </Button>
              <Button variant="text" size="small" onClick={() => { setFilterTypeId(null); setFilterStationId(null); getVehicles(); }}>
                Clear
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleOpenAdd}
                startIcon={<MdOutlineAddCircle />}
                size="small"
                sx={{
                  backgroundColor: "#2563eb",
                  "&:hover": { backgroundColor: "#1d4ed8" },
                  textTransform: "none",
                  borderRadius: "8px",
                  fontWeight: 500,
                  fontSize: "14px",
                  height: "40px",
                  width: "200px",
                }}
              >
                Thêm xe mới
              </Button>
              
            </div>
          </div>

          <AddVehicleModal
            isOpen={openAdd}
            onClose={handleCloseAdd}
            onVehicleAdded={handleVehicleAdded}
          />

          <div className="min-w-[600px] max-w-full">
            <DataGrid
              rows={rowsMapped}
              columns={columns}
              rowCount={totalElements}
              loading={loading}
              pageSizeOptions={[8, 16, 32]}
              paginationMode="server"
              pagination
              paginationModel={{
                page: pageNo,
                pageSize: pageSize,
              }}
              onPaginationModelChange={(model) => {
                setPageNo(model.page);
                setPageSize(model.pageSize);
              }}
              disableColumnFilter={false}
              disableColumnSelector={false}
              disableDensitySelector={false}
              autoHeight
            />
            <VehicleDetailModal open={detailOpen} id={detailId} onClose={() => setDetailOpen(false)} />
            <VehicleEditModal open={editOpen} id={editId} onClose={() => setEditOpen(false)} onUpdated={() => { getVehicles(); }} />
            <StationDetailModal open={stationDetailOpen} id={stationDetailId} onClose={() => setStationDetailOpen(false)} />
            <VehicleDetailModal open={detailOpen} id={detailId} onClose={() => setDetailOpen(false)} />
            
          </div>
        </CardContent>
      </Card>
    </Box>
  );
};
