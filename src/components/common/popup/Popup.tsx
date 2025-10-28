import React from "react";
import { IoMdClose } from "react-icons/io";

interface PopupProps {
    open: boolean;
    onClose: () => void;
    title?: string;
    children?: React.ReactNode;
}

const Popup = ({ open, onClose, title, children }: PopupProps) => {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl mx-auto">
                <div className="flex items-center justify-between p-4 border-b">
                    {title && <h2 className="text-lg font-semibold text-gray-900">{title}</h2>}
                    <button className="text-gray-400 hover:text-gray-600" onClick={onClose}>
                        <IoMdClose size={24} />
                    </button>
                </div>
                <div className="p-0">{children}</div>
            </div>
        </div>
    );
};

export default Popup;