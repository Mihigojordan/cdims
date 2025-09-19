/* eslint-disable react-refresh/only-export-components */
import React, { type FC, lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import Home from '../pages/landing/Home';
import MainLayout from '../layout/MainLayout';
import BlogsPage from '../pages/landing/BlogsPage';
import BlogViewPage from '../components/landing/BlogViewPage';
import AuthLayout from '../layout/AuthLayout';
import AdminLogin from '../pages/auth/Login';
import logo from '../assets/images/aby_hr.png';
import UnlockScreen from '../pages/auth/UnlockScreen';
import DashboardLayout from '../layout/DashboardLayout';
import DashboardHome from '../pages/dashboard/DashboardHome';
import ProtectPrivateAdminRoute from '../components/protectors/ProtectPrivateAdminRoute';
import AdminProfile from '../pages/dashboard/AdminProfile';
import StoreManagement from '../pages/dashboard/StoreManagement';
import EmployeeFormExample from '../components/dashboard/employee/EmployeeForm';
import ContractDashboard from '../pages/dashboard/ContractManagement';
import ViewEmployee from '../components/dashboard/employee/EmployeeViewMorePage';
import SitesManagement from '../pages/dashboard/SitesManagement';
import UpserJobPost from '../components/dashboard/recruitment/UpsertJobPost';
import JobView from '../components/dashboard/recruitment/JobView';
import JobBoard from '../pages/landing/JobBoard';
import JobPostView from '../components/landing/JobViewPage';
import JobApplicationForm from '../components/landing/ApplyJob';
import ApplicantView from '../components/dashboard/recruitment/ApplicantView';
import ClientManagement from '../pages/dashboard/ClientManagement';
import MaterialManagement from '../pages/dashboard/MaterialManagement';
import CategoryDashboard from '../pages/dashboard/CategoryManagement';
import UnitDashboard from '../pages/dashboard/UnitManagement';
import RoleManagement from '../pages/dashboard/RoleManagement';
import ReportManagement from '../pages/dashboard/ReportManagement'

import MaterialRequisition from '../pages/dashboard/MaterialRequisition';

import SiteAssignmentDashboard from '../pages/dashboard/SiteAssignmentDashboard';
import MaterialRequisitionDetail from '../pages/dashboard/MaterialRequisitionDetail';

const ProductPage = lazy(() => import('../pages/landing/FeaturesPage'));
const ServicesPage = lazy(() => import('../pages/landing/ServicePage'));
const ContactPage = lazy(() => import('../pages/landing/ContactUs'));
const AboutPage = lazy(() => import('../pages/landing/AboutPage'));
const StockManagement = lazy(() => import('../pages/dashboard/StockManagement'));


/**
 * Loading spinner component for Suspense fallback
 */
const LoadingSpinner: FC = () => (
  <div className="flex items-center justify-center h-screen bg-white">
    <img src={logo} alt="Loading..." className="h-40 animate-zoomInOut" />
  </div>
);

/**
 * Suspense wrapper for lazy-loaded components
 * @param props - Component props with children
 */
interface SuspenseWrapperProps {
  children: React.ReactNode;
}

const SuspenseWrapper: FC<SuspenseWrapperProps> = ({ children }) => {
  return <Suspense fallback={<LoadingSpinner />}>{children}</Suspense>;
};

/**
 * Application routes configuration
 */
const routes = createBrowserRouter([
  {
    path: '/',
    element: <Outlet />,
    children: [
      {
        path: '',
        element: <MainLayout />,
        children: [
          {
            index: true,
            element: (
              <SuspenseWrapper>
                <Home />
              </SuspenseWrapper>
            ),
          },
          {
            path: 'about',
            element: (
              <SuspenseWrapper>
                <AboutPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: 'features',
            element: (
              <SuspenseWrapper>
                <ProductPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: 'solutions',
            element: (
              <SuspenseWrapper>
                <ServicesPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: 'jobs',
            element: (
              <SuspenseWrapper>
                <JobBoard />
              </SuspenseWrapper>
            ),
          },
          {
            path: 'jobs',
            element: (
              <SuspenseWrapper>
                <JobBoard />
              </SuspenseWrapper>
            ),
          },
          {
            path: 'jobs/:id',
            element: (
              <SuspenseWrapper>
                <JobPostView />
              </SuspenseWrapper>
            ),
          },
          {
            path: '/jobs/apply-job/:id',
            element: (
              <SuspenseWrapper>
                <JobApplicationForm />
              </SuspenseWrapper>
            ),
          },
          {
            path: 'contact',
            element: (
              <SuspenseWrapper>
                <ContactPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: 'blogs',
            element: (
              <SuspenseWrapper>
                <BlogsPage />
              </SuspenseWrapper>
            ),
          },
          {
            path: 'blogs/:id',
            element: (
              <SuspenseWrapper>
                <BlogViewPage />
              </SuspenseWrapper>
            ),
          },
        ],
      },
      {
        path: 'admin',
        element: (
          <SuspenseWrapper>
            <ProtectPrivateAdminRoute>
              <Outlet />
            </ProtectPrivateAdminRoute>
          </SuspenseWrapper>
        ),
        children: [
          {
            index: true,
            element: <Navigate to="/admin/dashboard" replace />,
          },
          {
            path: 'dashboard',
            element: <DashboardLayout />,
            children: [
              {
                path: '',
                element: (
                  <SuspenseWrapper>
                    <DashboardHome />
                  </SuspenseWrapper>
                ),
              },
              {
                path: 'profile',
                element: (
                  <SuspenseWrapper>
                    <AdminProfile />
                  </SuspenseWrapper>
                ),
              },
              {
                path: 'stock-management',
                element: (
                  <SuspenseWrapper>
                    <StockManagement />
                  </SuspenseWrapper>
                ),
              },
              {
                path: 'store-management',
                element: (
                  <SuspenseWrapper>
                    <StoreManagement />
                  </SuspenseWrapper>
                ),
              },
              {
                path: 'employee-management/:id',
                element: (
                  <SuspenseWrapper>
                    <ViewEmployee />
                  </SuspenseWrapper>
                ),
              },
              {
                path: 'employee-management/create',
                element: (
                  <SuspenseWrapper>
                    <EmployeeFormExample />
                  </SuspenseWrapper>
                ),
              },
              {
                path: 'employee-management/update/:id',
                element: (
                  <SuspenseWrapper>
                    <EmployeeFormExample />
                  </SuspenseWrapper>
                ),
              },
              {
                path: 'material-management',
                element: (
                  <SuspenseWrapper>
                    <MaterialManagement />
                  </SuspenseWrapper>
                ),
              },
              {
                path: 'category-management',
                element: (
                  <SuspenseWrapper>
                    <CategoryDashboard />
                  </SuspenseWrapper>
                ),
              },
              {
                path: 'units-management',
                element: (
                  <SuspenseWrapper>
                    <UnitDashboard />
                  </SuspenseWrapper>
                ),
              },
              {
                path: 'contract-management',
                element: (
                  <SuspenseWrapper>
                    <ContractDashboard />
                  </SuspenseWrapper>
                ),
              },
              {
                path: 'site-management',
                element: (
                  <SuspenseWrapper>
                    <SitesManagement />
                  </SuspenseWrapper>
                ),
              },
              {
                path: 'site-assign-management',
                element: (
                  <SuspenseWrapper>
                    <SiteAssignmentDashboard />
                  </SuspenseWrapper>
                ),
              },
              {
                path: 'recruiting-management/create',
                element: (
                  <SuspenseWrapper>
                    <UpserJobPost />
                  </SuspenseWrapper>
                ),
              },
              {
                path: 'recruiting-management/update/:id',
                element: (
                  <SuspenseWrapper>
                    <UpserJobPost />
                  </SuspenseWrapper>
                ),
              },
              {
                path: 'recruiting-management/:id',
                element: (
                  <SuspenseWrapper>
                    <JobView />
                  </SuspenseWrapper>
                ),
              },
              {
                path: 'recruiting-management/:jobId/applicants/:applicantId',
                element: (
                  <SuspenseWrapper>
                    <ApplicantView />
                  </SuspenseWrapper>
                ),
              },
              {
                path: 'client-management',
                element: (
                  <SuspenseWrapper>
                    <ClientManagement />
                  </SuspenseWrapper>
                ),
              },
              {
                path: 'report',
                element: (
                  <SuspenseWrapper>
                    <ReportManagement />
                  </SuspenseWrapper>
                ),
              },
              {
                path: 'role-management',
                element: (
                  <SuspenseWrapper>
                    <RoleManagement />
                  </SuspenseWrapper>
                ),
              },
                  {
                path: 'material-requisition',
                element: (
                  <SuspenseWrapper>
                     <MaterialRequisition />
                  </SuspenseWrapper>
                ),
              },
                 {
                path: 'material-requisition/:id',
                element: (
                  <SuspenseWrapper>
                     <MaterialRequisitionDetail />
                  </SuspenseWrapper>
                ),
              },
            ],
          },
        ],
      },
    ],
  },
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      {
        path: 'admin/login',
        element: (
          <SuspenseWrapper>
            <AdminLogin />
          </SuspenseWrapper>
        ),
      },
      {
        path: 'admin/unlock',
        element: (
          <SuspenseWrapper>
            <UnlockScreen />
          </SuspenseWrapper>
        ),
      },
    ],
  },
]);

export default routes;

