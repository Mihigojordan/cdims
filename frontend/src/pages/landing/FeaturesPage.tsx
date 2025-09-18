import React, { useState } from 'react';
import { 
  ChevronRight, 
  Users, 
  DollarSign, 
  Clock, 
  TrendingUp, 
  UserPlus, 
  BookOpen,
  Home,
  CheckCircle,
  Star,
  Shield,
  Zap,
  BarChart3,
  Calendar,
  FileText,
  Settings,
  Database,
  Globe,
  Smartphone,
  Lock,
  Cloud,
  ArrowRight,
  Play,
  Award,
  Target,
  MessageSquare,
  Bell,
  Filter
} from 'lucide-react';
import HeaderBanner from '../../components/landing/HeaderBanner';


export default function HRFeaturesPage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedModule, setSelectedModule] = useState(null);

  const categories = ['All', 'Core Module', 'Finance Module', 'Time Management', 'Evaluation Module', 'Hiring Module', 'Development Module'];

  const modules = [
    {
      id: 1,
      name: "Employee Management",
      category: "Core Module",
      icon: <Users className="w-8 h-8" />,
      image: "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=400&h=400&fit=crop",
      features: ["Employee Profiles", "Document Management", "Contact Directory", "Organizational Chart"],
      badge: "Essential",
      description: "Complete employee lifecycle management with comprehensive profiles, document storage, and organizational structure visualization.",
      benefits: ["Centralized employee data", "Streamlined onboarding", "Easy document access", "Visual org structure"],
      pricing: "Included in all plans"
    },
    {
      id: 2,
      name: "Payroll Processing",
      category: "Finance Module",
      icon: <DollarSign className="w-8 h-8" />,
      image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=400&fit=crop",
      features: ["Automated Calculations", "Tax Management", "Salary Reports", "Benefits Integration"],
      badge: "Automated",
      description: "Fully automated payroll system with tax compliance, benefit deductions, and comprehensive reporting capabilities.",
      benefits: ["99.9% accuracy", "Tax compliance", "Time savings", "Detailed reporting"],
      pricing: "Starting at $5/employee"
    },
    {
      id: 3,
      name: "Attendance Tracking",
      category: "Time Management",
      icon: <Clock className="w-8 h-8" />,
      image: "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=400&h=400&fit=crop",
      features: ["Clock In/Out", "Leave Management", "Overtime Tracking", "Mobile App Support"],
      badge: "Real-time",
      description: "Advanced time tracking with multiple clock-in methods, automated overtime calculations, and comprehensive leave management.",
      benefits: ["Real-time tracking", "Mobile accessibility", "Automated calculations", "Leave approvals"],
      pricing: "Starting at $2/employee"
    },
    {
      id: 4,
      name: "Performance Reviews",
      category: "Evaluation Module",
      icon: <TrendingUp className="w-8 h-8" />,
      image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=400&fit=crop",
      features: ["Goal Setting", "360° Reviews", "Performance Analytics", "Development Plans"],
      badge: "Advanced",
      description: "Comprehensive performance management with goal tracking, multi-source feedback, and data-driven insights for employee development.",
      benefits: ["Objective evaluations", "Goal alignment", "Development focus", "Analytics insights"],
      pricing: "Starting at $3/employee"
    },
    {
      id: 5,
      name: "Recruitment Portal",
      category: "Hiring Module",
      icon: <UserPlus className="w-8 h-8" />,
      image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop",
      features: ["Job Posting", "Candidate Tracking", "Interview Scheduling", "Offer Management"],
      badge: "Comprehensive",
      description: "End-to-end recruitment solution with job posting, candidate management, interview coordination, and offer processing.",
      benefits: ["Streamlined hiring", "Candidate pipeline", "Automated scheduling", "Offer tracking"],
      pricing: "Starting at $50/month"
    },
    {
      id: 6,
      name: "Training Management",
      category: "Development Module",
      icon: <BookOpen className="w-8 h-8" />,
      image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400&h=400&fit=crop",
      features: ["Course Catalog", "Progress Tracking", "Certification Management", "Skills Assessment"],
      badge: "Growth Focused",
      description: "Comprehensive learning management system with course delivery, progress monitoring, and skill development tracking.",
      benefits: ["Skill development", "Progress monitoring", "Certification tracking", "Custom courses"],
      pricing: "Starting at $4/employee"
    },
    {
      id: 7,
      name: "Analytics Dashboard",
      category: "Core Module",
      icon: <BarChart3 className="w-8 h-8" />,
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=400&fit=crop",
      features: ["Real-time Reports", "Custom Dashboards", "Data Visualization", "Predictive Analytics"],
      badge: "Intelligent",
      description: "Advanced analytics and reporting with customizable dashboards, real-time insights, and predictive workforce analytics.",
      benefits: ["Data-driven decisions", "Custom reports", "Real-time insights", "Predictive analytics"],
      pricing: "Starting at $10/month"
    },
    {
      id: 8,
      name: "Benefits Administration",
      category: "Finance Module",
      icon: <Shield className="w-8 h-8" />,
      image: "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=400&h=400&fit=crop",
      features: ["Benefits Enrollment", "Claims Processing", "Provider Management", "Cost Analysis"],
      badge: "Comprehensive",
      description: "Complete benefits management with enrollment, claims tracking, provider coordination, and cost analysis.",
      benefits: ["Easy enrollment", "Claims tracking", "Cost management", "Provider integration"],
      pricing: "Starting at $6/employee"
    }
  ];

  const keyFeatures = [
    {
      icon: <Cloud className="w-6 h-6" />,
      title: "Cloud-Based",
      description: "Access anywhere, anytime with secure cloud infrastructure"
    },
    {
      icon: <Smartphone className="w-6 h-6" />,
      title: "Mobile Ready",
      description: "Native mobile apps for iOS and Android devices"
    },
    {
      icon: <Lock className="w-6 h-6" />,
      title: "Enterprise Security",
      description: "Bank-level security with end-to-end encryption"
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Multi-Language",
      description: "Support for 15+ languages and currencies"
    },
    {
      icon: <Settings className="w-6 h-6" />,
      title: "Customizable",
      description: "Flexible workflows and custom field configuration"
    },
    {
      icon: <Database className="w-6 h-6" />,
      title: "Data Integration",
      description: "Seamless integration with existing systems"
    }
  ];

  const filteredModules = activeCategory === 'All' 
    ? modules 
    : modules.filter(module => module.category === activeCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 right-10 w-32 h-32 bg-primary-100 rounded-full opacity-20"></div>
        <div className="absolute bottom-20 left-10 w-24 h-24 bg-primary-200 rounded-full opacity-30"></div>
        <div className="absolute top-1/2 right-1/4 w-16 h-16 bg-primary-300 rounded-full opacity-15"></div>
      </div>
      
      <HeaderBanner
        title="HR Features"
        subtitle="Home  / Features"
       backgroundStyle="image"
        icon={<Star className="w-10 h-10" />}
       
      />

      {/* Overview Stats */}
      <section className="py-12 relative">
        <div className="w-11/12 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
              <div className="text-3xl font-bold text-primary-600 mb-2">8+</div>
              <div className="text-gray-600">Core Modules</div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
              <div className="text-3xl font-bold text-primary-600 mb-2">50+</div>
              <div className="text-gray-600">Features</div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
              <div className="text-3xl font-bold text-primary-600 mb-2">99.9%</div>
              <div className="text-gray-600">Uptime</div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
              <div className="text-3xl font-bold text-primary-600 mb-2">24/7</div>
              <div className="text-gray-600">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="py-20">
        <div className="w-11/12 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Our HR System?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Built with modern technology and designed for scalability, security, and user experience
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {keyFeatures.map((feature, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2">
                <div className="text-primary-600 mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Features Section */}
      <section className="py-20 bg-white">
        <div className="w-11/12 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Core HR Modules</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive HR solutions designed to streamline your workforce management and enhance organizational efficiency
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-6 py-3 rounded-full font-semibold transition-all duration-300 ${
                  activeCategory === category
                    ? 'bg-primary-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-primary-50 hover:text-primary-600'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredModules.map((module, index) => (
              <div
                key={module.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden group cursor-pointer hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
                onClick={() => setSelectedModule(module)}
              >
                <div className="relative overflow-hidden">
                  <img 
                    src={module.image} 
                    alt={module.name}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {module.badge}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4">
                    <div className="bg-white rounded-full p-2 text-primary-600">
                      {module.icon}
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="mb-2">
                    <span className="text-primary-600 text-sm font-medium">{module.category}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{module.name}</h3>
                  
                  <p className="text-gray-600 text-sm mb-4">{module.description}</p>
                  
                  <div className="space-y-2 mb-4">
                    {module.features.slice(0, 3).map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-gray-600 text-sm">{feature}</span>
                      </div>
                    ))}
                    {module.features.length > 3 && (
                      <div className="text-primary-600 text-sm font-medium">
                        +{module.features.length - 3} more features
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm text-gray-500">{module.pricing}</div>
                    <div className="flex text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                  </div>
                  
                  <button className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all">
                    Learn More <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Integration Section */}
      <section className="py-20 bg-gradient-to-br from-primary-50 to-white">
        <div className="w-11/12 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Seamless Integrations</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Connect with your existing tools and systems for a unified workflow
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-6">
            {['Slack', 'Microsoft Teams', 'Google Workspace', 'QuickBooks'].map((integration, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg text-center hover:shadow-xl transition-all duration-300">
                <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-gray-600 font-semibold">{integration.charAt(0)}</span>
                </div>
                <h3 className="font-semibold text-gray-900">{integration}</h3>
                <p className="text-sm text-gray-600 mt-2">Easy integration</p>
              </div>
            ))}
          </div>
        </div>
      </section>

{/*       

     
      {selectedModule && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="relative">
              <img 
                src={selectedModule.image} 
                alt={selectedModule.name}
                className="w-full h-64 object-cover"
              />
              <button
                onClick={() => setSelectedModule(null)}
                className="absolute top-4 right-4 bg-white rounded-full p-2 hover:bg-gray-100"
              >
                ✕
              </button>
              <div className="absolute top-4 left-4">
                <span className="bg-primary-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {selectedModule.badge}
                </span>
              </div>
            </div>
            
            <div className="p-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="text-primary-600">
                  {selectedModule.icon}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedModule.name}</h2>
                  <p className="text-primary-600">{selectedModule.category}</p>
                </div>
              </div>
              
              <p className="text-gray-600 mb-6">{selectedModule.description}</p>
              
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Features</h3>
                  <div className="space-y-2">
                    {selectedModule.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-gray-600">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Benefits</h3>
                  <div className="space-y-2">
                    {selectedModule.benefits.map((benefit, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-gray-600">{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="bg-primary-50 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-900">Pricing</span>
                  <span className="text-primary-600 font-semibold">{selectedModule.pricing}</span>
                </div>
              </div>
              
              <div className="flex gap-4">
                <button className="flex-1 bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors">
                  Start Free Trial
                </button>
                <button className="flex-1 border border-primary-600 text-primary-600 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors">
                  Contact Sales
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

       */}
    </div>
  );
}