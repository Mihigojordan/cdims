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
  MapPin,
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
  Eye,
} from "lucide-react";
import reportService, { type SitePerformanceReport, type ReportSummary } from "../../../services/reportService";
import siteService, { type Site } from "../../../services/siteService";
import  useAuth  from "../../../context/AuthContext";
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
  site_id: string;
}

interface ExportOptions {
  format: ExportFormat;
  includeFilters: boolean;
  includeSummary: boolean;
  includeItems: boolean;
}

interface SitePerformance {
  site_id: string;
  site_name: string;
  total_requests: number;
  total_value: number;
  approved_requests: number;
  rejected_requests: number;
  pending_requests: number;
  average_processing_time: number;
}

const SitePerformanceReportsPage: React.FC = () => {
  const { user } = useAuth();
  const [sitePerformance, setSitePerformance] = useState<SitePerformance[]>([]);
  const [summary, setSummary] = useState<ReportSummary>({});
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortBy, setSortBy] = useState<keyof SitePerformance>("site_name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(8);
  const [operationStatus, setOperationStatus] = useState<OperationStatus | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [showFilters, setShowFilters] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedSite, setSelectedSite] = useState<SitePerformance | null>(null);
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'pdf',
    includeFilters: true,
    includeSummary: true,
    includeItems: true,
  });
  const [filters, setFilters] = useState<ReportFilters>({
    start_date: "",
    end_date: "",
    site_id: "",
  });

  const exportFormatOptions = [
    { value: 'pdf', label: 'PDF Report', icon: FileImage, description: 'Comprehensive formatted report' },
  ];

  useEffect(() => {
    loadSites();
    loadSitePerformanceReports();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortBy, sortOrder]);

  const loadSites = async () => {
    try {
      const sitesResponse = await siteService.getAllSites();
      setSites(sitesResponse.sites || []);
    } catch (err: any) {
      console.error("Failed to load sites:", err);
    }
  };

  const loadSitePerformanceReports = async () => {
    try {
      setLoading(true);
      const params: any = {};
      
      if (filters.start_date) params.date_from = filters.start_date;
      if (filters.end_date) params.date_to = filters.end_date;
      if (filters.site_id) params.site_id = parseInt(filters.site_id);

      const response = await reportService.getSitePerformanceReports(params);
      
      if (response.success && response.data) {
        const performanceArray = Object.entries(response.data.sitePerformance || {}).map(([site_id, data]) => ({
          site_id,
          ...data,
        }));
        setSitePerformance(performanceArray);
        setSummary({
          total_sites: response.data.total_sites || 0,
          total_requests: response.data.total_requests || 0,
          approved_requests: response.data.approved_requests || 0,
          pending_requests: response.data.pending_requests || 0,
          rejected_requests: response.data.rejected_requests || 0,
        });
      }
      setError(null);
    } catch (err: any) {
      setError(err.message || "Failed to load site performance reports");
      setSitePerformance([]);
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

  const exportToPDF = () => {
    const element = document.createElement('div');
    element.innerHTML = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Site Performance Reports</title>
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
                      <div><strong>Generated by:</strong> ${user?.full_name || 'Unknown User'}</div>
                      <div><strong>Phone:</strong> ${user?.phone || 'Unknown phone'} </div>
                      <div><strong>Email:</strong> ${user?.email || 'N/A'}</div>
                      <div><strong>Address:</strong> Nyarugenge, Rwanda</div>
                      </div>
                  </div>
              </div>
              <div class="report-info">
                  <div><strong>Report Type:</strong> Site Performance Reports</div>
                  <div><strong>Generated:</strong> ${new Date().toLocaleDateString('en-GB', { 
                      day: '2-digit', 
                      month: 'long', 
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                  })}</div>
                  <div><strong>Total Records:</strong> ${filteredSitePerformance.length}</div>
              </div>
          </div>
          
        

          <div class="report-title">Site Performance Reports</div>

          ${exportOptions.includeItems ? `
          <div class="table-container">
              <table>
                  <thead>
                      <tr>
                          <th>#</th>
                          <th>Site</th>
                          <th>Total Requests</th>
                          <th>Total Value</th>
                          <th>Approved</th>
                          <th>Rejected</th>
                          <th>Pending</th>
                          <th>Avg. Processing Time</th>
                      </tr>
                  </thead>
                  <tbody>
                      ${filteredSitePerformance.map((site, index) => `
                          <tr>
                              <td>${index + 1}</td>
                              <td>${site.site_name || '-'}</td>
                              <td>${formatNumber(site.total_requests)}</td>
                              <td>${formatCurrency(site.total_value)}</td>
                              <td>${formatNumber(site.approved_requests)}</td>
                              <td>${formatNumber(site.rejected_requests)}</td>
                              <td>${formatNumber(site.pending_requests)}</td>
                              <td>${formatTime(site.average_processing_time)}</td>
                          </tr>
                      `).join('')}
                  </tbody>
              </table>
          </div>
          ` : ''}

          <div class="footer">
              Generated by Catholic Diocese
          </div>
      </body>
      </html>
    `;

    const opt = {
      margin: [10, 10, 10, 10],
      filename: `site-performance-reports-${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().from(element).set(opt).save();
  };

  const handleExport = async () => {
    if (filteredSitePerformance.length === 0) {
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

  const filteredSitePerformance = useMemo(() => {
    let filtered = sitePerformance.filter(
      (site) =>
        (!searchTerm.trim() ||
          site.site_name?.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    filtered.sort((a, b) => {
      let aValue: any = a[sortBy];
      let bValue: any = b[sortBy];

      if (sortBy === "site_name") {
        aValue = aValue?.toLowerCase() || "";
        bValue = bValue?.toLowerCase() || "";
        return sortOrder === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }

      return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
    });

    return filtered;
  }, [sitePerformance, searchTerm, sortBy, sortOrder]);

  const handleFilterChange = (name: keyof ReportFilters, value: string) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    loadSitePerformanceReports();
    showOperationStatus("info", "Filters applied successfully");
  };

  const clearFilters = () => {
    setFilters({
      start_date: "",
      end_date: "",
      site_id: "",
    });
    loadSitePerformanceReports();
  };

  const formatNumber = (num: number | undefined): string => {
    return num !== undefined ? num.toString() : "-";
  };

  const formatCurrency = (value: number | undefined): string => {
    return value !== undefined ? `RWF ${value.toLocaleString()}` : "-";
  };

  const formatTime = (seconds: number | undefined): string => {
    if (seconds === undefined) return "-";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const totalPages = Math.ceil(filteredSitePerformance.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentSitePerformance = filteredSitePerformance.slice(startIndex, endIndex);

  const handleViewDetails = (site: SitePerformance) => {
    setSelectedSite(site);
    setShowViewModal(true);
  };

  const renderTableView = () => (
    <div className="bg-white rounded border border-gray-200">
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-2 px-2 text-gray-600 font-medium">#</th>
              <th 
                className="text-left py-2 px-2 text-gray-600 font-medium cursor-pointer hover:bg-gray-100" 
                onClick={() => {
                  setSortBy("site_name");
                  setSortOrder(sortBy === "site_name" && sortOrder === "asc" ? "desc" : "asc");
                }}
              >
                <div className="flex items-center space-x-1">
                  <span>Site</span>
                  <ChevronDown className={`w-3 h-3 ${sortBy === "site_name" ? "text-primary-600" : "text-gray-400"}`} />
                </div>
              </th>
              <th 
                className="text-left py-2 px-2 text-gray-600 font-medium cursor-pointer hover:bg-gray-100 hidden sm:table-cell" 
                onClick={() => {
                  setSortBy("total_requests");
                  setSortOrder(sortBy === "total_requests" && sortOrder === "asc" ? "desc" : "asc");
                }}
              >
                <div className="flex items-center space-x-1">
                  <span>Total Requests</span>
                  <ChevronDown className={`w-3 h-3 ${sortBy === "total_requests" ? "text-primary-600" : "text-gray-400"}`} />
                </div>
              </th>
              <th 
                className="text-left py-2 px-2 text-gray-600 font-medium cursor-pointer hover:bg-gray-100 hidden lg:table-cell" 
                onClick={() => {
                  setSortBy("total_value");
                  setSortOrder(sortBy === "total_value" && sortOrder === "asc" ? "desc" : "asc");
                }}
              >
                <div className="flex items-center space-x-1">
                  <span>Total Value</span>
                  <ChevronDown className={`w-3 h-3 ${sortBy === "total_value" ? "text-primary-600" : "text-gray-400"}`} />
                </div>
              </th>
              <th className="text-left py-2 px-2 text-gray-600 font-medium hidden lg:table-cell">Approved</th>
              <th className="text-left py-2 px-2 text-gray-600 font-medium hidden lg:table-cell">Rejected</th>
              <th className="text-left py-2 px-2 text-gray-600 font-medium hidden lg:table-cell">Pending</th>
              <th className="text-left py-2 px-2 text-gray-600 font-medium hidden xl:table-cell">Avg. Processing Time</th>
              <th className="text-left py-2 px-2 text-gray-600 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {currentSitePerformance.map((site, index) => (
              <tr key={site.site_id} className="hover:bg-gray-25">
                <td className="py-2 px-2 text-gray-700">{startIndex + index + 1}</td>
                <td className="py-2 px-2 font-medium text-gray-900 text-xs">{site.site_name || "-"}</td>
                <td className="py-2 px-2 text-gray-700 hidden sm:table-cell">{formatNumber(site.total_requests)}</td>
                <td className="py-2 px-2 text-gray-700 hidden lg:table-cell">{formatCurrency(site.total_value)}</td>
                <td className="py-2 px-2 text-gray-700 hidden lg:table-cell">{formatNumber(site.approved_requests)}</td>
                <td className="py-2 px-2 text-gray-700 hidden lg:table-cell">{formatNumber(site.rejected_requests)}</td>
                <td className="py-2 px-2 text-gray-700 hidden lg:table-cell">{formatNumber(site.pending_requests)}</td>
                <td className="py-2 px-2 text-gray-700 hidden xl:table-cell">{formatTime(site.average_processing_time)}</td>
                <td className="py-2 px-2">
                  <button
                    onClick={() => handleViewDetails(site)}
                    className="text-primary-600 hover:text-primary-700 text-xs flex items-center space-x-1"
                  >
                    <Eye className="w-3 h-3" />
                    <span>View Details</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      {currentSitePerformance.map((site) => (
        <div key={site.site_id} className="bg-white rounded border border-gray-200 p-3 hover:shadow-sm transition-shadow">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <MapPin className="w-4 h-4 text-primary-700" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-gray-900 text-xs truncate">{site.site_name || "-"}</div>
            </div>
          </div>
          <div className="space-y-1 mb-3">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-gray-600">Total Requests:</span> {formatNumber(site.total_requests)}
              </div>
              <div>
                <span className="text-gray-600">Total Value:</span> {formatCurrency(site.total_value)}
              </div>
              <div>
                <span className="text-gray-600">Approved:</span> {formatNumber(site.approved_requests)}
              </div>
              <div>
                <span className="text-gray-600">Rejected:</span> {formatNumber(site.rejected_requests)}
              </div>
              <div>
                <span className="text-gray-600">Pending:</span> {formatNumber(site.pending_requests)}
              </div>
              <div>
                <span className="text-gray-600">Avg. Time:</span> {formatTime(site.average_processing_time)}
              </div>
            </div>
          </div>
          <button
            onClick={() => handleViewDetails(site)}
            className="w-full text-primary-600 hover:text-primary-700 text-xs flex items-center justify-center space-x-1 border-t border-gray-100 pt-2"
          >
            <Eye className="w-3 h-3" />
            <span>View Details</span>
          </button>
        </div>
      ))}
    </div>
  );

  const renderListView = () => (
    <div className="bg-white rounded border border-gray-200 divide-y divide-gray-100">
      {currentSitePerformance.map((site) => (
        <div key={site.site_id} className="px-4 py-3 hover:bg-gray-25">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5 text-primary-700" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 text-sm truncate">{site.site_name || "-"}</div>
              </div>
            </div>
            <div className="hidden md:grid grid-cols-3 gap-4 text-xs text-gray-600 flex-1 max-w-xl px-4">
              <span className="truncate">Total: {formatNumber(site.total_requests)}</span>
              <span className="truncate">Value: {formatCurrency(site.total_value)}</span>
              <span className="truncate">Pending: {formatNumber(site.pending_requests)}</span>
            </div>
            <button
              onClick={() => handleViewDetails(site)}
              className="text-primary-600 hover:text-primary-700 text-xs flex items-center space-x-1"
            >
              <Eye className="w-3 h-3" />
              <span>View Details</span>
            </button>
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
          Showing {startIndex + 1}-{Math.min(endIndex, filteredSitePerformance.length)} of {filteredSitePerformance.length}
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="flex items-center px-2 py-1 text-xs text-gray-500 bg-white border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Previous Page"
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
              aria-label={`Page ${page}`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="flex items-center px-2 py-1 text-xs text-gray-500 bg-white border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Next Page"
          >
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  };

  const renderViewModal = () => {
    if (!showViewModal || !selectedSite) return null;
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Site Performance Details</h3>
            <button
              onClick={() => setShowViewModal(false)}
              className="text-gray-400 hover:text-gray-600 p-1"
              aria-label="Close Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-3 text-xs">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-primary-600" />
              <div>
                <span className="font-medium text-gray-700">Site Name:</span> {selectedSite.site_name || "-"}
              </div>
            </div>
            <div>
              <span className="font-medium text-gray-700">Site ID:</span> {selectedSite.site_id || "-"}
            </div>
            <div>
              <span className="font-medium text-gray-700">Total Requests:</span> {formatNumber(selectedSite.total_requests)}
            </div>
            <div>
              <span className="font-medium text-gray-700">Total Value:</span> {formatCurrency(selectedSite.total_value)}
            </div>
            <div>
              <span className="font-medium text-gray-700">Approved Requests:</span> {formatNumber(selectedSite.approved_requests)}
            </div>
            <div>
              <span className="font-medium text-gray-700">Rejected Requests:</span> {formatNumber(selectedSite.rejected_requests)}
            </div>
            <div>
              <span className="font-medium text-gray-700">Pending Requests:</span> {formatNumber(selectedSite.pending_requests)}
            </div>
            <div>
              <span className="font-medium text-gray-700">Avg. Processing Time:</span> {formatTime(selectedSite.average_processing_time)}
            </div>
          </div>
          <div className="flex justify-end pt-4 border-t border-gray-200 mt-4">
            <button
              onClick={() => setShowViewModal(false)}
              className="px-4 py-2 text-sm border border-gray-200 rounded hover:bg-gray-50 text-gray-700"
            >
              Close
            </button>
          </div>
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
                aria-label="Toggle Sidebar"
              >
                <Minimize2 className="w-4 h-4" />
              </button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Site Performance Reports</h1>
                <p className="text-xs text-gray-500 mt-0.5">Analyze and track site request performance</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowExportModal(true)}
                disabled={loading || filteredSitePerformance.length === 0}
                className="flex items-center space-x-1 px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Export Reports"
                aria-label="Export Reports"
              >
                <Download className="w-3 h-3" />
                <span>Export</span>
              </button>
              <button
                onClick={loadSitePerformanceReports}
                disabled={loading}
                className="flex items-center space-x-1 px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-200 rounded hover:bg-gray-50 disabled:opacity-50"
                title="Refresh"
                aria-label="Refresh Reports"
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
                  placeholder="Search sites..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-48 pl-7 pr-3 py-1.5 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-transparent"
                  aria-label="Search sites"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-1 px-2 py-1.5 text-xs border rounded transition-colors ${
                  showFilters ? 'bg-primary-50 border-primary-200 text-primary-700' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
                aria-label="Toggle Filters"
              >
                <Filter className="w-3 h-3" />
                <span>Filter</span>
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split("-") as [keyof SitePerformance, "asc" | "desc"];
                  setSortBy(field);
                  setSortOrder(order);
                }}
                className="text-xs border border-gray-200 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-primary-500"
                aria-label="Sort Options"
              >
                <option value="site_name-asc">Site Name (A-Z)</option>
                <option value="site_name-desc">Site Name (Z-A)</option>
                <option value="total_requests-desc">Most Requests</option>
                <option value="total_requests-asc">Fewest Requests</option>
                <option value="total_value-desc">Highest Value</option>
                <option value="total_value-asc">Lowest Value</option>
                <option value="average_processing_time-desc">Longest Processing Time</option>
                <option value="average_processing_time-asc">Shortest Processing Time</option>
              </select>
              <div className="flex items-center border border-gray-200 rounded">
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 text-xs transition-colors ${
                    viewMode === 'table' ? 'bg-primary-50 text-primary-600' : 'text-gray-400 hover:text-gray-600'
                  }`}
                  title="Table View"
                  aria-label="Table View"
                >
                  <List className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 text-xs transition-colors ${
                    viewMode === 'grid' ? 'bg-primary-50 text-primary-600' : 'text-gray-400 hover:text-gray-600'
                  }`}
                  title="Grid View"
                  aria-label="Grid View"
                >
                  <Grid3X3 className="w-3 h-3" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 text-xs transition-colors ${
                    viewMode === 'list' ? 'bg-primary-50 text-primary-600' : 'text-gray-400 hover:text-gray-600'
                  }`}
                  title="List View"
                  aria-label="List View"
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
                    aria-label="Start Date"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={filters.end_date}
                    onChange={(e) => handleFilterChange('end_date', e.target.value)}
                    className="w-full text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    aria-label="End Date"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Site</label>
                  <select
                    value={filters.site_id}
                    onChange={(e) => handleFilterChange('site_id', e.target.value)}
                    className="w-full text-xs border border-gray-200 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary-500"
                    aria-label="Select Site"
                  >
                    <option value="">All Sites</option>
                    {sites.map((site) => (
                      <option key={site.id} value={site.id?.toString()}>{site.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={applyFilters}
                  className="px-3 py-1.5 text-xs bg-primary-600 text-white rounded hover:bg-primary-700"
                  aria-label="Apply Filters"
                >
                  Apply Filters
                </button>
                <button
                  onClick={clearFilters}
                  className="px-3 py-1.5 text-xs text-gray-600 border border-gray-200 rounded hover:bg-gray-50"
                  aria-label="Clear Filters"
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
              <span className="text-xs">Loading site performance reports...</span>
            </div>
          </div>
        ) : currentSitePerformance.length === 0 ? (
          <div className="bg-white rounded border border-gray-200 p-8 text-center text-gray-500">
            <div className="text-xs">
              {searchTerm || filters.site_id || filters.start_date || filters.end_date ? 'No site performance found matching your criteria' : 'No site performance reports found'}
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

        {renderViewModal()}

        {showExportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Export Reports</h3>
                <button
                  onClick={() => setShowExportModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                  aria-label="Close Export Modal"
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
                        aria-label="Include Filters"
                      />
                      <span className="text-sm text-gray-700">Applied filters information</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={exportOptions.includeSummary}
                        onChange={(e) => setExportOptions(prev => ({ ...prev, includeSummary: e.target.checked }))}
                        className="mr-2"
                        aria-label="Include Summary"
                      />
                      <span className="text-sm text-gray-700">Summary statistics</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={exportOptions.includeItems}
                        onChange={(e) => setExportOptions(prev => ({ ...prev, includeItems: e.target.checked }))}
                        className="mr-2"
                        aria-label="Include Site Details"
                      />
                      <span className="text-sm text-gray-700">Site performance details</span>
                    </label>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded p-3">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-blue-700">
                      <p className="font-medium mb-1">Export Information</p>
                      <p>This will export {filteredSitePerformance.length} record{filteredSitePerformance.length !== 1 ? 's' : ''} based on your current filters and search criteria.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200 mt-6">
                <button
                  onClick={() => setShowExportModal(false)}
                  className="px-4 py-2 text-sm border border-gray-200 rounded hover:bg-gray-50 text-gray-700"
                  aria-label="Cancel Export"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExport}
                  disabled={exporting}
                  className="px-4 py-2 text-sm bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  aria-label="Export Report"
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
              <button onClick={() => setOperationStatus(null)} className="hover:opacity-70" aria-label="Close Notification">
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SitePerformanceReportsPage;