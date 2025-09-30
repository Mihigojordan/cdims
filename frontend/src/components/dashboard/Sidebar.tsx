
import React, { useEffect, useState } from "react";
import {
  MapPin,
  Users,
  TrendingUp,
  User,
  X,
  Building,
  Briefcase,
  User2,
  Store,
  Package,
  Layers,
  Ruler,
  ChevronDown,
  ChevronUp,
  Boxes,
  MapMinusIcon,
  Truck, // Added for Stock Movement
  FileText, // Added for Issuable Request
  Archive, // Added for Issuable Materials
} from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import useAdminAuth from "../../context/AuthContext";
import Logo from '../../assets/hello.jpg';
import { formatRole } from "../../utils/dateUtils";

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
  allowedRoles?: string[];
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen = true, onToggle }) => {
  const { user } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  // Get user role
  const userRole = user?.role?.name;

  // Helper function to check if user has access to a nav item
  const hasAccess = (allowedRoles?: string[]): boolean => {
    if (!allowedRoles || allowedRoles.length === 0) return true;
    if (!userRole) return false;
    return allowedRoles.includes(userRole);
  };

  // Auto-open dropdowns based on current path
  useEffect(() => {
    const currentPath = location.pathname;
    const materialPages = [
      "/admin/dashboard/material-management",
      "/admin/dashboard/category-management",
      "/admin/dashboard/units-management",
    ];
    const sitePages = [
      "/admin/dashboard/site-assign-management",
      "/admin/dashboard/site-management",
    ];
    const reportPages = [
      "/admin/dashboard/request-report",
      "/admin/dashboard/inventory-report",
      "/admin/dashboard/stock-report",
      "/admin/dashboard/site-report",
      "/admin/dashboard/user-report"
    ];
    const stockPages = [
      "/admin/dashboard/stock-management",
      "/admin/dashboard/stock-history-management",
      "/admin/dashboard/stock-movement",
      "/admin/dashboard/issuable-requests",
      "/admin/dashboard/issuable-materials",
    ];

    if (materialPages.includes(currentPath)) {
      setOpenDropdown("materialManagement");
    } else if (sitePages.includes(currentPath)) {
      setOpenDropdown("siteManagement");
    } else if (stockPages.includes(currentPath)) {
      setOpenDropdown("stocks");
    }
     else if (reportPages.includes(currentPath)) {
      setOpenDropdown("reports");
    }  
    else {
      setOpenDropdown(null);
    }
  }, [location.pathname]);

  const toggleDropdown = (dropdownId: string) => {
    setOpenDropdown(openDropdown === dropdownId ? null : dropdownId);
  };

  const navlinks: NavItem[] = [
    {
      id: "dashboard",
      label: "Dashboard Overview",
      icon: TrendingUp,
      path: "/admin/dashboard",
    },
      {
      id: "userManagement",
      label: "User Management",
      icon: Users, // Changed to Users for clarity (multiple users)
      path: "/admin/dashboard/client-management",
      allowedRoles: ["PADIRI", "ADMIN"],
    },
    {
      id: "role",
      label: "Role Management",
      icon: User2,
      path: "/admin/dashboard/role-management",
      allowedRoles: ["ADMIN","PADIRI"],
    },
    {
      id: "stocks",
      label: "Stock Management",
      icon: Boxes,
      path: "/admin/dashboard/stock-management",
      allowedRoles: ["ADMIN", "STOREKEEPER","PADIRI"],
      isDropdown: true,
      children: [
        {
          id: "stocks-management",
          label: "Stock",
          icon: Boxes, // Kept Boxes for main stock management
          path: "/admin/dashboard/stock-management",
        },
        {
          id: "stocks-history",
          label: "Stock History",
          icon: Boxes, // Kept Boxes for main stock management
          path: "/admin/dashboard/stock-history-management",
        },
        {
          id: "stock-movement",
          label: "Stock Movement",
          icon: Truck, // Unique icon for stock movement (transport/movement)
          path: "/admin/dashboard/stock-movement",
        },
        {
          id: "issuable-requests",
          label: "Issuable Request",
          icon: FileText, // Unique icon for requests (document/request)
          path: "/admin/dashboard/issuable-requests",
        },
        {
          id: "issuable-materials",
          label: "Issuable Materials",
          icon: Archive, // Unique icon for issuable materials (storage/archive)
          path: "/admin/dashboard/issuable-materials",
        },
      ],
    },
    {
      id: "siteManagement",
      label: "Site Management",
      icon: Building, // Changed to Building for better context (site-related)
      isDropdown: true,
      allowedRoles: ["PADIRI", "ADMIN", "DIOCESAN_SITE_ENGINEER"],
      children: [
        {
          id: "sites",
          label: "Sites",
          icon: MapPin, // Kept MapPin for sites (location-specific)
          path: "/admin/dashboard/site-management",
          allowedRoles: ["PADIRI", "ADMIN", "DIOCESAN_SITE_ENGINEER"],
        },
        {
          id: "site-assign",
          label: "Site Assign",
          icon: MapMinusIcon, // Kept MapMinusIcon for site assignment
          path: "/admin/dashboard/site-assign-management",
          allowedRoles: ["PADIRI", "ADMIN", "DIOCESAN_SITE_ENGINEER"],
        },
      ],
    },
    {
      id: "stores",
      label: "Stores Management",
      icon: Store,
      path: "/admin/dashboard/store-management",
      allowedRoles: ["PADIRI","ADMIN", "STOREKEEPER"],
    },
  
    {
      id: "materialRequisition",
      label: "Material Requisition",
      icon: Briefcase, // Changed to Briefcase for requisition (work-related)
      path: "/admin/dashboard/material-requisition",
      allowedRoles: ["PADIRI", "ADMIN", "DIOCESAN_SITE_ENGINEER", "SITE_ENGINEER"],
    },
    {
      id: "materialManagement",
      label: "Material Management",
      icon: Package,
      isDropdown: true,
      allowedRoles: ["PADIRI", "ADMIN", "DIOCESAN_SITE_ENGINEER"],
      children: [
        {
          id: "materials",
          label: "Materials",
          icon: Package, // Kept Package for materials
          path: "/admin/dashboard/material-management",
          allowedRoles: ["PADIRI", "ADMIN", "DIOCESAN_SITE_ENGINEER"],
        },
        {
          id: "categories",
          label: "Categories",
          icon: Layers, // Kept Layers for categories
          path: "/admin/dashboard/category-management",
          allowedRoles: ["PADIRI", "ADMIN", "DIOCESAN_SITE_ENGINEER"],
        },
        {
          id: "units",
          label: "Units",
          icon: Ruler, // Kept Ruler for units
          path: "/admin/dashboard/units-management",
          allowedRoles: ["PADIRI", "ADMIN", "DIOCESAN_SITE_ENGINEER"],
        },
      ],
    },
    {
      id: "reports",
      label: "Reports",
      icon: FileText,
      isDropdown: true,
      children: [
        {
          id: "request-report",
          label: "Requests Report",
          icon: FileText,
          path: "/admin/dashboard/request-report",
          allowedRoles: ["PADIRI", "ADMIN", "DIOCESAN_SITE_ENGINEER"],
        },
        {
          id: "inventory-report",
          label: "Inventory Report",
          icon: FileText,
          path: "/admin/dashboard/inventory-report",
          allowedRoles: ["PADIRI", "ADMIN", "DIOCESAN_SITE_ENGINEER"],
        },
        {
          id: "stock-report",
          label: "Stock Movement Report",
          icon: FileText,
          path: "/admin/dashboard/stock-report",
          allowedRoles: ["PADIRI", "ADMIN", "DIOCESAN_SITE_ENGINEER"],
        },
        {
          id: "site-report",
          label: "Site Performance Report",
          icon: FileText,
          path: "/admin/dashboard/site-report",
          allowedRoles: ["PADIRI", "ADMIN", "DIOCESAN_SITE_ENGINEER"],
        },
        {
          id: "user-report",
          label: "User Activity Report",
          icon: FileText,
          path: "/admin/dashboard/user-report",
          allowedRoles: ["PADIRI", "ADMIN", "DIOCESAN_SITE_ENGINEER"],
        },
      ],
    },
  ];

  // Filter navigation items based on user role
  const filteredNavlinks = navlinks.filter(item => {
    if (!hasAccess(item.allowedRoles)) return false;
    
    // If it's a dropdown, filter its children too
    if (item.isDropdown && item.children) {
      const filteredChildren = item.children.filter(child => hasAccess(child.allowedRoles));
      // Only show dropdown if it has accessible children
      if (filteredChildren.length === 0) return false;
      // Update the item with filtered children
      item.children = filteredChildren;
    }
    
    return true;
  });

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
              <span className="text-sm font-light">{item.label}</span>
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
        <span className="text-sm font-light">{item.label}</span>
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
            <div className="flex items-center justify-center w-16 h-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg">
              <div className="flex items-center space-x-0.5">
                <img src={Logo} alt="CIDMS Logo" />
              </div>
            </div>
            <div>
              <h2 className="font-bold text-lg text-primary-800">CIDMS</h2>
              <p className="text-xs capitalize text-primary-500">{formatRole(user)?.toLowerCase() ?? 'dashboard'}</p>
              {/* <p className="text-xs text-primary-500">{user?.role?.name} Portal</p> */}
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
            {filteredNavlinks.length > 0 ? (
              filteredNavlinks.map(renderMenuItem)
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500 text-xs">No menu items available for your role</p>
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
                {user?.email || "admin@example.com"} ({userRole || "No Role"})
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
