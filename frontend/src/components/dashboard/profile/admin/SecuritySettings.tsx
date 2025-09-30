import React, { useEffect, useState } from 'react';
import { Shield, Power } from 'lucide-react';
import  useAuth ,{ type AuthContextType } from '../../../../context/AuthContext';
import Swal from 'sweetalert2';
import authService from '../../../../services/authService';
import ChangePasswordModal from './security/ChangePasswordModal';
import { logout } from '../../../../services/adminAuthService';
import { useLocation, useNavigate } from 'react-router-dom';

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({ isOpen, onClose }) => {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
const { user,logout } = useAuth() as AuthContextType;
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setError('Password is required');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await authService.deleteAccount(password);
      await logout();
      localStorage.removeItem('auth_token');
      Swal.fire({
        title: 'Account Deleted',
        text: 'Your account has been permanently deleted.',
        icon: 'success',
        confirmButtonText: 'OK',
        confirmButtonColor: '#2563eb',
        textColor: '#1f2937',
        titleColor: '#1f2937',
      });
      onClose();
    } catch (error: any) {
      Swal.fire({
        title: 'Deletion Failed',
        text: error.message || 'Failed to delete account. Please try again.',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#ef4444',
        textColor: '#1f2937',
        titleColor: '#1f2937',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Delete Account</h2>
        <p className="text-sm text-gray-600 mb-4">
          Please enter your password to confirm account deletion. This action is permanent and cannot be undone.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-primary-500'
              }`}
              placeholder="Enter your password"
              disabled={isLoading}
            />
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Deleting...' : 'Delete Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const SecuritySettings: React.FC = () => {
  const { user } = useAuth() as AuthContextType;
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [isDeleteAccountModalOpen, setIsDeleteAccountModalOpen] = useState(false);
  const location =  useLocation();
  const navigate  = useNavigate();
useEffect(() => {
  const passwordChangeRequired = location.state?.passwordChangeRequired;
  
  if (passwordChangeRequired) {
    Swal.fire({
      icon: 'warning',
      title: 'Password Change Required',
      text: 'You must change your password before accessing other features.',
      confirmButtonText: 'OK',
      confirmButtonColor: '#3085d6',
      allowOutsideClick: false,
    });

    // Clear state
    navigate(location.pathname + location.search, { 
      replace: true, 
      state: {} 
    });
  }
}, [location,navigate]);

  const handleChangePassword = () => {
    setIsChangePasswordModalOpen(true);
  };

  const handleDeleteAccount = () => {
    setIsDeleteAccountModalOpen(true);
  };

  return (
    <div className="space-y-4">
      {/* Password Section */}
      <div className="flex items-center justify-between py-3 border-b border-gray-100">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-gray-900 mb-0.5">Password</h3>
          <p className="text-xs text-gray-500 mb-0.5">Set a unique password to protect the account</p>
          <p className="text-xs text-gray-400">Last Changed 03 Jan 2024, 09:00 AM</p>
        </div>
        <button
          onClick={handleChangePassword}
          className="px-3 py-1.5 bg-primary-500 text-white text-xs font-medium rounded hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          Change Password
        </button>
      </div>

      {/* Delete Account */}
      <div className="flex items-center justify-between py-3">
        <div className="flex-1">
          <h3 className="text-sm font-medium text-red-600 mb-0.5">Delete Account</h3>
          <p className="text-xs text-gray-500">Your account will be permanently deleted</p>
        </div>
        <button
          onClick={handleDeleteAccount}
          className="px-3 py-1.5 bg-primary-500 text-white text-xs font-medium rounded hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          Delete
        </button>
      </div>

      {/* Modals */}
      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
        adminId={user?.id.toString() || ''}
      />
      <DeleteAccountModal
        isOpen={isDeleteAccountModalOpen}
        onClose={() => setIsDeleteAccountModalOpen(false)}
      />
    </div>
  );
};

export default SecuritySettings;