import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Navigation } from "../navigation";
import { AdminHeader } from "../header";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Menu } from "lucide-react";

export const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const sidebarWidth = collapsed ? 80 : 260;

  return (
      <div className="flex min-h-screen bg-[#f3f4f6]">
        
        {/* Sidebar */}
        <aside
          className="fixed top-0 left-0 h-screen bg-white shadow-lg z-30 border-r border-gray-200 transition-all duration-300"
          style={{
            width: `${sidebarWidth}px`,
          }}
        >
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 w-full">
            <span className="text-lg font-semibold text-gray-700 whitespace-nowrap">
              {collapsed ? "EVR" : "EVRental Admin"}
            </span>
            <button
              onClick={() => setCollapsed(prev => !prev)}
              className="p-2 rounded-lg hover:bg-gray-100 transition"
            >
              {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            </button>
          </div>

          <Navigation collapsed={collapsed} />
        </aside>

        {/* Main */}
        <div
          className="flex flex-col min-h-screen transition-all duration-300"
          style={{
            marginLeft: `${sidebarWidth}px`,
            width: `calc(100% - ${sidebarWidth}px)`,
          }}
        >
          {/* Header */}
          <header className="sticky top-0 z-20 bg-white border-b border-gray-200 p-3 flex items-center justify-between shadow-sm">
            {/* <div className="flex items-center gap-3">
              <button
                onClick={() => setCollapsed(prev => !prev)}
                className="p-2 rounded-lg hover:bg-gray-100 transition"
              >
                <Menu size={20} />
              </button>
              <h1 className="text-xl font-semibold text-gray-700">Dashboard</h1>
              </div> */}
            <AdminHeader />
          </header>

          {/* Content */}
          <main className="p-6 overflow-y-auto flex-1">
            <div className="max-w-7xl mx-auto">
              {/* <AnimatePresence mode="wait">
                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="bg-white shadow rounded-2xl p-6"
                > */}
                  <Outlet />
                {/* </motion.div>
              </AnimatePresence> */}
            </div>
          </main>
        </div>
      </div>
  );
};
