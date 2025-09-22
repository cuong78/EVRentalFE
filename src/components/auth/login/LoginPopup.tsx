import React from "react";
import { IoMdClose } from "react-icons/io";

interface LoginPopupProps {
    open: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

const LoginPopup = ({ open, onClose, children }: LoginPopupProps) => {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="relative bg-[#18181b] rounded-xl shadow-2xl w-full max-w-md mx-auto p-0">
                <button className="absolute top-3 right-3 text-gray-400 hover:text-white" onClick={onClose}>
                    <IoMdClose size={24} />
                </button>
                <div className="p-0">{children}</div>
            </div>
        </div>
    );
};

export default LoginPopup;
