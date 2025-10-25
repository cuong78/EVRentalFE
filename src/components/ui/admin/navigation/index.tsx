import { MdOutlineCarRental, MdOutlinePlace, MdCategory } from "react-icons/md";
import { FaUsersCog, FaTicketAlt, FaUserCircle, FaMoneyBillWave, FaFileContract, FaUndoAlt } from "react-icons/fa";
import { ImHome } from "react-icons/im";
import { Link } from "react-router-dom";
import { useAuth } from "../../../../hooks/useAuth";

type NavigationProps = {
  collapsed?: boolean;
};

export const Navigation = ({ collapsed = false }: NavigationProps) => {
  const { isAdmin, isManager, isEmployee } = useAuth();

  const navItems = [
    // Trang Chính
    { label: "Trang Chủ", href: "/admin", icon: <ImHome /> },

    // Quản Lý Người Dùng
    { label: "Quản Lý Tài Khoản", href: "/admin/accounts", icon: <FaUsersCog /> },

    // Quản Lý Xe và Điểm Thuê Xe
    { label: "Quản Lý Xe", href: "/admin/vehicles", icon: <MdOutlineCarRental /> },
    { label: "Quản Lý Điểm Thuê Xe", href: "/admin/rental-stations", icon: <MdOutlinePlace /> },
    { label: "Quản Lý Loại Xe", href: "/admin/vehicle-types", icon: <MdCategory /> },

    // Quản Lý Thuê Xe & Thanh Toán
    { label: "Quản Lý Thuê Xe", href: "/admin/booking", icon: <FaTicketAlt /> },
    { label: "Quản Lý Hồ Sơ Khách Hàng", href: "/admin/documents", icon: <FaUserCircle /> },
    { label: "Quản Lý Thanh Toán", href: "/admin/payment-management", icon: <FaMoneyBillWave /> },
    { label: "Quản Lý Hợp Đồng", href: "/admin/contract", icon: <FaFileContract /> },
    { label: "Quản Lý Hoàn Trả", href: "/admin/return-transaction", icon: <FaUndoAlt /> },

  ];

  return (
    <nav className={`flex flex-col h-full ${collapsed ? "items-center" : "items-start"} p-4`}>
      <ul className="space-y-2 w-full">
        {navItems.filter((item: any) => !item.hidden).map((item, idx) => (
          <li key={idx}>
            <Link
              to={item.href}
              className={`flex items-center ${collapsed ? "justify-center" : "justify-start"} gap-2 p-2 rounded hover:bg-gray-100 font-semibold transition`}
            >
              <span className="text-lg">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};
