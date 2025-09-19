
import React, { useEffect, useState } from "react";
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
  Store,
  Hotel,
  Package,
  Layers,
  Ruler,
  ChevronDown,
  ChevronUp,
  Boxes,
} from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import useAdminAuth from "../../context/AuthContext";

interface SidebarProps {
  isOpen?: boolean;
  onToggle: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  path?: string;
  isDropdown?: boolean;
  children?: NavItem[];
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen = true, onToggle }) => {
  const { user } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Auto-open dropdowns based on current path
  useEffect(() => {
    const currentPath = location.pathname;
    const materialPages = [
      "/admin/dashboard/material-management",
      "/admin/dashboard/category-management",
      "/admin/dashboard/units-management",
    ];

    if (materialPages.includes(currentPath)) {
      setOpenDropdown("materialManagement");
    } else {
      setOpenDropdown(null);
    }
  }, [location.pathname]);

  const toggleDropdown = (dropdownId: string) => {
    setOpenDropdown(openDropdown === dropdownId ? null : dropdownId);
  };

  const navlinks: NavItem[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: TrendingUp,
      path: "/admin/dashboard",
    },
    {
      id: "role",
      label: "Role Management",
      icon: User2,
      path: "/admin/dashboard/role-management",
    },
    {
      id: "stocks",
      label: "Stock Management",
      icon: Boxes,
      path: "/admin/dashboard/stock-management",
    },
    {
      id: "sites",
      label: "Sites Management",
      icon: MapPin,
      path: "/admin/dashboard/site-management",
    },
    {
      id: "site-assign",
      label: "Site Assign Management",
      icon: MapPin,
      path: "/admin/dashboard/site-assign-management",
    },
    {
      id: "stores",
      label: "Stores Management",
      icon: Store,
      path: "/admin/dashboard/store-management",
    },
    {
      id: "userManagement",
      label: "User Management",
      icon: User2,
      path: "/admin/dashboard/client-management",
    },
    {
      id: "Material Requisition ",
      label: "Material Requisition",
      icon: User2,
      path: "/admin/dashboard/material-requisition",
    },
    {
      id: "materialManagement",
      label: "Material Management",
      icon: Package,
      isDropdown: true,
      children: [
        {
          id: "materials",
          label: "Materials",
          icon: Package,
          path: "/admin/dashboard/material-management",
        },
        {
          id: "categories",
          label: "Categories",
          icon: Layers,
          path: "/admin/dashboard/category-management",
        },
        {
          id: "units",
          label: "Units",
          icon: Ruler,
          path: "/admin/dashboard/units-management",
        },
      ],
    },
  ];

  const getProfileRoute = () => "/admin/dashboard/profile";

  const handleNavigateProfile = () => {
    const route = getProfileRoute();
    if (route) navigate(route, { replace: true });
  };

  const renderMenuItem = (item: NavItem) => {
    const Icon = item.icon;
    const isActive = item.path ? location.pathname === item.path : false;

    if (item.isDropdown) {
      const isOpen = openDropdown === item.id;
      const hasActiveChild = item.children?.some(
        (child) => child.path && location.pathname === child.path
      );

      return (
        <div key={item.id} className="space-y-1">
          <button
            onClick={() => toggleDropdown(item.id)}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-all duration-200 group ${
              hasActiveChild
                ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white"
                : "text-black hover:bg-primary-50"
            }`}
          >
            <div className="flex items-center space-x-2">
              <Icon
                className={`w-4 h-4 ${
                  hasActiveChild ? "text-white" : "text-gray-600 group-hover:text-primary-600"
                }`}
              />
              <span className="text-xs font-medium">{item.label}</span>
            </div>
            <div className="transition-transform duration-200">
              {isOpen ? (
                <ChevronUp
                  className={`w-4 h-4 ${
                    hasActiveChild ? "text-white" : "text-gray-600 group-hover:text-primary-600"
                  }`}
                />
              ) : (
                <ChevronDown
                  className={`w-4 h-4 ${
                    hasActiveChild ? "text-white" : "text-gray-600 group-hover:text-primary-600"
                  }`}
                />
              )}
            </div>
          </button>
          {isOpen && (
            <div className="space-y-1 ml-4">
              {item.children?.map((child) => (
                <NavLink
                  key={child.id}
                  to={child.path!}
                  end
                  className={({ isActive }) =>
                    `flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                      isActive
                        ? "bg-primary-50 text-primary-700"
                        : "text-gray-600 hover:bg-primary-50 hover:text-primary-700"
                    }`
                  }
                  onClick={() => {
                    if (window.innerWidth < 1024) onToggle();
                  }}
                >
                  <child.icon className="w-4 h-4" />
                  <span className="text-xs">{child.label}</span>
                </NavLink>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <NavLink
        key={item.id}
        to={item.path!}
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
        <Icon
          className={`w-4 h-4 ${isActive ? "text-white" : "text-gray-600 group-hover:text-primary-600"}`}
        />
        <span className="text-sm  font-light">{item.label}</span>
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
        } w-64 lg:w-70`}
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
                CIDMS 
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
                {user?.full_name || "Admin User"}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.email || "admin@example.com"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;