import React, { useState, useEffect } from 'react';
import {
  Users,
  Calendar,
  Clock,
  TrendingUp,
  Bell,
  Settings,
  Search,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Building2,
  Package,
  MapPin,
  AlertTriangle,
  Box,
  Map,
} from 'lucide-react';
import materialService, { type Material } from '../../services/materialsService';
import requisitionService, { type MaterialRequisition } from '../../services/requestService';
import siteService, { type Site } from '../../services/siteService';
import siteAssignmentService, { type SiteAssignment } from '../../services/siteAssignmentService';
import stockService, { type Stock } from '../../services/stockService';
import storeService, { type Store } from '../../services/storeService';
import userService, { type User } from '../../services/userService';
import useAuth from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

// --- Type Definitions ---
interface DashboardData {
  materials: Material[];
  recentRequisitions: MaterialRequisition[];
  lowStockAlerts: Stock[];
  recentSiteAssignments: SiteAssignment[];
  sites: Site[];
  stores: Store[];
  users: User[];
  stats: {
    totalMaterials: number;
    pendingRequisitions: number;
    totalSites: number;
    lowStockAlerts: number;
    totalStores: number;
    activeUsers: number;
  };
}

interface StatCard {
  label: string;
  value: string | number;
  change: string;
  icon: React.FC<any>;
  color: string;
  trend: 'up' | 'down';
  allowedRoles: string[];
}

