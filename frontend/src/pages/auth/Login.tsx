/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from "react";
import { Eye, EyeOff, Building2 } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import  useAuth from "../../context/AuthContext";

// Define interfaces
interface FormData {
  email: string;
  password: string;
}

interface Errors {
  email?: string;
  password?: string;
  general?: string;
}

interface Touched {
  email?: boolean;
  password?: boolean;
}

const AdminLogin: React.FC = () => {
  const { login, isLoading: authLoading, isAuthenticated } = useAuth() ;

  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<Errors>({});
  const [touched, setTouched] = useState<Touched>({});

  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      const from = location.state?.from?.pathname || "/admin/dashboard";
      navigate(from);
    }
  }, [isAuthenticated, authLoading, location, navigate]);

  // Real-time validation functions
  const validateEmail = (email: string): string => {
    if (!email) {
      return "Email is required";
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      return "Please enter a valid email address";
    }
    return "";
  };

  const validatePassword = (password: string): string => {
    if (!password) {
      return "Password is required";
    }
    if (password.length < 6) {
      return "Password must be at least 6 characters";
    }
    return "";
  };

  // Validate field on change
  const validateField = (name: keyof FormData, value: string): string => {
    switch (name) {
      case "email":
        return validateEmail(value);
      case "password":
        return validatePassword(value);
      default:
        return "";
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Update form data
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Mark field as touched
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    // Validate field in real-time if it has been touched
    if (touched[name as keyof Touched] || value !== "") {
      const error = validateField(name as keyof FormData, value);
      setErrors((prev) => ({
        ...prev,
        [name]: error,
      }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Mark field as touched on blur
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    // Validate field
    const error = validateField(name as keyof FormData, value);
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const validateForm = (): Errors => {
    const newErrors: Errors = {
      email: validateEmail(formData.email),
      password: validatePassword(formData.password),
    };

    // Filter out empty errors
    Object.keys(newErrors).forEach((key) => {
      if (!newErrors[key as keyof Errors]) {
        delete newErrors[key as keyof Errors];
      }
    });

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({
      email: true,
      password: true,
    });

    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      const response = await login({
        email: formData.email,
        password: formData.password,
      });

      if (response.success) {
        const from = location.state?.from?.pathname || "/admin/dashboard";
        navigate(from);
      } else {
        setErrors({ general: response.message || "Login failed" });
      }
    } catch (error: any) {
      console.error("Login error:", error);
      setErrors({
        general: error.message || "An error occurred during login. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Check if form is valid
  const isFormValid = (): boolean => {
    return !!formData.email && !!formData.password && !errors.email && !errors.password;
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-orange-300 rounded-full opacity-20 blur-xl"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-orange-200 rounded-full opacity-30 blur-lg"></div>
        <div className="absolute bottom-32 left-20 w-40 h-40 bg-orange-300 rounded-full opacity-15 blur-2xl"></div>
        <div className="absolute bottom-20 right-10 w-20 h-20 bg-orange-200 rounded-full opacity-25 blur-lg"></div>
      </div>

      {/* Left side - Brand and illustration */}
      <div
        className="w-5/12 flex items-center justify-center p-8 relative z-10 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url("https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80")`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-orange-600/75 to-orange-500/85"></div>
        <div className="max-w-lg text-white relative z-10">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 shadow-2xl">
            <h1 className="text-4xl font-bold mb-6 text-white">
              Empowering people through seamless HR management.
            </h1>
            <p className="text-orange-100 text-lg leading-relaxed">
              Efficiently manage your workforce, streamline operations effortlessly.
            </p>
          </div>
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="w-7/12 bg-white flex flex-col justify-center p-8 relative z-10">
        <div className="w-full max-w-xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mr-3">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">CDIMS</h2>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Sign In</h3>
            <p className="text-gray-600 text-sm">Please enter your details to sign in</p>
          </div>

          {/* Error message */}
          {errors.general && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{errors.general}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                onBlur={handleBlur}
                className={`w-full px-4 py-3 rounded-lg border transition-colors duration-200 ${
                  errors.email
                    ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500/20"
                    : "border-gray-300 focus:border-orange-500 focus:ring-orange-500/20"
                } focus:outline-none focus:ring-4`}
                placeholder="Enter your email"
                disabled={isLoading || authLoading}
              />
              {errors.email && touched.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className={`w-full px-4 py-3 pr-12 rounded-lg border transition-colors duration-200 ${
                    errors.password
                      ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-red-500/20"
                      : "border-gray-300 focus:border-orange-500 focus:ring-orange-500/20"
                  } focus:outline-none focus:ring-4`}
                  placeholder="Enter your password"
                  disabled={isLoading || authLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                  disabled={isLoading || authLoading}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && touched.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Forgot Password */}
            <div className="flex items-center justify-end">
              <button
                type="button"
                className="text-sm text-orange-600 hover:text-orange-700 font-medium"
                onClick={() => console.log('Forgot password clicked')}
              >
                Forgot Password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || authLoading || !isFormValid()}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-4 rounded-lg font-medium hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-4 focus:ring-orange-500/30 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg"
            >
              {isLoading || authLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Signing in...
                </div>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="text-center mt-8">
            <p className="text-xs text-gray-500">
              Copyright © 2024 - CDIMS
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;