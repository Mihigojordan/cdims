import React from "react";
import {
  MapPin,
  Plane,
  Users,
  TrendingUp,
  User,
  X,
  Building,
  Briefcase,
  User2,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

import useAdminAuth from "../../context/AuthContext";

interface SidebarProps {
  isOpen?: boolean;
  onToggle: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  path: string;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen = true, onToggle }) => {
  const { user } = useAdminAuth();
  const navigate = useNavigate();

  const navlinks: NavItem[] = [
    {
      id: "",
      label: "Dashboard",
      icon: TrendingUp,
      path: "/admin/dashboard",
    },
    {
      id: "departments",
      label: "Departments Management",
      icon: Building,
      path: "/admin/dashboard/department-management",
    },
    {
      id: "recruiting",
      label: "Recruiting Management",
      icon: Briefcase,
      path: "/admin/dashboard/recruiting-management",
    },
    {
      id: "employees",
      label: "Employees Management",
      icon: Users,
      path: "/admin/dashboard/employee-management",
    },
    {
      id: "clients",
      label: "Clients Management",
      icon: User2,
      path: "/admin/dashboard/client-management",
    },
  ];

  const getProfileRoute = () => "/admin/dashboard/profile";

  const handleNavigateProfile = () => {
    const route = getProfileRoute();
    if (route) navigate(route, { replace: true });
  };

  const renderMenuItem = (item: NavItem) => {
    const Icon = item.icon;

    return (
      <NavLink
        key={item.id}
        to={item.path}
        end
        className={({ isActive }) =>
          `w-full flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 group ${
            isActive
              ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white"
              : "text-black hover:bg-primary-50"
          }`
        }
        onClick={() => {
          if (window.innerWidth < 1024) onToggle();
        }}
      >
        <Icon className="w-4 h-4" />
        <span className="text-xs font-medium">{item.label}</span>
      </NavLink>
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar Container */}
      <div
        className={`fixed left-0 top-0 min-h-screen bg-white flex flex-col border-r border-primary-200 shadow-lg transform transition-transform duration-300 z-50 lg:relative lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } w-70`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-primary-200">
          <div className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg">
              <div className="flex items-center space-x-0.5">
                <MapPin className="w-3 h-3 text-white" />
                <Plane className="w-2 h-2 text-white" />
              </div>
            </div>
            <div>
              <h2 className="font-bold text-lg text-primary-800">
                Aby Hr Management
              </h2>
              <p className="text-xs text-primary-500">Admin Portal</p>
            </div>
          </div>
          <button
            onClick={onToggle}
            className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 overflow-y-auto p-3">
          <nav className="space-y-1">
            {navlinks.length > 0 ? (
              navlinks.map(renderMenuItem)
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500 text-xs">No menu items available</p>
              </div>
            )}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div
          className="p-3 border-t border-primary-200 cursor-pointer"
          onClick={handleNavigateProfile}
        >
          <div className="flex items-center space-x-2 p-2 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-primary-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-normal text-gray-900 truncate">
                {user?.adminName || "Admin User"}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.adminEmail || "admin@example.com"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;