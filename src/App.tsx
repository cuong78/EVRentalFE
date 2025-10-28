import './App.css'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { HashRouter, Route, Routes } from "react-router-dom";
import HomeLayout from "./layouts/HomeLayout";
import HomeContent from "./pages/home/HomeContent";
import VerifyEmail from "./pages/auth/VerifyEmail";
import RentalPage from "./pages/rental/RentalPage";
import VehicleDetail from './pages/rental/VehicleDetail';
import BookingInvoice from './pages/booking/BookingInvoice';
import BookingDetail from './pages/booking/BookingDetail';
import UserProfile from './pages/profile/UserProfile';
import VNPayReturn from './pages/payment/VNPayReturn';
import StaffPortal from './pages/staff/StaffPortal';
import ContractPrint from './pages/contract/ContractPrint';
import WalletTopupReturn from './pages/payment/WalletTopupReturn';
import AdminPage from "./pages/admin/AdminPage";
import UnauthorizedPage from "./pages/auth/UnauthorizedPage";
// import { AuthDebugPanel } from "./components/debug/AuthDebugPanel";
import { BackendStatus } from "./components/common/BackendStatus";
import { AdminLayout } from './components/ui/admin/adminLayout';
import { ErrorPage } from './pages/error';
import { VehiclesManagementPage } from './pages/admin/vehiclesManagement/vehicles';
import VehicleTypesPage from './pages/admin/vehicleTypes/VehicleTypesPage';
import RentalStationsPage from './pages/admin/rentalStations/RentalStationsPage';
import DocumentManagementPage from './pages/admin/documents/DocumentManagementPage';
import QRGenerator from './pages/admin/QRGenerator';
import BookingManagementPage from './pages/admin/bookings/BookingManagementPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';


function App() {
    return (
        <HashRouter>
            <Routes>
                <Route path="*" element={<ErrorPage />} />
                <Route path="/unauthorized" element={<UnauthorizedPage />} />
                {/* <Route path="/authenticate" element={<Authenticate />} /> */}

                {/*home*/}
                <Route path="/" element={<HomeLayout />}>
                    <Route index element={<HomeContent />} />
                    <Route path="thue-xe" element={<RentalPage />} />
                    <Route path="thue-xe/:name" element={<VehicleDetail />} />
                    <Route path="hoa-don" element={<BookingInvoice />} />
                    <Route path="booking/:id" element={<BookingDetail />} />
                    <Route path="payment/vnpay-return" element={<VNPayReturn />} />
                    <Route path="wallet/vnpay-return" element={<WalletTopupReturn />} />
                    <Route path="staff" element={
                        <ProtectedRoute allowedRoles={['ADMIN', 'STAFF']}>
                            <StaffPortal />
                        </ProtectedRoute>
                    } />
                    <Route path="contracts/print/:bookingId" element={<ContractPrint />} />
                    <Route path="ho-so" element={<UserProfile />} />
                </Route>
                <Route path="/verify-email" element={<VerifyEmail />} />
                {/*admin*/}
                <Route path="/admin" element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                        <AdminLayout />
                    </ProtectedRoute>
                }>
                    <Route index element={<AdminPage />} />
                    <Route path="vehicles" element={<VehiclesManagementPage />} />
                    <Route path="vehicle-types" element={<VehicleTypesPage />} />
                    <Route path="rental-stations" element={<RentalStationsPage />} />
                    <Route path="bookings" element={<BookingManagementPage />} />
                    <Route path="documents" element={<DocumentManagementPage />} />
                    <Route path="qr-generator" element={<QRGenerator />} />
                </Route>
            </Routes>
            <ToastContainer />
            {/* Backend status indicator */}
            <BackendStatus />
            {/* Debug panel chỉ hiển thị trong development */}
            {/* {import.meta.env.DEV && <AuthDebugPanel />} */}
        </HashRouter>
    )
}

export default App
