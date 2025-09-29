import { ShieldAlert, Lock, ArrowLeft, AlertCircle } from 'lucide-react';

export default function AccessRestricted() {
  const allowedRoles = [
    'PADIRI',
    'ADMIN',
    'SITE_ENGINEER',
    'STOREKEEPER',
    'DIOCESAN_SITE_ENGINEER'
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-lg w-full">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header with orange accent */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-6 text-center">
            <div className="mx-auto w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 shadow-lg">
              <ShieldAlert className="w-10 h-10 text-orange-600" strokeWidth={2.5} />
            </div>
            <h1 className="text-2xl font-bold text-white mb-1">
              Access Denied
            </h1>
            <p className="text-orange-100 text-sm">
              Authorization Required
            </p>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Alert message */}
            <div className="flex items-start gap-3 bg-orange-50 border-l-4 border-orange-500 rounded-r-lg p-4 mb-6">
              <AlertCircle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-gray-900 font-medium text-sm mb-1">
                  Permission Required
                </p>
                <p className="text-gray-600 text-sm leading-relaxed">
                  You don't have the necessary permissions to access this page. Please contact your administrator if you believe this is an error.
                </p>
              </div>
            </div>

            {/* Allowed Roles Section */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-lg">
                  <Lock className="w-4 h-4 text-gray-700" />
                </div>
                <h2 className="text-base font-bold text-gray-900">
                  Required Roles
                </h2>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {allowedRoles.map((role) => (
                  <div
                    key={role}
                    className="flex items-center gap-2 px-4 py-3 rounded-lg bg-gray-50 border border-gray-200 hover:border-orange-400 hover:bg-orange-50 transition-all group"
                  >
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                      {role.replace(/_/g, ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={() => window.history.back()}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
              >
                <ArrowLeft className="w-5 h-5" />
                Go Back to Previous Page
              </button>
              
              {/* <button
                onClick={() => window.location.href = '/'}
                className="w-full bg-white hover:bg-gray-50 text-gray-700 font-medium py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 border-2 border-gray-200 hover:border-gray-300"
              >
                Return to Home
              </button> */}
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-8 py-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              Need help? Contact your system administrator for access requests
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}