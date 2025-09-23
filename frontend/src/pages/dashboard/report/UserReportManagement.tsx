import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  XCircle,
  X,
  User,
  RefreshCw,
  Filter,
  Grid3X3,
  List,
  Settings,
  Minimize2,
  Calendar,
  FileText,
  Clock,
  Download,
  FileImage,
} from "lucide-react";
import reportService, { type UserActivityReport, type ReportSummary } from "../../../services/reportService";
import Logo from '../../../assets/hello.jpg';
import html2pdf from 'html2pdf.js';

type ViewMode = 'table' | 'grid' | 'list';
type ExportFormat = 'pdf';

interface OperationStatus {
  type: "success" | "error" | "info";
  message: string;
}

interface ReportFilters {
  start_date: string;
  end_date: string;
  user_id: string;
}

interface UserActivity {
  user_id: string;
  user_name: string;
  total_requests: number;
  approved_requests: number;
  rejected_requests: number;
  pending_requests: number;
}

interface ExportOptions {
  format: ExportFormat;
  includeFilters: boolean;
  includeSummary: boolean;
}

const UserActivityReportsPage: React.FC = () => {
  const [userActivity, setUserActivity] = useState<UserActivity[]>([]);
  const [allUsers, setAllUsers] = useState<UserActivity[]>([]);
  const [summary, setSummary] = useState<ReportSummary>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortBy, setSortBy] = useState<keyof UserActivity>("user_name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(8);
  const [operationStatus, setOperationStatus] = useState<OperationStatus | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [showFilters, setShowFilters] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [filters, setFilters] = useState<ReportFilters>({
    start_date: "",
    end_date: "",
    user_id: "",
  });
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'pdf',
    includeFilters: true,
    includeSummary: true,
  });

  const exportFormatOptions = [
    { value: 'pdf', label: 'PDF Report', icon: FileImage, description: 'Comprehensive formatted report' },
  ];

  useEffect(() => {
    loadUserActivityReports();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortBy, sortOrder]);

  const loadUserActivityReports = async () => {
    try {
      setLoading(true);
      const params: any = {};
      
      if (filters.start_date) params.date_from = filters.start_date;
      if (filters.end_date) params.date_to = filters.end_date;
      if (filters.user_id) params.user_id = parseInt(filters.user_id);

      const response = await reportService.getUserActivityReports(params);
      
      if (response.success && response.data) {
        const activityArray = Object.entries(response.data.userActivity || {}).map(([user_id, data]) => ({
          user_id,
          ...data,
        }));
        setUserActivity(activityArray);
        if (Object.keys(params).length === 0) {
          setAllUsers(activityArray);
        }
        setSummary({
          total_users: response.data.total_users || 0,
          total_requests: response.data.total_requests || 0,
          approved_requests: response.data.approved_requests || 0,
          rejected_requests: response.data.rejected_requests || 0,
          pending_requests: response.data.pending_requests || 0,
        });
      }
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load user activity reports");
      setUserActivity([]);
      setSummary({});
    } finally {
      setLoading(false);
      setCurrentPage(1);
    }
  };

  const showOperationStatus = (type: OperationStatus["type"], message: string, duration: number = 3000) => {
    setOperationStatus({ type, message });
    setTimeout(() => setOperationStatus(null), duration);
  };

  const formatNumber = (num: number | undefined): string => {
    return num !== undefined ? num.toString() : "-";
  };

  const formatDate = (date?: string): string => {
    if (!date) return "-";
    const parsedDate = new Date(date);
    if (isNaN(parsedDate.getTime())) return "-";
    return parsedDate.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const exportToPDF = () => {
    const element = document.createElement('div');
    element.innerHTML = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>User Activity Reports</title>
          <style>
              @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
              
              * {
                  margin: 0;
                  padding: 0;
                  box-sizing: border-box;
              }
              
              body { 
                  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; 
                  background: #ffffff;
                  margin: 0; 
                  padding: 20px; 
                  line-height: 1.5; 
                  color: #333;
              }
              
              .company-header { 
                  display: flex; 
                  align-items: center; 
                  justify-content: space-between; 
                  margin-bottom: 40px; 
                  padding: 30px 0;
                  border-bottom: 3px solid #ff6b35; 
                  position: relative;
              }
              
              .company-header::after {
                  content: '';
                  position: absolute;
                  bottom: -3px;
                  left: 0;
                  width: 120px;
                  height: 3px;
                  background: #ff8c42;
              }
              
              .company-left {
                  display: flex;
                  align-items: center;
              }
              
              .company-logo { 
                  width: 80px; 
                  height: 80px; 
                  background: linear-gradient(135deg, #ff6b35, #ff8c42);
                  border-radius: 12px; 
                  display: flex; 
                  align-items: center; 
                  justify-content: center; 
                  color: white; 
                  font-weight: 700; 
                  font-size: 24px;
                  margin-right: 30px;
                  box-shadow: 0 4px 20px rgba(255, 107, 53, 0.2);
              }
              
              .company-logo img {
                  width: 100%;
                  height: 100%;
                  object-fit: cover;
                  border-radius: 8px;
              }
              
              .company-info { 
                  flex: 1; 
              }
              
              .company-name { 
                  font-size: 28px; 
                  font-weight: 700; 
                  color: #333; 
                  margin-bottom: 8px;
                  letter-spacing: -0.5px;
              }
              
              .company-details { 
                  font-size: 12px; 
                  color: #666; 
                  line-height: 1.4; 
              }
              
              .company-details div {
                  margin-bottom: 2px;
              }
              
              .report-info { 
                  text-align: right; 
                  font-size: 12px; 
                  color: #666;
                  background: #fff;
                  padding: 20px;
                  border: 2px solid #ff6b35;
                  border-radius: 8px;
              }
              
              .report-info div {
                  margin-bottom: 6px;
              }
              
              .report-info strong {
                  color: #ff6b35;
              }
              
              .report-title { 
                  font-size: 24px; 
                  font-weight: 700; 
                  color: #333; 
                  text-align: center; 
                  margin: 30px 0 40px 0; 
                  padding: 20px; 
                  background: #ffffff; 
                  border-left: 6px solid #ff6b35;
                  border-radius: 0 8px 8px 0;
                  box-shadow: 0 2px 15px rgba(255, 107, 53, 0.1);
                  position: relative;
              }
              
              .summary { 
                  display: grid; 
                  grid-template-columns: repeat(4, 1fr); 
                  gap: 20px; 
                  margin-bottom: 40px; 
              }
              
              .summary-card { 
                  background: #ffffff;
                  border: 1px solid #f0f0f0; 
                  padding: 24px; 
                  text-align: center; 
                  border-radius: 12px;
                  position: relative;
                  transition: all 0.3s ease;
                  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
              }
              
              .summary-card::before {
                  content: '';
                  position: absolute;
                  top: 0;
                  left: 0;
                  right: 0;
                  height: 4px;
                  background: linear-gradient(135deg, #ff6b35, #ff8c42);
                  border-radius: 12px 12px 0 0;
              }
              
              .summary-card:hover {
                  transform: translateY(-2px);
                  box-shadow: 0 8px 25px rgba(255, 107, 53, 0.15);
              }
              
              .summary-card h3 { 
                  margin: 0 0 8px 0; 
                  font-size: 32px; 
                  color: #ff6b35;
                  font-weight: 700;
              }
              
              .summary-card p { 
                  margin: 0; 
                  font-size: 14px; 
                  color: #666;
                  font-weight: 500;
              }
              
              .filters { 
                  background: #fafafa; 
                  padding: 24px; 
                  margin-bottom: 30px; 
                  border-radius: 12px; 
                  border: 1px solid #f0f0f0;
                  position: relative;
              }
              
              .filters::before {
                  content: '';
                  position: absolute;
                  top: 0;
                  left: 0;
                  right: 0;
                  height: 3px;
                  background: linear-gradient(135deg, #ff6b35, #ff8c42);
                  border-radius: 12px 12px 0 0;
              }
              
              .filters h3 { 
                  margin-top: 0; 
                  margin-bottom: 16px;
                  color: #333; 
                  font-size: 18px;
                  font-weight: 600;
              }
              
              .filters p { 
                  margin: 10px 0; 
                  font-size: 13px;
                  display: flex;
                  align-items: center;
              }
              
              .filters p strong {
                  color: #ff6b35;
                  min-width: 100px;
                  font-weight: 600;
              }
              
              .table-container {
                  background: #ffffff;
                  border-radius: 12px;
                  overflow: hidden;
                  box-shadow: 0 2px 15px rgba(0,0,0,0.08);
                  border: 1px solid #f0f0f0;
                  margin-bottom: 30px;
              }
              
              table { 
                  width: 100%; 
                  border-collapse: collapse; 
              }
              
              th, td { 
                  padding: 16px 12px; 
                  text-align: left; 
                  font-size: 12px;
                  border-bottom: 1px solid #f0f0f0;
              }
              
              th { 
                  background: linear-gradient(135deg, #ff6b35, #ff8c42);
                  color: white; 
                  font-weight: 600; 
                  font-size: 13px;
                  text-transform: uppercase;
                  letter-spacing: 0.5px;
              }
              
              th:first-child {
                  border-radius: 0;
              }
              
              th:last-child {
                  border-radius: 0;
              }
              
              td {
                  color: #555;
              }
              
              tr:nth-child(even) { 
                  background-color: #fafafa; 
              }
              
              tr:hover {
                  background-color: #fff5f2;
              }
              
              .footer { 
                  margin-top: 40px; 
                  padding: 24px 0;
                  border-top: 2px solid #ff6b35; 
                  text-align: center; 
                  font-size: 11px; 
                  color: #666;
                  position: relative;
              }
              
              .footer::before {
                  content: '';
                  position: absolute;
                  top: -2px;
                  left: 0;
                  width: 100px;
                  height: 2px;
                  background: #ff8c42;
              }
              
              @media print {
                  body {
                      padding: 0;
                  }
                  
                  .summary-card:hover,
                  tr:hover {
                      transform: none;
                      background-color: transparent;
                  }
              }
              
              @media (max-width: 768px) {
                  .company-header {
                      flex-direction: column;
                      text-align: center;
                  }
                  
                  .company-left {
                      margin-bottom: 20px;
                  }
                  
                  .report-info {
                      width: 100%;
                  }
                  
                  .summary {
                      grid-template-columns: repeat(2, 1fr);
                  }
              }
              
              @media (max-width: 480px) {
                  .summary {
                      grid-template-columns: 1fr;
                  }
                  
                  table {
                      font-size: 10px;
                  }
                  
                  th, td {
                      padding: 8px 6px;
                  }
              }
          </style>
      </head>
      <body>
          <div class="company-header">
              <div class="company-left">
                  <div class="company-logo">
                      <img src="${Logo}" alt="logo">
                  </div>
                  <div class="company-info">
                      <div class="company-name">Catholic Diocese</div>
                      <div class="company-details">
                          <div><strong>Address:</strong> Nyarugenge, Rwanda</div>
                          <div><strong>Phone:</strong> 0791813289 | <strong>Email:</strong> contact@company.com</div>
                      </div>
                  </div>
              </div>
              <div class="report-info">
                  <div><strong>Report Type:</strong> User Activity Reports</div>
                  <div><strong>Generated:</strong> ${new Date().toLocaleDateString('en-GB', { 
                      day: '2-digit', 
                      month: 'long', 
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                  })}</div>
                  <div><strong>Total Records:</strong> ${filteredUserActivity.length}</div>
              </div>
          </div>
          
          ${exportOptions.includeSummary ? `
          <div class="summary">
              <div class="summary-card">
                  <h3>${summary.total_users || 0}</h3>
                  <p>Total Users</p>
              </div>
              <div class="summary-card">
                  <h3>${summary.total_requests || 0}</h3>
                  <p>Total Requests</p>
              </div>
              <div class="summary-card">
                  <h3>${summary.approved_requests || 0}</h3>
                  <p>Approved</p>
              </div>
              <div class="summary-card">
                  <h3>${summary.pending_requests || 0}</h3>
                  <p>Pending</p>
              </div>
          </div>
          ` : ''}

          ${exportOptions.includeFilters ? `
          <div class="filters">
              <h3>Applied Filters</h3>
              <p><strong>Date Range:</strong> ${filters.start_date || 'Not set'} to ${filters.end_date || 'Not set'}</p>
              <p><strong>User:</strong> ${allUsers.find(u => u.user_id === filters.user_id)?.user_name || 'All Users'}</p>
              <p><strong>Search:</strong> ${searchTerm || 'None'}</p>
          </div>
          ` : ''}

          <div class="report-title">User Activity Reports</div>

          <div class="table-container">
              <table>
                  <thead>
                      <tr>
                          <th>User</th>
                          <th>Total Requests</th>
                          <th>Approved</th>
                          <th>Rejected</th>
                          <th>Pending</th>
                      </tr>
                  </thead>
                  <tbody>
                      ${filteredUserActivity.map(activity => `
                          <tr>
                              <td>${activity.user_name || '-'}</td>
                              <td>${formatNumber(activity.total_requests)}</td>
                              <td>${formatNumber(activity.approved_requests)}</td>
                              <td>${formatNumber(activity.rejected_requests)}</td>
                              <td>${formatNumber(activity.pending_requests)}</td>
                          </tr>
                      `).join('')}
                  </tbody>
              </table>
          </div>

          <div class="footer">
              Generated by Catholic Diocese
          </div>
      </body>
      </html>
    `;

    const opt = {
      margin: [10, 10, 10, 10],
      filename: `user-activity-reports-${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().from(element).set(opt).save();
  };

  const handleExport = async () => {
    if (filteredUserActivity.length === 0) {
      showOperationStatus("error", "No data to export");
      return;
    }

    setExporting(true);
    try {
      exportToPDF();
      showOperationStatus("success", "Report exported as PDF successfully");
      setShowExportModal(false);
    } catch (error) {
      console.error("Export failed:", error);
      showOperationStatus("error", "Export failed. Please try again.");
    } finally {
      setExporting(false);
    }
  };

  const filteredUserActivity = useMemo(() => {
    let filtered = userActivity.filter(
      (activity) =>
        (!searchTerm.trim() ||
          activity.user_name?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    filtered.sort((a, b) => {
      let aValue: any = a[sortBy];
      let bValue: any = b[sortBy];

      if (sortBy === "user_name") {
        aValue = aValue?.toLowerCase() || "";
        bValue = bValue?.toLowerCase() || "";
        return sortOrder === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }

      return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
    });

    return filtered;
  }, [userActivity, searchTerm, sortBy, sortOrder]);

  const handleFilterChange = (name: keyof ReportFilters, value: string) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    loadUserActivityReports();
    showOperationStatus("info", "Filters applied successfully");
  };

  const clearFilters = () => {
    setFilters({
      start_date: "",
      end_date: "",
      user_id: "",
    });
    loadUserActivityReports();
  };

  const totalPages = Math.ceil(filteredUserActivity.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUserActivity = filteredUserActivity.slice(startIndex, endIndex);

  const renderTableView = () => (
    <div className="bg-white rounded border border-gray-200">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-2 px-2 text-gray-600 font-medium">#</th>
              <th 
                className="text-left py-2 px-2 text-gray-600 font-medium cursor-pointer hover:bg-gray-100" 
                onClick={() => setSortBy("user_name")}
              >
                <div className="flex items-center space-x-1">
                  <span>User</span>
                  <ChevronDown className={`w-3 h-3 ${sortBy === "user_name" ? "text-primary-600" : "text-gray-400"}`} />
                </div>
              </th>
              <th 
                className="text-left py-2 px-2 text-gray-600 font-medium cursor-pointer hover:bg-gray-100 hidden sm:table-cell" 
                onClick={() => setSortBy("total_requests")}
              >
                <div className="flex items-center space-x-1">
                  <span>Total Requests</span>
                  <ChevronDown className={`w-3 h-3 ${sortBy === "total_requests" ? "text-primary-600" : "text-gray-400"}`} />
                </div>
              </th>
              <th className="text-left py-2 px-2 text-gray-600 font-medium hidden lg:table-cell">Approved</th>
              <th className="text-left py-2 px-2 text-gray-600 font-medium hidden lg:table-cell">Rejected</th>
              <th className="text-left py-2 px-2 text-gray-600 font-medium hidden lg:table-cell">Pending</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {currentUserActivity.map((activity, index) => (
              <tr key={activity.user_id} className="hover:bg-gray-25">
                <td className="py-2 px-2 text-gray-700">{startIndex + index + 1}</td>
                <td className="py-2 px-2 font-medium text-gray-900 text-xs">{activity.user_name || "-"}</td>
                <td className="py-2 px-2 text-gray-700 hidden sm:table-cell">{formatNumber(activity.total_requests)}</td>
                <td className="py-2 px-2 text-gray-700 hidden lg:table-cell">{formatNumber(activity.approved_requests)}</td>
                <td className="py-2 px-2 text-gray-700 hidden lg:table-cell">{formatNumber(activity.rejected_requests)}</td>
                <td className="py-2 px-2 text-gray-700 hidden lg:table-cell">{formatNumber(activity.pending_requests)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      {currentUserActivity.map((activity) => (
        <div key={activity.user_id} className="bg-white rounded border border-gray-200 p-3 hover:shadow-sm transition-shadow">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-primary-700" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-900 text-xs truncate">{activity.user_name || "-"}</div>
            </div>
          </div>
          <div className="space-y-1 mb-3">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-600">Total:</span> {formatNumber(activity.total_requests)}
              </div>
              <div>
                <span className="text-gray-600">Approved:</span> {formatNumber(activity.approved_requests)}
              </div>
              <div>
                <span className="text-gray-600">Rejected:</span> {formatNumber(activity.rejected_requests)}
              </div>
              <div>
                <span className="text-gray-600">Pending:</span> {formatNumber(activity.pending_requests)}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderListView = () => (
    <div className="bg-white rounded border border-gray-200 divide-y divide-gray-100">
      {currentUserActivity.map((activity) => (
        <div key={activity.user_id} className="px-4 py-3 hover:bg-gray-25">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-primary-700" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 text-sm truncate">{activity.user_name || "-"}</div>
              </div>
            </div>
            <div className="hidden md:grid grid-cols-3 gap-4 text-xs text-gray-600 flex-1 max-w-xl px-4">
              <span className="truncate">Total: {formatNumber(activity.total_requests)}</span>
              <span className="truncate">Approved: {formatNumber(activity.approved_requests)}</span>
              <span className="truncate">Pending: {formatNumber(activity.pending_requests)}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderPagination = () => {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="flex items-center justify-between bg-white px-3 py-2 border-t border-gray-200">
        <div className="text-xs text-gray-600">
          Showing {startIndex + 1}-{Math.min(endIndex, filteredUserActivity.length)} of {filteredUserActivity.length}
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center px-2 py-1 text-xs text-gray-500 bg-white border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-3 h-3" />
          </button>
          {pages.map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-2 py-1 text-xs rounded ${
                currentPage === page
                  ? "bg-primary-500 text-white"
                  : "text-gray-700 bg-white border border-gray-200 hover:bg-gray-50"
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex items-center px-2 py-1 text-xs text-gray-500 bg-white border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 text-xs">
      <div className="bg-white shadow-md">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="text-gray-400 hover:text-gray-600 p-1"
                title="Toggle Sidebar"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">User Activity Reports</h1>
                <p className="text-xs text-gray-500 mt-0.5">Track and analyze user request activity</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowExportModal(true)}
                disabled={loading || filteredUserActivity.length === 0}
                className="flex items-center space-x-1 px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Export Reports"
              >
                <Download className="w-3 h-3" />
                <span>Export</span>
              </button>
              <button
                onClick={loadUserActivityReports}
                disabled={loading}
                className="flex items-center space-x-1 px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50"
                title="Refresh"
              >
                <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        <div className="bg-white rounded border border-gray-200 p-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 gap-3">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="w-3 h-3 text-gray-400 absolute left-2 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-48 pl-7 pr-3 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-1 px-2 py-1.5 text-xs border rounded transition-colors ${
                  showFilters ? 'bg-primary-50 border-primary-200 text-primary-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Filter className="w-3 h-3" />
                <span>Filter</span>
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split("-") as [keyof UserActivity, "asc" | "desc"];
                  setSortBy(field);
                  setSortOrder(order);
                }}
                className="text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500"
              >
                <option value="user_name-asc">User Name (A-Z)</option>
                <option value="user_name-desc">User Name (Z-A)</option>
                <option value="total_requests-desc">Most Requests</option>
                <option value="total_requests-asc">Fewest Requests</option>
                <option value="approved_requests-desc">Most Approved</option>
              </select>
              <div className="flex items-center border border-gray-200 rounded">
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 text-xs transition-colors ${
                    viewMode === 'table' ? 'bg-primary-50 text-primary-600' : 'text-gray-400 hover:text-gray-600'
                  }`}
                  title="Table View"
                >
                  <List className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 text-xs transition-colors ${
                    viewMode === 'grid' ? 'bg-primary-50 text-primary-600' : 'text-gray-400 hover:text-gray-600'
                  }`}
                  title="Grid View"
                >
                  <Grid3X3 className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 text-xs transition-colors ${
                    viewMode === 'list' ? 'bg-primary-50 text-primary-600' : 'text-gray-400 hover:text-gray-600'
                  }`}
                  title="List View"
                >
                  <Settings className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
          {showFilters && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={filters.start_date}
                    onChange={(e) => handleFilterChange('start_date', e.target.value)}
                    className="w-full text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={filters.end_date}
                    onChange={(e) => handleFilterChange('end_date', e.target.value)}
                    className="w-full text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">User</label>
                  <select
                    value={filters.user_id}
                    onChange={(e) => handleFilterChange('user_id', e.target.value)}
                    className="w-full text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500"
                  >
                    <option value="">Select a user</option>
                    {allUsers.map((user) => (
                      <option key={user.user_id} value={user.user_id}>
                        {user.user_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={applyFilters}
                  className="px-3 py-1.5 text-xs bg-primary-600 text-white rounded hover:bg-primary-700"
                >
                  Apply Filters
                </button>
                <button
                  onClick={clearFilters}
                  className="px-3 py-1.5 text-xs text-gray-600 border border-gray-200 rounded hover:bg-gray-50"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded p-3 text-red-700 text-xs">
            {error}
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded border border-gray-200 p-8 text-center text-gray-500">
            <div className="inline-flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs">Loading user activity reports...</span>
            </div>
          </div>
        ) : currentUserActivity.length === 0 ? (
          <div className="bg-white rounded border border-gray-200 p-8 text-center text-gray-500">
            <div className="text-xs">
              {searchTerm || filters.user_id || filters.start_date || filters.end_date ? 'No user activity found matching your criteria' : 'No user activity reports found'}
            </div>
          </div>
        ) : (
          <div>
            {viewMode === 'table' && renderTableView()}
            {viewMode === 'grid' && renderGridView()}
            {viewMode === 'list' && renderListView()}
            {renderPagination()}
          </div>
        )}
      </div>

      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Export Reports</h3>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Export Format</label>
                <div className="flex items-center p-3 border border-gray-200 rounded bg-gray-50">
                  <FileImage className="w-5 h-5 text-gray-600 mr-3" />
                  <div>
                    <div className="font-medium text-gray-900 text-sm">PDF Report</div>
                    <div className="text-xs text-gray-600">Comprehensive formatted report</div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Include in Export</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={exportOptions.includeFilters}
                      onChange={(e) => setExportOptions(prev => ({ ...prev, includeFilters: e.target.checked }))}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Applied filters information</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={exportOptions.includeSummary}
                      onChange={(e) => setExportOptions(prev => ({ ...prev, includeSummary: e.target.checked }))}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">Summary statistics</span>
                  </label>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded p-3">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-xs text-blue-700">
                    <p className="font-medium mb-1">Export Information</p>
                    <p>This will export {filteredUserActivity.length} record{filteredUserActivity.length !== 1 ? 's' : ''} based on your current filters and search criteria.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200 mt-6">
              <button
                onClick={() => setShowExportModal(false)}
                className="px-4 py-2 text-sm border border-gray-200 rounded hover:bg-gray-50 text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleExport}
                disabled={exporting}
                className="px-4 py-2 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {exporting && <div className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></div>}
                <span>{exporting ? 'Exporting...' : 'Export'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {operationStatus && (
        <div className="fixed top-4 right-4 z-50">
          <div className={`flex items-center space-x-2 px-3 py-2 rounded shadow-lg text-xs ${
            operationStatus.type === "success" ? "bg-green-50 border border-green-200 text-green-800" :
            operationStatus.type === "error" ? "bg-red-50 border border-red-200 text-red-800" :
            "bg-primary-50 border border-primary-200 text-primary-800"
          }`}>
            {operationStatus.type === "success" && <CheckCircle className="w-4 h-4 text-green-600" />}
            {operationStatus.type === "error" && <XCircle className="w-4 h-4 text-red-600" />}
            {operationStatus.type === "info" && <AlertCircle className="w-4 h-4 text-primary-600" />}
            <span className="font-medium">{operationStatus.message}</span>
            <button onClick={() => setOperationStatus(null)} className="hover:opacity-70">
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserActivityReportsPage;