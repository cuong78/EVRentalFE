import { useState, useCallback } from 'react';
import { vehicleAdminService, type AdminVehicle } from '../service/vehicleAdminService';
import { showSuccessToast, showErrorToast } from '../utils/show-toast';

export function useVehicle() {
  const [vehicles, setVehicles] = useState<AdminVehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<AdminVehicle | null>(null);
  const [pageNo, setPageNo] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);

  const getVehicles = useCallback(async () => {
    try {
      setLoading(true);
  const response = await vehicleAdminService.getAllVehicles();
  // vehicleAdminService.getAllVehicles returns AdminVehicleResponse { statusCode, message, data: AdminVehicle[] }
  const items = response?.data ?? [];
  setVehicles(items);
  setTotalElements(items.length);
    } catch (error) {
      console.error('Failed to fetch vehicles:', error);
      showErrorToast('Failed to fetch vehicles');
    } finally {
      setLoading(false);
    }
  }, []);

  const getVehicleById = useCallback(async (id: number) => {
    try {
      const response = await vehicleAdminService.getVehicleById(id);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch vehicle ${id}:`, error);
      showErrorToast('Failed to fetch vehicle details');
      return null;
    }
  }, []);

  const addVehicle = useCallback(async (vehicleData: any) => {
    try {
      await vehicleAdminService.createVehicle(vehicleData);
      showSuccessToast('Vehicle added successfully');
      await getVehicles();
    } catch (error) {
      console.error('Failed to add vehicle:', error);
      showErrorToast('Failed to add vehicle');
    }
  }, [getVehicles]);

  const updateVehicle = useCallback(async (id: number, vehicleData: any) => {
    try {
      await vehicleAdminService.updateVehicle(id, vehicleData);
      showSuccessToast('Vehicle updated successfully');
      await getVehicles();
    } catch (error) {
      console.error('Failed to update vehicle:', error);
      showErrorToast('Failed to update vehicle');
    }
  }, [getVehicles]);

  const deleteVehicle = useCallback(async (id: number) => {
    try {
      await vehicleAdminService.deleteVehicle(id);
      showSuccessToast('Vehicle deleted successfully');
      await getVehicles();
    } catch (error) {
      console.error('Failed to delete vehicle:', error);
      showErrorToast('Failed to delete vehicle');
    }
  }, [getVehicles]);

  return {
    vehicles,
    setVehicles,
    loading,
    selectedVehicle,
    setSelectedVehicle,
    pageNo,
    setPageNo,
    pageSize,
    setPageSize,
    totalElements,
    setTotalElements,
    getVehicles,
    getVehicleById,
    addVehicle,
    updateVehicle,
    deleteVehicle,
  };
}

export type UseVehicleReturn = ReturnType<typeof useVehicle>;