// --- Component ---
const DashboardHome: React.FC = () => {
  const { user } = useAuth();
  const userRole = user?.role?.name;
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    materials: [],
    recentRequisitions: [],
    lowStockAlerts: [],
    recentSiteAssignments: [],
    sites: [],
    stores: [],
    users: [],
    stats: {
      totalMaterials: 0,
      pendingRequisitions: 0,
      totalSites: 0,
      lowStockAlerts: 0,
      totalStores: 0,
      activeUsers: 0,
    },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Helper function to check if user has access to a section or stat
  const hasAccess = (allowedRoles: string[]): boolean => {
    if (!allowedRoles || allowedRoles.length === 0) return true;
    if (!userRole) return false;
    return allowedRoles.includes(userRole);
  };

  // Define stats cards with role-based permissions
  const allStatsCards: StatCard[] = [
    {
      label: 'Total Materials',
      value: dashboardData.stats.totalMaterials,
      change: '+3.5%',
      icon: Box,
      color: 'bg-primary-500',
      trend: 'up',
      allowedRoles: ['PADIRI', 'ADMIN', 'DIOCESAN_SITE_ENGINEER'],
    },
    {
      label: 'Pending Requisitions',
      value: dashboardData.stats.pendingRequisitions,
      change: '-10%',
      icon: Clock,
      color: 'bg-primary-500',
      trend: 'down',
      allowedRoles: ['PADIRI', 'ADMIN', 'DIOCESAN_SITE_ENGINEER', 'SITE_ENGINEER'],
    },
    {
      label: 'Total Sites',
      value: dashboardData.stats.totalSites,
      change: '+5%',
      icon: MapPin,
      color: 'bg-primary-500',
      trend: 'up',
      allowedRoles: ['PADIRI', 'ADMIN', 'DIOCESAN_SITE_ENGINEER'],
    },
    {
      label: 'Low Stock Alerts',
      value: dashboardData.stats.lowStockAlerts,
      change: '+15%',
      icon: AlertTriangle,
      color: 'bg-primary-500',
      trend: 'up',
      allowedRoles: ['PADIRI', 'ADMIN', 'STOREKEEPER'],
    },
  ];

  // Filter stats cards based on user role
  const statsCards = allStatsCards.filter(stat => hasAccess(stat.allowedRoles));

  // Define section visibility based on roles
  const sectionVisibility = {
    recentRequisitions: hasAccess(['PADIRI', 'ADMIN', 'DIOCESAN_SITE_ENGINEER', 'SITE_ENGINEER']),
    lowStockAlerts: hasAccess(['PADIRI', 'ADMIN', 'STOREKEEPER']),
    storesOverview: hasAccess(['PADIRI', 'ADMIN', 'STOREKEEPER']),
    recentSiteAssignments: hasAccess(['PADIRI', 'ADMIN', 'DIOCESAN_SITE_ENGINEER']),
  };

  // Count visible sections for main and bottom grids
  const mainSectionCount = [sectionVisibility.recentRequisitions, sectionVisibility.lowStockAlerts].filter(Boolean).length;
  const bottomSectionCount = [sectionVisibility.storesOverview, sectionVisibility.recentSiteAssignments].filter(Boolean).length;

  // Fetch data based on role permissions
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Initialize promises array for concurrent fetching
        const promises: Promise<any>[] = [];

        // Conditionally fetch data based on role permissions
        if (hasAccess(['PADIRI', 'ADMIN', 'DIOCESAN_SITE_ENGINEER'])) {
          promises.push(materialService.getAllMaterials());
          promises.push(siteService.getAllSites());
        } else {
          promises.push(Promise.resolve([])); // Placeholder for materials
          promises.push(Promise.resolve({ sites: [] })); // Placeholder for sites
        }

        if (hasAccess(['PADIRI', 'ADMIN', 'DIOCESAN_SITE_ENGINEER', 'SITE_ENGINEER'])) {
          promises.push(
            userRole === 'SITE_ENGINEER'
              ? requisitionService.getAllMyRequisitions()
              : requisitionService.getAllRequisitions()
          );
        } else {
          promises.push(Promise.resolve({ data: { requests: [] } })); // Placeholder for requisitions
        }

        if (hasAccess(['PADIRI', 'ADMIN', 'STOREKEEPER'])) {
          promises.push(stockService.getLowStockAlerts());
          promises.push(storeService.getAllStores());
        } else {
          promises.push(Promise.resolve({ lowStockItems: [] })); // Placeholder for low stock
          promises.push(Promise.resolve({ stores: [] })); // Placeholder for stores
        }

        if (hasAccess(['PADIRI', 'ADMIN', 'DIOCESAN_SITE_ENGINEER'])) {
          promises.push(siteAssignmentService.getAllSiteAssignments({ limit: 3 }));
        } else {
          promises.push(Promise.resolve({ assignments: [] })); // Placeholder for site assignments
        }

        if (hasAccess(['PADIRI', 'ADMIN'])) {
          promises.push(userService.getAllUsers()); // Fetch users for active users stat
        } else {
          promises.push(Promise.resolve({ data: { users: [] } })); // Placeholder for users
        }

        // Execute all promises
        const [
          materialsResponse,
          sitesResponse,
          requisitionsResponse,
          lowStockResponse,
          storesResponse,
          siteAssignmentsResponse,
          usersResponse,
        ] = await Promise.all(promises);

        // Process data
        const materials = materialsResponse || [];
        const sites = sitesResponse?.sites || [];
        const recentRequisitions = requisitionsResponse?.data?.requests?.slice(0, 3) || [];
        const lowStockAlerts = lowStockResponse?.lowStockItems || [];
        const stores = storesResponse?.stores || [];
        const recentSiteAssignments = siteAssignmentsResponse?.assignments || [];
        const users = usersResponse?.data?.users || [];

        setDashboardData({
          materials,
          recentRequisitions,
          lowStockAlerts,
          recentSiteAssignments,
          sites,
          stores,
          users,
          stats: {
            totalMaterials: materials.length,
            pendingRequisitions: recentRequisitions.filter(req => req.status === 'PENDING' || req.status === 'DRAFT').length,
            totalSites: sites.length,
            lowStockAlerts: lowStockAlerts.length,
            totalStores: stores.length,
            activeUsers: users.filter(user => user.active).length,
          },
        });
      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userRole]);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-5 h-5 text-primary-500 animate-spin" />
          <span className="text-base text-gray-600">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-red-600 text-base">{error}</div>
      </div>
    );
  }

  // Check if user has access to any section
  const hasAnyContent =
    statsCards.length > 0 ||
    sectionVisibility.recentRequisitions ||
    sectionVisibility.lowStockAlerts ||
    sectionVisibility.storesOverview ||
    sectionVisibility.recentSiteAssignments;

  if (!hasAnyContent) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-gray-600 text-base">No dashboard content available for your role.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Inventory Dashboard</h1>
              <p className="text-sm text-gray-600 mt-1">Overview of materials, requisitions, and sites.</p>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <Search className="w-4 h-4" />
              </button>
              {sectionVisibility.lowStockAlerts && (
                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors relative">
                  <Bell className="w-4 h-4" />
                  {dashboardData.stats.lowStockAlerts > 0 && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                </button>
              )}
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Stats Grid */}
        {statsCards.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-6">
            {statsCards.map((stat, index) => (
              <div
                key={index}
                className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300 w-full"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
                    <p className="text-xl font-semibold text-gray-900 mt-2">{stat.value}</p>
                    <div className="flex items-center mt-2">
                      {stat.trend === 'up' ? (
                        <ArrowUpRight className="w-4 h-4 text-green-500" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-red-500" />
                      )}
                      <span
                        className={`text-sm font-medium ml-1 ${
                          stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {stat.change}
                      </span>
                      <span className="text-sm text-gray-500 ml-2">vs last month</span>
                    </div>
                  </div>
                  <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center shadow-sm`}>
                    <stat.icon className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Main Content Grid */}
        {(sectionVisibility.recentRequisitions || sectionVisibility.lowStockAlerts) && (
          <div
            className={`grid gap-6 ${
              mainSectionCount === 1 ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'
            }`}
          >
            {/* Recent Requisitions */}
            {sectionVisibility.recentRequisitions && (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm w-full">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-gray-900">Recent Requisitions</h3>
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                      <Filter className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {dashboardData.recentRequisitions.map((req) => (
                      <div
                        key={req.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                            <Package className="w-5 h-5 text-primary-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{req.site.name}</p>
                            <p className="text-sm text-gray-500">{req.requestedBy.full_name}</p>
                            <p className="text-sm text-gray-400">{req.items.length} items</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Requested</p>
                          <p className="font-medium text-gray-900">
                            {new Date(req.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <button
                      className="w-full text-primary-600 hover:text-primary-700 font-medium text-sm py-2"
                      onClick={() => navigate('/admin/dashboard/material-requisition')}
                    >
                      View All Requisitions →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Low Stock Alerts */}
            {sectionVisibility.lowStockAlerts && (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm w-full">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-gray-900">Low Stock Alerts</h3>
                    <div className="flex items-center space-x-1 bg-yellow-100 px-2 py-1 rounded-lg">
                      <Clock className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm font-medium text-yellow-700">
                        {dashboardData.stats.lowStockAlerts} Alerts
                      </span>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {dashboardData.lowStockAlerts.map((stock) => (
                      <div key={stock.id} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                              <AlertTriangle className="w-4 h-4 text-primary-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{stock.material?.name}</p>
                              <p className="text-sm text-gray-500">
                                {stock.store?.name} • {stock.qty_on_hand} {stock.material?.unit?.symbol}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-sm px-2 py-1 rounded-lg bg-yellow-100 text-yellow-700">
                              Low Stock
                            </span>
                            <span className="text-sm text-gray-500 mt-1">
                              Threshold: {stock.low_stock_threshold} {stock.material?.unit?.symbol}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <button
                      className="w-full text-primary-600 hover:text-primary-700 font-medium text-sm py-2"
                      onClick={() => navigate('/admin/dashboard/stock-management')}
                    >
                      View All Alerts →
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Bottom Section */}
        {(sectionVisibility.storesOverview || sectionVisibility.recentSiteAssignments) && (
          <div
            className={`grid gap-6 ${
              bottomSectionCount === 1
                ? 'grid-cols-1'
                : 'grid-cols-1 lg:grid-cols-[2fr,1fr]'
            }`}
          >
            {/* Stores Overview */}
            {sectionVisibility.storesOverview && (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm w-full">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-gray-900">Stores Overview</h3>
                    <button
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                      onClick={() => navigate('/admin/dashboard/store-management')}
                    >
                      View Details
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {dashboardData.stores.slice(0, 6).map((store) => (
                      <div
                        key={store.id}
                        className="p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:shadow-md transition-all duration-200"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                              <Building2 className="w-4 h-4 text-primary-600" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{store.name}</p>
                              <p className="text-sm text-gray-500">{store.location}</p>
                            </div>
                          </div>
                          <span className="text-green-600 text-sm font-medium">Active</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Recent Site Assignments */}
            {sectionVisibility.recentSiteAssignments && (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm w-full">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-base font-semibold text-gray-900">Recent Site Assignments</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {dashboardData.recentSiteAssignments.map((assignment) => (
                      <div
                        key={assignment.id}
                        className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                          <MapPin className="w-4 h-4 text-primary-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{assignment.user?.name}</p>
                          <p className="text-sm text-gray-500">{assignment.site?.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">
                            {new Date(assignment.assigned_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <button
                      className="w-full text-primary-600 hover:text-primary-700 font-medium text-sm py-2"
                      onClick={() => navigate('/admin/dashboard/site-assign-management')}
                    >
                      View All Assignments →
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardHome;