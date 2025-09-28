import './App.css'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { HashRouter, Route, Routes } from "react-router-dom";
import HomePage from "./pages/home/homePage";
import VerifyEmail from "./pages/auth/VerifyEmail";
import { AuthDebugPanel } from "./components/debug/AuthDebugPanel";
import { BackendStatus } from "./components/common/BackendStatus";


function App() {
    return (
        <HashRouter>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
            </Routes>
            <ToastContainer />
            {/* Backend status indicator */}
            <BackendStatus />
            {/* Debug panel chỉ hiển thị trong development */}
            {import.meta.env.DEV && <AuthDebugPanel />}
        </HashRouter>
    )
}

export default App
