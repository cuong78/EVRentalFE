
interface CustomToastProps {
    message: string;
    type: "success" | "error" | "info" | "warning";
}

export const CustomToast: React.FC<CustomToastProps> = ({ message, type }) => {
    const bgColor = type === "success" ? "bg-green-100" : "bg-red-100";
    const textColor = type === "success" ? "text-green-800" : "text-red-800";
    const icon = type === "success" ? "✅" : "❌";

    return (
        <div className={`p-3 rounded shadow-md ${bgColor} ${textColor} flex gap-2`}>
            <span>{icon}</span>
            <span>{message}</span>
        </div>
    );
};
