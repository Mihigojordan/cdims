import { useState } from "react";
import { 
  Users, 
  Calculator, 
  Clock, 
  TrendingUp, 
  UserPlus, 
  BookOpen, 
  Shield, 
  FileText,
  CheckCircle,
  Star,
  Phone,
  Mail,
  MapPin,
  ArrowRight,
  Zap,
  Award,
  Home,
  Briefcase,
  Settings
} from "lucide-react";
import HeaderBanner from "../../components/landing/HeaderBanner";

export default function ServicesPage() {
  const [activeTab, setActiveTab] = useState('core');

  const coreServices = [
    {
      icon: <Users className="w-8 h-8" />,
      title: "Employee Management",
      description: "Complete employee lifecycle management from onboarding to offboarding",
      features: ["Employee profiles", "Document management", "Organizational chart", "Contact directory"]
    },
    {
      icon: <Calculator className="w-8 h-8" />,
      title: "Payroll & Benefits",
      description: "Automated payroll processing with comprehensive benefits administration",
      features: ["Salary calculations", "Tax management", "Benefits tracking", "Payslip generation"]
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: "Time & Attendance",
      description: "Advanced time tracking and attendance management system",
      features: ["Clock in/out", "Leave management", "Overtime tracking", "Shift scheduling"]
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Performance Management",
      description: "Comprehensive performance evaluation and goal tracking",
      features: ["Performance reviews", "Goal setting", "360° feedback", "Performance analytics"]
    }
  ];

  const advancedServices = [
    {
      icon: <UserPlus className="w-8 h-8" />,
      title: "Recruitment & Hiring",
      description: "End-to-end recruitment process management",
      features: ["Job posting", "Candidate tracking", "Interview scheduling", "Onboarding workflow"]
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: "Learning & Development",
      description: "Employee training and skill development programs",
      features: ["Course management", "Training schedules", "Progress tracking", "Certification tracking"]
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Compliance Management",
      description: "Ensure regulatory compliance and policy management",
      features: ["Policy management", "Compliance tracking", "Audit trails", "Regulatory updates"]
    },
    {
      icon: <FileText className="w-8 h-8" />,
      title: "Reports & Analytics",
      description: "Comprehensive HR analytics and reporting dashboard",
      features: ["Custom reports", "Real-time analytics", "Data visualization", "Export capabilities"]
    }
  ];

  const features = [
    {
      icon: <Award className="w-12 h-12" />,
      title: "HR Expertise",
      description: "Specialized HR professionals with deep industry knowledge"
    },
    {
      icon: <Zap className="w-12 h-12" />,
      title: "Quick Implementation",
      description: "Fast deployment with minimal disruption to your operations"
    },
    {
      icon: <Shield className="w-12 h-12" />,
      title: "Data Security",
      description: "Enterprise-grade security with full compliance guarantee"
    },
    {
      icon: <Users className="w-12 h-12" />,
      title: "24/7 Support",
      description: "Round-the-clock technical support and customer assistance"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      company: "TechCorp Rwanda",
      rating: 5,
      comment: "ABY HR Management transformed our HR operations. The payroll automation alone saves us 20 hours per month."
    },
    {
      name: "Michael Uwimana",
      company: "Green Valley Ltd",
      rating: 5,
      comment: "Excellent system with outstanding support. The performance management module has improved our team productivity significantly."
    },
    {
      name: "Grace Mukamana",
      company: "Innovation Hub",
      rating: 5,
      comment: "The recruitment portal streamlined our hiring process. We've reduced time-to-hire by 40% since implementation."
    }
  ];



  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary-50">
      {/* Header */}
      <HeaderBanner
        title="HR Management Services"
        subtitle="Home / Services"
        
        icon={<Briefcase className="w-10 h-10 mx-auto" />}
       
        backgroundStyle="image"
      />

      {/* Services Section */}
      <section id="services" className="py-20 bg-white">
        <div className="w-11/12 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-800 via-primary-500 to-gray-800 bg-clip-text text-transparent mb-4">
              Our HR Services
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive human resource management solutions tailored to your organization's needs
            </p>
          </div>

          {/* Service Tabs */}
          <div className="flex justify-center mb-12">
            <div className="bg-primary-50 p-2 rounded-xl flex space-x-2">
              <button
                onClick={() => setActiveTab('core')}
                className={`px-8 py-4 rounded-lg font-semibold transition-all duration-300 flex items-center space-x-2 ${
                  activeTab === 'core' 
                    ? 'bg-primary-600 text-white shadow-lg' 
                    : 'text-primary-700 hover:bg-primary-100'
                }`}
              >
                <Settings className="w-5 h-5" />
                <span>Core HR</span>
              </button>
              <button
                onClick={() => setActiveTab('advanced')}
                className={`px-8 py-4 rounded-lg font-semibold transition-all duration-300 flex items-center space-x-2 ${
                  activeTab === 'advanced' 
                    ? 'bg-primary-600 text-white shadow-lg' 
                    : 'text-primary-700 hover:bg-primary-100'
                }`}
              >
                <Zap className="w-5 h-5" />
                <span>Advanced</span>
              </button>
            </div>
          </div>

          {/* Service Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {(activeTab === 'core' ? coreServices : advancedServices).map((service, index) => (
              <div key={index} className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 hover:border-primary-200 hover:-translate-y-2">
                <div className="text-primary-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                  {service.icon}
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-4">{service.title}</h4>
                <p className="text-gray-600 mb-6">{service.description}</p>
                <ul className="space-y-3">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center space-x-3">
                      <CheckCircle className="w-5 h-5 text-primary-500" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button className="mt-6 w-full bg-primary-50 text-primary-700 py-3 rounded-lg font-semibold hover:bg-primary-600 hover:text-white transition-all duration-300 flex items-center justify-center space-x-2 group-hover:bg-primary-600 group-hover:text-white">
                  <span>Learn More</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-r from-primary-50 to-primary-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">Why Choose ABY HR Management?</h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We deliver exceptional HR solutions with unmatched expertise and support
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center group">
                <div className="bg-white rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                  <div className="text-primary-600">
                    {feature.icon}
                  </div>
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h4>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">What Our Clients Say</h3>
            <p className="text-xl text-gray-600">Success stories from organizations using ABY HR Management</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-primary-50 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-primary-500 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">"{testimonial.comment}"</p>
                <div>
                  <p className="font-semibold text-primary-700">{testimonial.name}</p>
                  <p className="text-sm text-gray-600">{testimonial.company}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      
    </div>
  );
}