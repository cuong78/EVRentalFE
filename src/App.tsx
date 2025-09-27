import './App.css'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { HashRouter, Route, Routes } from "react-router-dom";
import HomePage from "./pages/home/homePage";
import VerifyEmail from "./pages/auth/VerifyEmail";


function App() {
    return (
        <HashRouter>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
            </Routes>
            <ToastContainer />
        </HashRouter>
    )
}

export default App
