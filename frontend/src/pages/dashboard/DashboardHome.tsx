
import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  Calendar,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Building2,
  Package,
  MapPin,
  AlertTriangle,
  Box,
  Map,
  Users,
} from 'lucide-react';
import materialService, { type Material } from '../../services/materialsService';
import requisitionService, { type MaterialRequisition } from '../../services/requestService';
import siteService, { type Site } from '../../services/siteService';
import siteAssignmentService, { type SiteAssignment } from '../../services/siteAssignmentService';
import stockService, { type Stock, type StockMovement } from '../../services/stockService';
import storeService, { type Store } from '../../services/storeService';
import userService, { type User } from '../../services/userService';
import useAuth from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import AccessRestricted from '../../components/dashboard/AccessRestricted';

interface DashboardData {
  materials: Material[];
  recentRequisitions: MaterialRequisition[];
  lowStockAlerts: Stock[];
  recentSiteAssignments: SiteAssignment[];
  recentStockArrivals: StockMovement[];
  recentMaterials: Material[];
  sites: Site[];
  stores: Store[];
  users: User[];
  assignedSites: Site[];
  stocks: Stock[];
  stats: {
    totalMaterials: number;
    pendingRequisitions: number;
    verifiedRequisitions: number;
    approvedRequisitions: number;
    issuedRequisitions: number;
    receivedRequisitions: number;
    closedRequisitions: number;
    totalSites: number;
    siteEngineers: number;
    lowStockAlerts: number;
    assignedSites: number;
    uniqueStores: number;
    totalStockItems: number;
  };
  previousStats: {
    totalMaterials: number;
    pendingRequisitions: number;
    verifiedRequisitions: number;
    approvedRequisitions: number;
    issuedRequisitions: number;
    receivedRequisitions: number;
    closedRequisitions: number;
    totalSites: number;
    siteEngineers: number;
    lowStockAlerts: number;
    assignedSites: number;
    uniqueStores: number;
    totalStockItems: number;
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

interface FilterParams {
  date_from?: string;
  date_to?: string;
}

const DashboardHome: React.FC = () => {
  const { user } = useAuth();
  const userRole = user?.role?.name;
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    materials: [],
    recentRequisitions: [],
    lowStockAlerts: [],
    recentSiteAssignments: [],
    recentStockArrivals: [],
    recentMaterials: [],
    sites: [],
    stores: [],
    users: [],
    assignedSites: [],
    stocks: [],
    stats: {
      totalMaterials: 0,
      pendingRequisitions: 0,
      verifiedRequisitions: 0,
      approvedRequisitions: 0,
      issuedRequisitions: 0,
      receivedRequisitions: 0,
      closedRequisitions: 0,
      totalSites: 0,
      siteEngineers: 0,
      lowStockAlerts: 0,
      assignedSites: 0,
      uniqueStores: 0,
      totalStockItems: 0,
    },
    previousStats: {
      totalMaterials: 0,
      pendingRequisitions: 0,
      verifiedRequisitions: 0,
      approvedRequisitions: 0,
      issuedRequisitions: 0,
      receivedRequisitions: 0,
      closedRequisitions: 0,
      totalSites: 0,
      siteEngineers: 0,
      lowStockAlerts: 0,
      assignedSites: 0,
      uniqueStores: 0,
      totalStockItems: 0,
    },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterParams>({ date_from: '', date_to: '' });
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const navigate = useNavigate();

  const hasAccess = (allowedRoles: string[]): boolean => {
    if (!userRole) return false;
    return allowedRoles.includes(userRole);
  };

  const adminRoles = ['PADIRI', 'ADMIN'];
  const siteEngineerRole = ['SITE_ENGINEER'];
  const storekeeperRole = ['STOREKEEPER'];
  const diocesanSiteEngineerRole = ['DIOCESAN_SITE_ENGINEER'];
  const allAllowedRoles = [...adminRoles, ...siteEngineerRole, ...storekeeperRole, ...diocesanSiteEngineerRole];

  const sectionVisibility = {
    recentRequisitions: hasAccess([...adminRoles, ...siteEngineerRole, ...storekeeperRole, ...diocesanSiteEngineerRole]),
    lowStockAlerts: hasAccess([...adminRoles, ...storekeeperRole]),
    storesOverview: hasAccess([...adminRoles, ...storekeeperRole]),
    recentSiteAssignments: hasAccess([...adminRoles, ...siteEngineerRole, ...diocesanSiteEngineerRole]),
    recentStockArrivals: hasAccess([...adminRoles, ...storekeeperRole]),
    recentMaterials: hasAccess([...adminRoles, ...diocesanSiteEngineerRole]),
    stockLevels: hasAccess([...adminRoles, ...storekeeperRole]),
    assignedSites: hasAccess(siteEngineerRole),
  };

  const calculatePercentageChange = (current: number, previous: number): { change: string; trend: 'up' | 'down' } => {
    if (previous === 0) {
      return { change: current > 0 ? 'N/A' : '0%', trend: 'up' };
    }
    const change = ((current - previous) / previous) * 100;
    const formattedChange = `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
    return { change: formattedChange, trend: change >= 0 ? 'up' : 'down' };
  };

  const allStatsCards: StatCard[] = [
    {
      label: 'Total Materials',
      value: dashboardData.stats.totalMaterials,
      change: calculatePercentageChange(dashboardData.stats.totalMaterials, dashboardData.previousStats.totalMaterials).change,
      icon: Box,
      color: 'bg-indigo-500',
      trend: calculatePercentageChange(dashboardData.stats.totalMaterials, dashboardData.previousStats.totalMaterials).trend,
      allowedRoles: [...adminRoles, ...diocesanSiteEngineerRole],
    },
    {
      label: 'Pending Requests',
      value: dashboardData.stats.pendingRequisitions,
      change: calculatePercentageChange(dashboardData.stats.pendingRequisitions, dashboardData.previousStats.pendingRequisitions).change,
      icon: Clock,
      color: 'bg-yellow-500',
      trend: calculatePercentageChange(dashboardData.stats.pendingRequisitions, dashboardData.previousStats.pendingRequisitions).trend,
      allowedRoles: [...adminRoles, ...siteEngineerRole, ...diocesanSiteEngineerRole],
    },
    {
      label: 'Verified Requests',
      value: dashboardData.stats.verifiedRequisitions,
      change: calculatePercentageChange(dashboardData.stats.verifiedRequisitions, dashboardData.previousStats.verifiedRequisitions).change,
      icon: Package,
      color: 'bg-orange-500',
      trend: calculatePercentageChange(dashboardData.stats.verifiedRequisitions, dashboardData.previousStats.verifiedRequisitions).trend,
      allowedRoles: [...siteEngineerRole, ...storekeeperRole],
    },
    {
      label: 'Approved Requests',
      value: dashboardData.stats.approvedRequisitions,
      change: calculatePercentageChange(dashboardData.stats.approvedRequisitions, dashboardData.previousStats.approvedRequisitions).change,
      icon: Package,
      color: 'bg-green-500',
      trend: calculatePercentageChange(dashboardData.stats.approvedRequisitions, dashboardData.previousStats.approvedRequisitions).trend,
      allowedRoles: [...adminRoles, ...siteEngineerRole, ...storekeeperRole, ...diocesanSiteEngineerRole],
    },
    {
      label: 'Issued Requests',
      value: dashboardData.stats.issuedRequisitions,
      change: calculatePercentageChange(dashboardData.stats.issuedRequisitions, dashboardData.previousStats.issuedRequisitions).change,
      icon: Box,
      color: 'bg-blue-500',
      trend: calculatePercentageChange(dashboardData.stats.issuedRequisitions, dashboardData.previousStats.issuedRequisitions).trend,
      allowedRoles: [...adminRoles, ...siteEngineerRole, ...storekeeperRole, ...diocesanSiteEngineerRole],
    },
    {
      label: 'Received Requests',
      value: dashboardData.stats.receivedRequisitions,
      change: calculatePercentageChange(dashboardData.stats.receivedRequisitions, dashboardData.previousStats.receivedRequisitions).change,
      icon: MapPin,
      color: 'bg-purple-500',
      trend: calculatePercentageChange(dashboardData.stats.receivedRequisitions, dashboardData.previousStats.receivedRequisitions).trend,
      allowedRoles: [...diocesanSiteEngineerRole],
    },
    {
      label: 'Closed Requests',
      value: dashboardData.stats.closedRequisitions,
      change: calculatePercentageChange(dashboardData.stats.closedRequisitions, dashboardData.previousStats.closedRequisitions).change,
      icon: Map,
      color: 'bg-gray-500',
      trend: calculatePercentageChange(dashboardData.stats.closedRequisitions, dashboardData.previousStats.closedRequisitions).trend,
      allowedRoles: [...adminRoles, ...siteEngineerRole, ...storekeeperRole, ...diocesanSiteEngineerRole],
    },
    {
      label: 'Total Sites',
      value: dashboardData.stats.totalSites,
      change: calculatePercentageChange(dashboardData.stats.totalSites, dashboardData.previousStats.totalSites).change,
      icon: Building2,
      color: 'bg-primary-500',
      trend: calculatePercentageChange(dashboardData.stats.totalSites, dashboardData.previousStats.totalSites).trend,
      allowedRoles: adminRoles,
    },
    {
      label: 'Assigned Sites',
      value: dashboardData.stats.assignedSites,
      change: calculatePercentageChange(dashboardData.stats.assignedSites, dashboardData.previousStats.assignedSites).change,
      icon: MapPin,
      color: 'bg-teal-500',
      trend: calculatePercentageChange(dashboardData.stats.assignedSites, dashboardData.previousStats.assignedSites).trend,
      allowedRoles: siteEngineerRole,
    },
    {
      label: 'Site Engineers',
      value: dashboardData.stats.siteEngineers,
      change: calculatePercentageChange(dashboardData.stats.siteEngineers, dashboardData.previousStats.siteEngineers).change,
      icon: Users,
      color: 'bg-teal-500',
      trend: calculatePercentageChange(dashboardData.stats.siteEngineers, dashboardData.previousStats.siteEngineers).trend,
      allowedRoles: [...adminRoles, ...diocesanSiteEngineerRole],
    },
    {
      label: 'Low Stock Alerts',
      value: dashboardData.stats.lowStockAlerts,
      change: calculatePercentageChange(dashboardData.stats.lowStockAlerts, dashboardData.previousStats.lowStockAlerts).change,
      icon: AlertTriangle,
      color: 'bg-red-500',
      trend: calculatePercentageChange(dashboardData.stats.lowStockAlerts, dashboardData.previousStats.lowStockAlerts).trend,
      allowedRoles: [...adminRoles, ...storekeeperRole],
    },
    {
      label: 'Unique Stores',
      value: dashboardData.stats.uniqueStores,
      change: calculatePercentageChange(dashboardData.stats.uniqueStores, dashboardData.previousStats.uniqueStores).change,
      icon: Building2,
      color: 'bg-indigo-500',
      trend: calculatePercentageChange(dashboardData.stats.uniqueStores, dashboardData.previousStats.uniqueStores).trend,
      allowedRoles: storekeeperRole,
    },
    {
      label: 'Total Stock Items',
      value: dashboardData.stats.totalStockItems,
      change: calculatePercentageChange(dashboardData.stats.totalStockItems, dashboardData.previousStats.totalStockItems).change,
      icon: Box,
      color: 'bg-cyan-500',
      trend: calculatePercentageChange(dashboardData.stats.totalStockItems, dashboardData.previousStats.totalStockItems).trend,
      allowedRoles: storekeeperRole,
    },
  ];

  const statsCards = allStatsCards.filter(stat => hasAccess(stat.allowedRoles));
  const mainSectionCount = [
    sectionVisibility.recentRequisitions,
    sectionVisibility.lowStockAlerts,
    sectionVisibility.recentStockArrivals,
    sectionVisibility.recentMaterials,
  ].filter(Boolean).length;
  const bottomSectionCount = [
    sectionVisibility.storesOverview,
    sectionVisibility.recentSiteAssignments,
    sectionVisibility.stockLevels,
    sectionVisibility.assignedSites,
  ].filter(Boolean).length;

  const getPreviousPeriodFilters = (filters: FilterParams): FilterParams => {
    const toDate = filters.date_to ? new Date(filters.date_to) : new Date();
    const fromDate = filters.date_from ? new Date(filters.date_from) : new Date(toDate.getTime() - 30 * 24 * 60 * 60 * 1000);
    const periodLength = toDate.getTime() - fromDate.getTime();
    const prevToDate = new Date(fromDate.getTime() - 1000);
    const prevFromDate = new Date(prevToDate.getTime() - periodLength);
    return {
      date_from: prevFromDate.toISOString().split('T')[0],
      date_to: prevToDate.toISOString().split('T')[0],
    };
  };

  const fetchData = async () => {
    if (!hasAccess(allAllowedRoles)) {
      setError('Access restricted to PADIRI, ADMIN, SITE_ENGINEER, STOREKEEPER, or DIOCESAN_SITE_ENGINEER roles');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const currentPromises: Promise<any>[] = [];
      const previousPromises: Promise<any>[] = [];
      const prevFilters = getPreviousPeriodFilters(filters);

      // Requisitions data
      if (hasAccess([...adminRoles, ...storekeeperRole, ...diocesanSiteEngineerRole])) {
        currentPromises.push(requisitionService.getAllRequisitions(filters));
        previousPromises.push(requisitionService.getAllRequisitions(prevFilters));
      } else if (hasAccess(siteEngineerRole)) {
        currentPromises.push(requisitionService.getAllMyRequisitions());
        previousPromises.push(requisitionService.getAllMyRequisitions());
      } else {
        currentPromises.push(Promise.resolve({ data: { requests: [] } }));
        previousPromises.push(Promise.resolve({ data: { requests: [] } }));
      }

      // Site assignments
      if (hasAccess(siteEngineerRole)) {
        currentPromises.push(siteAssignmentService.getUserAssignedSites());
        previousPromises.push(siteAssignmentService.getUserAssignedSites());
      } else if (hasAccess([...adminRoles, ...diocesanSiteEngineerRole])) {
        currentPromises.push(siteAssignmentService.getAllSiteAssignments({ limit: 3, ...filters }));
        previousPromises.push(siteAssignmentService.getAllSiteAssignments({ limit: 3, ...prevFilters }));
      } else {
        currentPromises.push(Promise.resolve({ assignments: [] }));
        previousPromises.push(Promise.resolve({ assignments: [] }));
      }

      // Materials, sites, and users
      if (hasAccess([...adminRoles, ...storekeeperRole, ...diocesanSiteEngineerRole])) {
        currentPromises.push(
          materialService.getAllMaterials(filters),
          siteService.getAllSites(),
          userService.getAllUsers()
        );
        previousPromises.push(
          materialService.getAllMaterials(prevFilters),
          siteService.getAllSites(),
          userService.getAllUsers()
        );
      } else {
        currentPromises.push(
          Promise.resolve([]), // materials
          Promise.resolve({ sites: [] }), // sites
          Promise.resolve({ data: { users: [] } }) // users
        );
        previousPromises.push(
          Promise.resolve([]), // materials
          Promise.resolve({ sites: [] }), // sites
          Promise.resolve({ data: { users: [] } }) // users
        );
      }

      // Stock and store data for admin and storekeeper only
      if (hasAccess([...adminRoles, ...storekeeperRole])) {
        currentPromises.push(
          stockService.getLowStockAlerts(filters),
          storeService.getAllStores(),
          stockService.getStockHistory({ limit: 3, movement_type: 'IN', ...filters }),
          stockService.getAllStock()
        );
        previousPromises.push(
          stockService.getLowStockAlerts(prevFilters),
          storeService.getAllStores(),
          stockService.getStockHistory({ limit: 3, movement_type: 'IN', ...prevFilters }),
          stockService.getAllStock()
        );
      } else {
        currentPromises.push(
          Promise.resolve({ lowStockItems: [] }), // lowStockAlerts
          Promise.resolve({ stores: [] }), // stores
          Promise.resolve({ history: [] }), // stockHistory
          Promise.resolve([]) // stocks
        );
        previousPromises.push(
          Promise.resolve({ lowStockItems: [] }), // lowStockAlerts
          Promise.resolve({ stores: [] }), // stores
          Promise.resolve({ history: [] }), // stockHistory
          Promise.resolve([]) // stocks
        );
      }

      const [
        [
          requisitionsResponse,
          siteAssignmentsResponse,
          materialsResponse,
          sitesResponse,
          usersResponse,
          lowStockResponse,
          storesResponse,
          stockHistoryResponse,
          stocksResponse,
        ],
        [
          prevRequisitionsResponse,
          prevSiteAssignmentsResponse,
          prevMaterialsResponse,
          prevSitesResponse,
          prevUsersResponse,
          prevLowStockResponse,
          prevStoresResponse,
          prevStockHistoryResponse,
          prevStocksResponse,
        ],
      ] = await Promise.all([
        Promise.all(currentPromises),
        Promise.all(previousPromises),
      ]);

      const materials = materialsResponse || [];
      const recentRequisitions = requisitionsResponse?.data?.requests?.slice(0, 3) || [];
      const sites = sitesResponse?.sites || [];
      const lowStockAlerts = lowStockResponse?.lowStockItems || [];
      const stores = storesResponse?.stores || [];
      const recentSiteAssignments = hasAccess(siteEngineerRole)
        ? siteAssignmentsResponse?.map((site: Site) => ({
            id: site.id,
            site_id: site.id,
            user_id: user?.id || 0,
            assigned_at: site.created_at || new Date().toISOString(),
            status: 'ACTIVE' as 'ACTIVE' | 'INACTIVE',
            site,
            user: { id: user?.id || 0, full_name: user?.full_name || 'N/A' },
          })) || []
        : siteAssignmentsResponse?.assignments || [];
      const recentStockArrivals = stockHistoryResponse?.history || [];
      const stocks = stocksResponse?.stock || [];
      const users = usersResponse?.data?.users || [];
      const assignedSites = hasAccess(siteEngineerRole) ? siteAssignmentsResponse || [] : [];
      const recentMaterials = materials
        .sort((a, b) => new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime())
        .slice(0, 3);

      const prevMaterials = prevMaterialsResponse || [];
      const prevRequisitions = prevRequisitionsResponse?.data?.requests || [];
      const prevSites = prevSitesResponse?.sites || [];
      const prevLowStockAlerts = prevLowStockResponse?.lowStockItems || [];
      const prevStores = prevStoresResponse?.stores || [];
      const prevUsers = prevUsersResponse?.data?.users || [];
      const prevAssignedSites = hasAccess(siteEngineerRole) ? prevSiteAssignmentsResponse || [] : [];
      const prevStocks = prevStocksResponse?.stock || [];

      setDashboardData({
        materials,
        recentRequisitions,
        lowStockAlerts,
        recentSiteAssignments,
        recentStockArrivals,
        recentMaterials,
        sites,
        stores,
        users,
        assignedSites,
        stocks,
        stats: {
          totalMaterials: Number(materials.length),
          pendingRequisitions: Number(recentRequisitions.filter(req => req.status === 'PENDING').length),
          verifiedRequisitions: Number(recentRequisitions.filter(req => req.status === 'WAITING_PADIRI_REVIEW').length),
          approvedRequisitions: Number(recentRequisitions.filter(req => req.status === 'APPROVED').length),
          issuedRequisitions: Number(recentRequisitions.filter(req => req.status === 'ISSUED').length),
          receivedRequisitions: Number(recentRequisitions.filter(req => req.status === 'RECEIVED').length),
          closedRequisitions: Number(recentRequisitions.filter(req => req.status === 'CLOSED').length),
          totalSites: Number(sites.length),
          siteEngineers: Number(users.filter(user => user.role?.name === 'SITE_ENGINEER').length),
          lowStockAlerts: Number(lowStockAlerts.length),
          assignedSites: Number(assignedSites.length),
          uniqueStores: Number(stores.length),
          totalStockItems: Number(stocks.length),
        },
        previousStats: {
          totalMaterials: Number(prevMaterials.length),
          pendingRequisitions: Number(prevRequisitions.filter(req => req.status === 'PENDING').length),
          verifiedRequisitions: Number(prevRequisitions.filter(req => req.status === 'WAITING_PADIRI_REVIEW').length),
          approvedRequisitions: Number(prevRequisitions.filter(req => req.status === 'APPROVED').length),
          issuedRequisitions: Number(prevRequisitions.filter(req => req.status === 'ISSUED').length),
          receivedRequisitions: Number(prevRequisitions.filter(req => req.status === 'RECEIVED').length),
          closedRequisitions: Number(prevRequisitions.filter(req => req.status === 'CLOSED').length),
          totalSites: Number(prevSites.length),
          siteEngineers: Number(prevUsers.filter(user => user.role?.name === 'SITE_ENGINEER').length),
          lowStockAlerts: Number(prevLowStockAlerts.length),
          assignedSites: Number(prevAssignedSites.length),
          uniqueStores: Number(prevStores.length),
          totalStockItems: Number(prevStocks.length),
        },
      });
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userRole, filters]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof FilterParams) => {
    setFilters((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const clearFilters = () => {
    setFilters({ date_from: '', date_to: '' });
  };

  const formatDate = (date?: Date | string): string => {
    if (!date) return new Date().toLocaleDateString('en-GB');
    return new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

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

  if (!hasAccess(allAllowedRoles)) {
    return (<>
    <AccessRestricted />
    </>)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Inventory Dashboard</h1>
              <p className="text-sm text-gray-600 mt-1">
                {hasAccess(siteEngineerRole)
                  ? 'Overview of your requisitions and sites'
                  : hasAccess(storekeeperRole)
                  ? 'Overview of stock, requisitions, and stores'
                  : hasAccess(diocesanSiteEngineerRole)
                  ? 'Overview of materials, requisitions, and site assignments'
                  : 'Overview of materials, requisitions, and sites'}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <Search className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-1 p-2 text-gray-600 hover:text-gray-800 rounded-lg transition-colors ${
                  showFilters ? 'bg-primary-50' : 'hover:bg-gray-100'
                }`}
              >
                <Filter className="w-4 h-4" />
                <span className="text-sm">Filter</span>
              </button>
              <button
                onClick={fetchData}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
          {showFilters && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="date"
                  value={filters.date_from || ''}
                  onChange={(e) => handleFilterChange(e, 'date_from')}
                  className="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
                <input
                  type="date"
                  value={filters.date_to || ''}
                  onChange={(e) => handleFilterChange(e, 'date_to')}
                  className="text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500"
                />
                {(filters.date_from || filters.date_to) && (
                  <button
                    onClick={clearFilters}
                    className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 border border-gray-200 rounded"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
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
                      <span className="text-sm text-gray-500 ml-2">vs last period</span>
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

        {(sectionVisibility.recentRequisitions || sectionVisibility.lowStockAlerts || sectionVisibility.recentStockArrivals || sectionVisibility.recentMaterials) && (
          <div className={`grid gap-6 ${mainSectionCount === 1 ? 'grid-cols-1' : mainSectionCount === 2 ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3'}`}>
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
                            <p className="font-semibold text-gray-900">{req.site?.name || 'N/A'}</p>
                            <p className="text-sm text-gray-500">{req.requestedBy?.full_name || 'N/A'}</p>
                            <p className="text-sm text-gray-400">{req.items?.length || 0} items</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Requested</p>
                          <p className="font-medium text-gray-900">{formatDate(req.created_at)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <button
                      className="w-full text-primary-600 hover:text-primary-700 font-medium text-sm py-2"
                      onClick={() => navigate(
                        hasAccess(storekeeperRole)
                          ? '/dashboard/stock-requisitions'
                          : hasAccess([...siteEngineerRole, ...diocesanSiteEngineerRole])
                          ? '/dashboard/material-requisition'
                          : '/admin/dashboard/material-requisition'
                      )}
                    >
                      View All Requisitions →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {sectionVisibility.lowStockAlerts && (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm w-full">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-gray-900">Recent Alerts</h3>
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
                              <p className="font-semibold text-gray-900">{stock.material?.name || 'N/A'}</p>
                              <p className="text-sm text-gray-500">
                                {stock.store?.name || 'N/A'} • {Number(stock.qty_on_hand) || 0} {stock.material?.unit?.symbol || ''}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-sm px-2 py-1 rounded-lg bg-yellow-100 text-yellow-700">
                              Low Stock
                            </span>
                            <span className="text-sm text-gray-500 mt-1">
                              Threshold: {Number(stock.low_stock_threshold) || 0} {stock.material?.unit?.symbol || ''}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <button
                      className="w-full text-primary-600 hover:text-primary-700 font-medium text-sm py-2"
                      onClick={() => navigate(hasAccess(storekeeperRole) ? '/dashboard/stock-alerts' : '/admin/dashboard/stock-management')}
                    >
                      View All Alerts →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {sectionVisibility.recentStockArrivals && (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm w-full">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-base font-semibold text-gray-900">Recent Stock Arrivals</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {dashboardData.recentStockArrivals.map((arrival) => (
                      <div key={arrival.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                            <Package className="w-5 h-5 text-primary-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{arrival.material?.name || 'N/A'}</p>
                            <p className="text-sm text-gray-500">{arrival.store?.name || 'N/A'}</p>
                            <p className="text-sm text-gray-400">Qty: {Number(arrival.quantity) || 0}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Received</p>
                          <p className="font-medium text-gray-900">{formatDate(arrival.created_at)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <button
                      className="w-full text-primary-600 hover:text-primary-700 font-medium text-sm py-2"
                      onClick={() => navigate(hasAccess(storekeeperRole) ? '/dashboard/stock-history' : '/admin/dashboard/stock-history')}
                    >
                      View All Stock History →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {sectionVisibility.recentMaterials && (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm w-full">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-base font-semibold text-gray-900">Recent Added Materials</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {dashboardData.recentMaterials.map((material) => (
                      <div key={material.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                            <Box className="w-5 h-5 text-primary-600" />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{material.name || 'N/A'}</p>
                            <p className="text-sm text-gray-500">{material.category?.name || 'N/A'}</p>
                            <p className="text-sm text-gray-400">{material.unit?.symbol || 'N/A'}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Added</p>
                          <p className="font-medium text-gray-900">{formatDate(material.createdAt)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <button
                      className="w-full text-primary-600 hover:text-primary-700 font-medium text-sm py-2"
                      onClick={() => navigate(hasAccess(diocesanSiteEngineerRole) ? '/dashboard/materials' : '/admin/dashboard/material-management')}
                    >
                      View All Materials →
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {(sectionVisibility.storesOverview || sectionVisibility.recentSiteAssignments || sectionVisibility.stockLevels || sectionVisibility.assignedSites) && (
          <div className={`grid gap-6 ${bottomSectionCount === 1 ? 'grid-cols-1' : bottomSectionCount === 2 ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1 lg:grid-cols-2 xl:grid-cols-3'}`}>
            {sectionVisibility.storesOverview && (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm w-full">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-base font-semibold text-gray-900">Stores Overview</h3>
                    <button
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                      onClick={() => navigate(hasAccess(storekeeperRole) ? '/dashboard/store-management' : '/admin/dashboard/store-management')}
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
                              <p className="text-sm text-gray-500">{store.location || 'N/A'}</p>
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

            {sectionVisibility.recentSiteAssignments && (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm w-full">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-base font-semibold text-gray-900">
                    {hasAccess([...siteEngineerRole, ...diocesanSiteEngineerRole]) ? 'Recent Site Assignments' : 'Recent Site Assignments'}
                  </h3>
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
                          <p className="font-medium text-gray-900 truncate">
                            {hasAccess(siteEngineerRole) ? assignment.site?.name : assignment.user?.full_name || 'N/A'}
                          </p>
                          <p className="text-sm text-gray-500">{hasAccess(siteEngineerRole) ? assignment.site?.location : assignment.site?.name || 'N/A'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">{formatDate(assignment.assigned_at)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <button
                      className="w-full text-primary-600 hover:text-primary-700 font-medium text-sm py-2"
                      onClick={() => navigate(hasAccess([...siteEngineerRole, ...diocesanSiteEngineerRole]) ? '/dashboard/site-assignments' : '/admin/dashboard/site-assign-management')}
                    >
                      View All Site Assignments →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {sectionVisibility.stockLevels && (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm w-full">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-base font-semibold text-gray-900">Stock Levels</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {dashboardData.stocks.slice(0, 3).map((stock) => (
                      <div key={stock.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                          <Box className="w-4 h-4 text-primary-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{stock.material?.name || 'N/A'}</p>
                          <p className="text-sm text-gray-500">
                            {stock.store?.name || 'N/A'} • {Number(stock.qty_on_hand) || 0} {stock.material?.unit?.symbol || ''}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">Threshold: {Number(stock.low_stock_threshold) || 0}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <button
                      className="w-full text-primary-600 hover:text-primary-700 font-medium text-sm py-2"
                      onClick={() => navigate(hasAccess(storekeeperRole) ? '/dashboard/stock-levels' : '/admin/dashboard/stock-management')}
                    >
                      View All Stock Levels →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {sectionVisibility.assignedSites && (
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm w-full">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-base font-semibold text-gray-900">Assigned Sites</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {dashboardData.assignedSites.slice(0, 3).map((site) => (
                      <div key={site.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                          <MapPin className="w-4 h-4 text-primary-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{site.name || 'N/A'}</p>
                          <p className="text-sm text-gray-500">{site.location || 'N/A'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600">{formatDate(site.created_at)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <button
                      className="w-full text-primary-600 hover:text-primary-700 font-medium text-sm py-2"
                      onClick={() => navigate('/dashboard/assigned-sites')}
                    >
                      View All Assigned Sites →
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
