import { useState, useEffect, type ReactNode } from "react";
import {
  Users,
  Shield,
  Zap,
  Heart,
  TrendingUp,
  Building,
  Calendar,
  Star,
  Globe,
  Award,
  Clock,
  Briefcase,
} from "lucide-react";

// Types
interface CountUpState {
  companies: number;
  years: number;
  employees: number;
  satisfaction: number;
}

interface Stat {
  key: keyof CountUpState;
  number: string;
  label: string;
  icon: ReactNode;
  color: string;
}

interface ValueItem {
  icon: ReactNode;
  title: string;
  description: string;
  highlight: string;
}

interface Achievement {
  icon: ReactNode;
  title: string;
  description: string;
}

export default function AboutSection() {
  const [activeValue, setActiveValue] = useState<number>(0);
  const [countUp, setCountUp] = useState<CountUpState>({
    companies: 0,
    years: 0,
    employees: 0,
    satisfaction: 0,
  });

  // Counter animation effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setCountUp({
        companies: 750,
        years: 12,
        employees: 85000,
        satisfaction: 99.2,
      });
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const stats: Stat[] = [
    {
      key: "companies",
      number: `${countUp.companies}+`,
      label: "Companies Trust Us",
      icon: <Building className="w-6 h-6" />,
      color: "text-blue-600",
    },
    {
      key: "years",
      number: `${countUp.years}+`,
      label: "Years of Excellence",
      icon: <Calendar className="w-6 h-6" />,
      color: "text-green-600",
    },
    {
      key: "employees",
      number: `${Math.floor(countUp.employees / 1000)}K+`,
      label: "Professionals Served",
      icon: <Users className="w-6 h-6" />,
      color: "text-purple-600",
    },
    {
      key: "satisfaction",
      number: `${countUp.satisfaction}%`,
      label: "Client Satisfaction",
      icon: <Star className="w-6 h-6" />,
      color: "text-yellow-600",
    },
  ];

  const values: ValueItem[] = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Enterprise Security",
      description:
        "Bank-grade encryption and compliance with international data protection standards ensure your sensitive HR data stays protected.",
      highlight: "ISO 27001 Certified",
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Lightning Fast Performance",
      description:
        "Cloud-native architecture delivers instant responses and 99.9% uptime, keeping your team productive around the clock.",
      highlight: "Sub-second Response Time",
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Employee-Centric Design",
      description:
        "Intuitive interfaces and personalized experiences make HR processes enjoyable for both administrators and employees.",
      highlight: "4.9/5 User Rating",
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Smart Analytics",
      description:
        "AI-powered insights and predictive analytics help you make data-driven decisions about your workforce strategy.",
      highlight: "Machine Learning Powered",
    },
  ];

  const achievements: Achievement[] = [
    {
      icon: <Award className="w-6 h-6" />,
      title: "Industry Leader",
      description: "Recognized as the #1 HR platform in East Africa",
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Global Reach",
      description: "Serving companies across 15+ countries worldwide",
    },
    {
      icon: <Clock className="w-6 h-6" />,
      title: "24/7 Support",
      description: "Round-the-clock customer support in multiple languages",
    },
    {
      icon: <Briefcase className="w-6 h-6" />,
      title: "Enterprise Ready",
      description: "Scalable solutions for companies of all sizes",
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-primary-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-primary-100 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-1000"></div>
      
      <div className="w-11/12 mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-2xl mb-6">
            <Users className="w-8 h-8 text-primary-600" />
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            Why Choose <span className="text-primary-600">ABY HR</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            The most trusted HR management platform, empowering organizations worldwide with cutting-edge technology and unmatched reliability
          </p>
        </div>

        {/* Stats Section with Animation */}
        <div className="bg-white rounded-2xl p-8 shadow-xl border border-primary-100 mb-20">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="w-16 h-16 bg-primary-50 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-100 transition-all duration-300 group-hover:scale-110">
                  <div className={`${stat.color} transition-colors duration-300`}>
                    {stat.icon}
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1 tabular-nums">
                  {stat.number}
                </div>
                <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content - Single Column Layout */}
        <div className="w-10/12 mx-auto mb-20">
          
          {/* Company Story Section */}
          <div className="text-center mb-16">
            <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-3xl p-12 text-white mb-12 relative overflow-hidden">
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full translate-y-20 -translate-x-20"></div>
              
              <div className="relative z-10">
                <h3 className="text-3xl sm:text-4xl font-bold mb-6">Our Story</h3>
                <p className="text-xl text-primary-100 leading-relaxed mb-8 max-w-3xl mx-auto">
                  Founded by HR professionals who experienced firsthand the challenges of outdated systems, 
                  ABY HR was born from a vision to revolutionize workforce management.
                </p>
                
                {/* Timeline dots */}
                <div className="flex justify-center items-center space-x-8 flex-wrap gap-4">
                  <div className="flex items-center text-primary-100">
                    <div className="w-3 h-3 bg-primary-300 rounded-full mr-3"></div>
                    <span className="text-sm font-medium">Started in Silicon Valley</span>
                  </div>
                  <div className="flex items-center text-primary-100">
                    <div className="w-3 h-3 bg-primary-300 rounded-full mr-3"></div>
                    <span className="text-sm font-medium">Expanded globally in 3 years</span>
                  </div>
                  <div className="flex items-center text-primary-100">
                    <div className="w-3 h-3 bg-primary-300 rounded-full mr-3"></div>
                    <span className="text-sm font-medium">Trusted by Fortune 500</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* What Sets Us Apart */}
          <div className="mb-16">
            <div className="text-center mb-12">
              <h3 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">What Sets Us Apart</h3>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">Experience the difference that comes from our core strengths</p>
            </div>

            {/* Values in Cards */}
            <div className="grid sm:grid-cols-2 gap-8 mb-12">
              {values.map((value, index) => (
                <div 
                  key={index}
                  onClick={() => setActiveValue(index)}
                  className={`group cursor-pointer transition-all duration-500 ${
                    activeValue === index ? 'transform scale-105' : 'hover:scale-102'
                  }`}
                >
                  <div className={`p-8 rounded-2xl h-full transition-all duration-300 ${
                    activeValue === index 
                      ? 'bg-primary-600 text-white shadow-2xl' 
                      : 'bg-white hover:bg-primary-50 text-gray-900 shadow-lg hover:shadow-xl border-2 border-gray-100 hover:border-primary-200'
                  }`}>
                    <div className="text-center">
                      <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                        activeValue === index 
                          ? 'bg-white/20' 
                          : 'bg-primary-100 group-hover:bg-primary-200'
                      }`}>
                        <div className={`transition-all duration-300 ${
                          activeValue === index ? 'text-white' : 'text-primary-600'
                        }`}>
                          {value.icon}
                        </div>
                      </div>
                      
                      <h4 className="text-xl font-bold mb-4">{value.title}</h4>
                      <p className={`leading-relaxed mb-6 ${
                        activeValue === index ? 'text-white/90' : 'text-gray-600'
                      }`}>
                        {value.description}
                      </p>
                      
                      <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                        activeValue === index 
                          ? 'bg-white/20 text-white' 
                          : 'bg-primary-100 text-primary-700 group-hover:bg-primary-200'
                      }`}>
                        {value.highlight}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Achievements Grid */}
          <div className="bg-gray-50 rounded-3xl p-8 sm:p-12">
            <div className="text-center mb-10">
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Why Companies Choose Us</h3>
              <p className="text-lg text-gray-600">The achievements that set us apart in the industry</p>
            </div>
            
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {achievements.map((achievement, index) => (
                <div key={index} className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 text-center group hover:scale-105">
                  <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-100 transition-colors duration-300">
                    <div className="text-primary-600">
                      {achievement.icon}
                    </div>
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2">{achievement.title}</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">{achievement.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>


      </div>
    </section>
  );
}