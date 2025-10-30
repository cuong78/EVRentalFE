import './App.css'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { HashRouter, Route, Routes } from "react-router-dom";
import HomeLayout from "./layouts/HomeLayout";
import HomeContent from "./pages/home/HomeContent";
import VerifyEmail from "./pages/auth/VerifyEmail";
import RentalPage from "./pages/rental/RentalPage";
import AdminPage from "./pages/admin/AdminPage";
import UnauthorizedPage from "./pages/auth/UnauthorizedPage";
// import { AuthDebugPanel } from "./components/debug/AuthDebugPanel";
import { BackendStatus } from "./components/common/BackendStatus";
import { AdminLayout } from './components/ui/admin/adminLayout';
import { ErrorPage } from './pages/error';
import { VehiclesManagementPage } from './pages/admin/vehiclesManagement/vehicles';
import VehicleTypesPage from './pages/admin/vehicleTypes/VehicleTypesPage';
import RentalStationsPage from './pages/admin/rentalStations/RentalStationsPage';
import AccountsManagementPage from './pages/admin/accounts/AccountsManagementPage';

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
                </Route>
                <Route path="/verify-email" element={<VerifyEmail />} />
                {/*admin*/}
                <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<AdminPage />} />
                    <Route path="vehicles" element={<VehiclesManagementPage />} />
                    <Route path="vehicle-types" element={<VehicleTypesPage />} />
                    <Route path="rental-stations" element={<RentalStationsPage />} />
                    <Route path="accounts" element={<AccountsManagementPage />} />
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
