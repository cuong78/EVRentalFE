// import { useState, useEffect } from 'react';
// import { showSuccessToast, showErrorToast } from '../../../../utils/show-toast';
// import { vehicleAdminService } from '../../../../service/vehicleAdminService';
// import type { CreateVehicleRequest } from '../../../../service/vehicleAdminService';
// // import { stationService, type Station } from '../../../../../types/rentalStation';

// export default function AddVehicleModal({ isOpen, onClose, onVehicleAdded }: AddVehicleModalProps) {
//   const [stations, setStations] = useState<Station[]>([]);
//   const [vehicleTypes, setVehicleTypes] = useState<any[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [formData, setFormData] = useState<CreateVehicleRequest>({
//     typeId: 0,
//     stationId: 0,
//     status: 'AVAILABLE',
//     conditionNotes: '',
//     photos: []
//   });

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const [stationsResponse, typesResponse] = await Promise.all([
//           stationService.getAllStations(),
//           vehicleAdminService.getVehicleTypes()
//         ]);

//         setStations(stationsResponse.data);
//         setVehicleTypes(typesResponse.data);
//       } catch (error) {
//         console.error('Failed to fetch data:', error);
//         showErrorToast('Error fetching form data');
//       }
//     };

//     if (isOpen) {
//       fetchData();
//     }
//   }, [isOpen]);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({
//       ...prev,
//       [name]: name === 'typeId' || name === 'stationId' ? parseInt(value) : value
//     }));
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);

//     try {
//       await vehicleAdminService.createVehicle(formData);
//       showToast('Vehicle added successfully', 'success');
//       onVehicleAdded();
//       onClose();
//     } catch (error) {
//       console.error('Failed to create vehicle:', error);
//       showToast('Failed to create vehicle', 'error');
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (!isOpen) return null;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
//         <h2 className="text-2xl font-bold mb-4">Add New Vehicle</h2>
        
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <label className="block mb-1">Vehicle Type</label>
//             <select
//               name="typeId"
//               value={formData.typeId}
//               onChange={handleChange}
//               className="w-full border rounded p-2"
//               required
//             >
//               <option value="">Select a type</option>
//               {vehicleTypes.map(type => (
//                 <option key={type.id} value={type.id}>
//                   {type.name} - Rate: ${type.rentalRate}/day
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div>
//             <label className="block mb-1">Station</label>
//             <select
//               name="stationId"
//               value={formData.stationId}
//               onChange={handleChange}
//               className="w-full border rounded p-2"
//               required
//             >
//               <option value="">Select a station</option>
//               {stations.map(station => (
//                 <option key={station.id} value={station.id}>
//                   {station.city} - {station.address}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div>
//             <label className="block mb-1">Status</label>
//             <select
//               name="status"
//               value={formData.status}
//               onChange={handleChange}
//               className="w-full border rounded p-2"
//               required
//             >
//               <option value="AVAILABLE">Available</option>
//               <option value="MAINTENANCE">Maintenance</option>
//               <option value="RENTED">Rented</option>
//             </select>
//           </div>

//           <div>
//             <label className="block mb-1">Condition Notes</label>
//             <textarea
//               name="conditionNotes"
//               value={formData.conditionNotes}
//               onChange={handleChange}
//               className="w-full border rounded p-2"
//               rows={4}
//               required
//             />
//           </div>

//           <div>
//             <label className="block mb-1">Photos (URLs, one per line)</label>
//             <textarea
//               name="photos"
//               value={formData.photos.join('\n')}
//               onChange={(e) => setFormData(prev => ({
//                 ...prev,
//                 photos: e.target.value.split('\n').filter(url => url.trim() !== '')
//               }))}
//               className="w-full border rounded p-2"
//               rows={3}
//               placeholder="Enter photo URLs, one per line"
//             />
//           </div>

//           <div className="flex justify-end space-x-4 mt-6">
//             <button
//               type="button"
//               onClick={onClose}
//               className="px-4 py-2 border rounded hover:bg-gray-100"
//               disabled={loading}
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
//               disabled={loading}
//             >
//               {loading ? 'Adding...' : 'Add Vehicle'}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }