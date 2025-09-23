import React, { useState, useEffect, useMemo } from 'react';
import { X, User, Mail, Phone, Plus, RefreshCw, UserCheck } from 'lucide-react';
import { 
    parsePhoneNumberFromString, 
    isValidPhoneNumber, 
    getCountries, 
    getCountryCallingCode,
    AsYouType,
    type CountryCode
} from 'libphonenumber-js';
import userService, { type CreateUserInput } from '../../../services/userService';
import roleService, { type Role } from '../../../services/roleService';

interface AddEmployeeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: CreateUserInput) => Promise<void>;
}

// Get country data from libphonenumber-js
const getCountryData = () => {
    const countries = getCountries();
    return countries.map(countryCode => {
        const callingCode = getCountryCallingCode(countryCode);
        // You might want to add a country name mapping here
        const countryNames: Record<string, string> = {
            'US': 'United States',
            'GB': 'United Kingdom', 
            'CA': 'Canada',
            'AU': 'Australia',
            'DE': 'Germany',
            'FR': 'France',
            'IN': 'India',
            'CN': 'China',
            'JP': 'Japan',
            'BR': 'Brazil',
            'MX': 'Mexico',
            'IT': 'Italy',
            'ES': 'Spain',
            'RU': 'Russia',
            'KR': 'South Korea',
            // Add more as needed
        };
        
        return {
            code: countryCode,
            callingCode: `+${callingCode}`,
            name: countryNames[countryCode] || countryCode,
            displayName: `${countryNames[countryCode] || countryCode} (+${callingCode})`
        };
    }).sort((a, b) => a.name.localeCompare(b.name));
};

const AddEmployeeModal = ({ isOpen, onClose, onSave }: AddEmployeeModalProps) => {
    const [formData, setFormData] = useState<CreateUserInput>({
        full_name: '',
        email: '',
        phone: '',
        password: '',
        role_id: 0,
        active: true
    });
    
    const [selectedCountry, setSelectedCountry] = useState<CountryCode>('RW');
    const [phoneInput, setPhoneInput] = useState('');
    const [formattedPhone, setFormattedPhone] = useState('');
    
    const [roles, setRoles] = useState<Role[]>([]);
    const [errors, setErrors] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoadingRoles, setIsLoadingRoles] = useState(false);

    // Get country data using libphonenumber-js (removed as not needed for single input)
    
    // Get current country info (removed as not needed for single input)

    // Load roles when modal opens
    useEffect(() => {
        if (isOpen) {
            loadRoles();
        }
    }, [isOpen]);

    // Reset form when modal closes
    useEffect(() => {
        if (!isOpen) {
            setFormData({
                full_name: '',
                email: '',
                phone: '',
                password: '',
                role_id: 0,
                active: true
            });
            setSelectedCountry('RW');
            setPhoneInput('');
            setFormattedPhone('');
            setErrors([]);
        }
    }, [isOpen]);

    // Format phone number as user types
    useEffect(() => {
        if (phoneInput) {
            // Check if input already starts with country code
            let inputToFormat = phoneInput;
            const countryCallingCode = getCountryCallingCode(selectedCountry);
            
            // If input doesn't start with +, add the country code
            if (!phoneInput.startsWith('+')) {
                inputToFormat = `+${countryCallingCode}${phoneInput}`;
            }
            
            const asYouType = new AsYouType();
            const formatted = asYouType.input(inputToFormat);
            setFormattedPhone(formatted);
            
            // Update form data with the full international number
            const phoneNumber = parsePhoneNumberFromString(inputToFormat);
            if (phoneNumber && phoneNumber.isValid()) {
                setFormData(prev => ({ ...prev, phone: phoneNumber.number }));
            }
        } else {
            setFormattedPhone('');
            setFormData(prev => ({ ...prev, phone: '' }));
        }
    }, [phoneInput, selectedCountry]);

    const loadRoles = async () => {
        setIsLoadingRoles(true);
        try {
            const response = await roleService.getAllRoles();
            const rolesData = Array.isArray(response.data?.roles) ? response.data.roles : [];
            setRoles(rolesData);
        } catch (error: any) {
            console.error('Error loading roles:', error);
            setErrors([error.message || 'Failed to load roles']);
        } finally {
            setIsLoadingRoles(false);
        }
    };

    const generateRandomPassword = () => {
        try {
            const length = 12;
            const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
            let password = "";
            for (let i = 0; i < length; i++) {
                const randomIndex = Math.floor(Math.random() * charset.length);
                password += charset.charAt(randomIndex);
            }
            setFormData((prev) => ({ ...prev, password }));
            if (errors.length > 0) {
                setErrors([]);
            }
        } catch (error) {
            console.error('Error generating password:', error);
            setErrors(['Failed to generate password']);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        try {
            const { name, value, type } = e.target;
            let processedValue: any = value;
            if (type === 'checkbox') {
                processedValue = (e.target as HTMLInputElement).checked;
            } else if (name === 'role_id') {
                processedValue = value ? parseInt(value, 10) : 0;
            }
            setFormData((prev) => ({ ...prev, [name]: processedValue }));
            if (errors.length > 0) {
                setErrors([]);
            }
        } catch (error) {
            console.error('Error handling form change:', error);
        }
    };

    const handlePhoneInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value;
        
        // If user starts typing without +, automatically add Rwanda country code
        if (value && !value.startsWith('+') && !phoneInput.startsWith('+')) {
            const rwandaCode = getCountryCallingCode('RW');
            // Only add the country code if the input doesn't already start with the country code digits
            if (!value.startsWith(rwandaCode.toString())) {
                setPhoneInput(value);
            } else {
                setPhoneInput(value);
            }
        } else {
            setPhoneInput(value);
        }
        
        if (errors.length > 0) {
            setErrors([]);
        }
    };



    const validateForm = (): { isValid: boolean; errors: string[] } => {
        const validationErrors: string[] = [];

        if (!formData.full_name || !formData.full_name.trim()) {
            validationErrors.push('Full name is required');
        }

        if (!formData.email || !formData.email.trim()) {
            validationErrors.push('Email is required');
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
            validationErrors.push('Please enter a valid email address');
        }

        if (!phoneInput.trim()) {
            validationErrors.push('Phone number is required');
        } else {
            // Try to parse with country code first, then fallback to Rwanda
            let phoneNumber = parsePhoneNumberFromString(phoneInput);
            if (!phoneNumber) {
                const rwandaCode = getCountryCallingCode('RW');
                const phoneWithCountryCode = phoneInput.startsWith('+') ? phoneInput : `+${rwandaCode}${phoneInput}`;
                phoneNumber = parsePhoneNumberFromString(phoneWithCountryCode);
            }
            
            if (!phoneNumber || !phoneNumber.isValid()) {
                validationErrors.push('Please enter a valid phone number');
            }
        }

        if (!formData.password || !formData.password.trim()) {
            validationErrors.push('Password is required');
        } else if (formData.password.trim().length < 6) {
            validationErrors.push('Password must be at least 6 characters long');
        }

        if (!formData.role_id || formData.role_id === 0) {
            validationErrors.push('Please select a role');
        }

        return {
            isValid: validationErrors.length === 0,
            errors: validationErrors
        };
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const validation = validateForm();
        if (!validation.isValid) {
            setErrors(validation.errors);
            setIsSubmitting(false);
            return;
        }

        try {
            // Parse phone number and ensure it's in international format
            let phoneNumber = parsePhoneNumberFromString(phoneInput);
            if (!phoneNumber) {
                const rwandaCode = getCountryCallingCode('RW');
                const phoneWithCountryCode = phoneInput.startsWith('+') ? phoneInput : `+${rwandaCode}${phoneInput}`;
                phoneNumber = parsePhoneNumberFromString(phoneWithCountryCode);
            }
            
            const saveData: CreateUserInput = {
                ...formData,
                phone: phoneNumber?.number || formData.phone
            };
            
            await onSave(saveData);
            setErrors([]);
            setFormData({
                full_name: '',
                email: '',
                phone: '',
                password: '',
                role_id: 0,
                active: true
            });
            setSelectedCountry('RW');
            setPhoneInput('');
            setFormattedPhone('');
            onClose();
        } catch (error: any) {
            const errorMessage = error.message || 'Failed to add employee';
            console.error('Error in handleSubmit:', error);
            setErrors([errorMessage]);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="bg-primary-500 rounded-t-lg p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-semibold text-white">Add New Employee</h2>
                            <p className="text-sm text-primary-100 mt-1">Create a new employee account</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1 text-primary-100 hover:text-white rounded"
                            aria-label="Close modal"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2 space-y-2">
                            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                                <User className="w-4 h-4 text-gray-400" />
                                <span>Full Name <span className="text-red-500">*</span></span>
                            </label>
                            <input
                                type="text"
                                name="full_name"
                                value={formData.full_name}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                                placeholder="Enter full name"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                                <Mail className="w-4 h-4 text-gray-400" />
                                <span>Email Address <span className="text-red-500">*</span></span>
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                                placeholder="Enter email address"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                                <Phone className="w-4 h-4 text-gray-400" />
                                <span>Phone Number <span className="text-red-500">*</span></span>
                            </label>
                            <input
                                type="tel"
                                value={formattedPhone || phoneInput}
                                onChange={handlePhoneInputChange}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                                placeholder="+250 788 123 456"
                            />
                        </div>

                        <div className="md:col-span-2 space-y-2">
                            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                                <span>Password <span className="text-red-500">*</span></span>
                            </label>
                            <div className="flex space-x-2">
                                <input
                                    type="text"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                                    placeholder="Enter password or generate random"
                                />
                                <button
                                    type="button"
                                    onClick={generateRandomPassword}
                                    className="px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors flex items-center space-x-2"
                                >
                                    <RefreshCw className="w-4 h-4" />
                                    <span>Generate</span>
                                </button>
                            </div>
                        </div>

                        <div className="md:col-span-2 space-y-2">
                            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                                <UserCheck className="w-4 h-4 text-gray-400" />
                                <span>Role <span className="text-red-500">*</span></span>
                            </label>
                            <select
                                name="role_id"
                                value={formData.role_id}
                                onChange={handleChange}
                                disabled={isLoadingRoles}
                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                            >
                                <option value={0}>
                                    {isLoadingRoles ? 'Loading roles...' : 'Select a role'}
                                </option>
                                {roles.map((role) => (
                                    <option key={role.id} value={role.id}>
                                        {role.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {errors.length > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="flex items-start space-x-3">
                                <div className="w-4 h-4 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                    <X className="w-3 h-3 text-red-600" />
                                </div>
                                <div className="space-y-1">
                                    {errors.map((error, index) => (
                                        <p key={index} className="text-sm text-red-600">{error}</p>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="flex space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || isLoadingRoles}
                            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-primary-500 hover:bg-primary-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span>Adding...</span>
                                </>
                            ) : (
                                <>
                                    <Plus className="w-4 h-4" />
                                    <span>Add Employee</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddEmployeeModal;