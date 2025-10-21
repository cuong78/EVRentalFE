import './App.css'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HomePage from "./pages/home/homePage";
import VerifyEmail from "./pages/auth/VerifyEmail";
import AvailableVehicles from "./components/vehicle/AvailableVehiclesList";
import BookingPage from "./pages/booking/BookingPage";
import BookingConfirmation from "./pages/booking/BookingConfirmation";
import MyBookings from "./pages/booking/MyBookings";
import UserProfile from "./pages/profile/UserProfile";
import VNPayReturn from "./pages/payment/VNPayReturn";
import PaymentChecker from "./components/common/PaymentChecker";
import AuthChecker from "./components/auth/AuthChecker";
import { AuthDebugPanel } from "./components/debug/AuthDebugPanel";
import VNPayDebug from "./components/debug/VNPayDebug";
import LoginDebug from "./components/debug/LoginDebug";
import { BackendStatus } from "./components/common/BackendStatus";


function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route path="/booking" element={<BookingPage />} />
                <Route path="/booking/confirmation/:bookingId" element={<BookingConfirmation />} />
                <Route path="/my-bookings" element={<MyBookings />} />
                <Route path="/profile" element={<UserProfile />} />
                <Route path="/vehicles" element={<AvailableVehicles />} />
                <Route path="/payment/vnpay-return" element={<VNPayReturn />} />
            </Routes>
            <AuthChecker />
            <PaymentChecker />
            <ToastContainer />
            {/* Backend status indicator */}
            <BackendStatus />
            {/* Debug panels chỉ hiển thị trong development */}
            {import.meta.env.DEV && <AuthDebugPanel />}
            {import.meta.env.DEV && <VNPayDebug />}
            {import.meta.env.DEV && <LoginDebug />}
    </Router>
    )
}

export default App
