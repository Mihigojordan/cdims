import {
  Bell,
  LogOut,
  Menu,
  Settings,
  User,
  ChevronDown,
  Mail,
  MessageSquare,
  StickyNote,
  Maximize,
  Minimize,
  Grid3X3,
  CheckSquare,
  Kanban,
  FileText,
  FolderOpen,
  Calculator,
} from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuth ,{ type AuthContextType } from '../../context/AuthContext';

import "flag-icons/css/flag-icons.min.css"; // Import flag-icons CSS

interface HeaderProps {
  onToggle: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggle }) => {
  const { user, logout } = useAuth() as AuthContextType;

  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState<boolean>(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [selectedLanguage, setSelectedLanguage] = useState("en");

  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const languageRef = useRef<HTMLDivElement | null>(null);
  const dashboardRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  const languages = [
    { code: "en", name: "English", flag: "us" },
    { code: "es", name: "Español", flag: "es" },
    { code: "fr", name: "Français", flag: "fr" },
    { code: "zh", name: "中文", flag: "cn" },
  ];

  const dashboardApps = [
    { name: "Todo", icon: CheckSquare, color: "bg-blue-500", path: "/admin/dashboard/todo" },
    { name: "Kanban", icon: Kanban, color: "bg-purple-500", path: "/admin/dashboard/kanban" },
    { name: "Notes", icon: StickyNote, color: "bg-yellow-500", path: "/admin/dashboard/notes" },
    { name: "Invoice", icon: FileText, color: "bg-green-500", path: "/admin/dashboard/invoice" },
    { name: "Files", icon: FolderOpen, color: "bg-orange-500", path: "/admin/dashboard/files" },
    { name: "Calculator", icon: Calculator, color: "bg-red-500", path: "/admin/dashboard/calculator" },
  ];

  const onLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error(error);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const getDisplayName = (): string => {
    return user?.full_name || "User";
  };

  const handleLanguageSelect = (langCode: string) => {
    setSelectedLanguage(langCode);
    setIsLanguageOpen(false);
    // Add your language change logic here
  };

  const handleAppClick = (path: string) => {
    navigate(path);
    setIsDashboardOpen(false);
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
      if (languageRef.current && !languageRef.current.contains(event.target as Node)) {
        setIsLanguageOpen(false);
      }
      if (dashboardRef.current && !dashboardRef.current.contains(event.target as Node)) {
        setIsDashboardOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // Close dropdowns on Escape key
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsDropdownOpen(false);
        setIsLanguageOpen(false);
        setIsDashboardOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscapeKey);
    return () => {
      document.removeEventListener("keydown", handleEscapeKey);
    };
  }, []);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-8 py-3">
        <div className="flex items-center justify-between">
          {/* Left Section */}
          <div className="flex items-center space-x-3">
            <div
              className="w-7 h-7 bg-primary-600 rounded-lg lg:hidden flex items-center justify-center cursor-pointer hover:bg-primary-700 transition-colors"
              onClick={onToggle}
            >
              <Menu className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-lg font-semibold text-gray-900 hidden sm:block">
              Welcome To CDIMS
            </h1>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-2">
            {/* Language Selector */}
            <div className="relative" ref={languageRef}>
              <button
                onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors flex items-center space-x-1"
              >
                <span className={`fi fi-${languages.find(lang => lang.code === selectedLanguage)?.flag} mr-1 text-lg`}></span>
                <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isLanguageOpen ? "rotate-180" : ""}`} />
              </button>

              {isLanguageOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                  <div className="py-1">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => handleLanguageSelect(lang.code)}
                        className={`flex items-center w-full px-3 py-2 text-sm hover:bg-primary-50 transition-colors ${
                          selectedLanguage === lang.code ? "bg-primary-50 text-primary-600" : "text-gray-700"
                        }`}
                      >
                        <span className={`fi fi-${lang.flag} mr-2`}></span>
                        {lang.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

          

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {isFullscreen ? (
                <Minimize className="w-4 h-4" />
              ) : (
                <Maximize className="w-4 h-4" />
              )}
            </button>

            {/* Settings */}
            <button className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <Settings className="w-4 h-4" />
            </button>

            {/* User Profile Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center space-x-2 p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="w-7 h-7 bg-primary-100 rounded-full flex items-center justify-center overflow-hidden">
                  <User className="w-4 h-4 text-primary-600" />
                </div>
                <div className="text-left hidden md:block">
                  <div className="text-xs font-medium text-gray-700">
                    {getDisplayName()}
                  </div>
                </div>
                <ChevronDown
                  className={`w-3 h-3 text-gray-500 transition-transform duration-200 hidden md:block ${
                    isDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                  <div className="py-1">
                    {/* User Info Header */}
                    <div className="px-3 py-2 border-b border-gray-100 bg-primary-50">
                      <div className="text-sm font-medium text-gray-900">
                        {getDisplayName()}
                      </div>
                      <div className="text-xs text-gray-600">
                        {user?.email}
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-1">
                      <button
                        onClick={() => {
                          navigate("/admin/dashboard/profile");
                          setIsDropdownOpen(false);
                        }}
                        className="flex items-center w-full px-3 py-2 text-sm text-gray-700 hover:bg-primary-50 transition-colors"
                      >
                        <User className="w-4 h-4 mr-2" />
                        My Profile
                      </button>

                      <div className="border-t border-gray-100 my-1"></div>

                      <button
                        onClick={() => {
                          onLogout();
                          setIsDropdownOpen(false);
                        }}
                        className="flex items-center w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;