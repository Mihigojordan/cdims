import React, { useState } from 'react';
import { 
  Users,
  Calculator,
  Clock,
  TrendingUp,
  UserPlus,
  BookOpen,
  Shield,
  FileText,
  ArrowRight,
  Sparkles
} from 'lucide-react';

// Define a type for a single category
interface Category {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  name: string;
  count: string;
}

const Categories: React.FC = () => {
  const [hoveredCategory, setHoveredCategory] = useState<number | null>(null);

  const categories: Category[] = [
    { icon: Users, name: 'Employee Management', count: '500+ Features' },
    { icon: Calculator, name: 'Payroll & Benefits', count: '200+ Tools' },
    { icon: Clock, name: 'Time & Attendance', count: '150+ Options' },
    { icon: TrendingUp, name: 'Performance Review', count: '100+ Metrics' },
    { icon: UserPlus, name: 'Recruitment', count: '300+ Templates' },
    { icon: BookOpen, name: 'Training & Development', count: '250+ Courses' },
    { icon: Shield, name: 'Compliance', count: '50+ Regulations' },
    { icon: FileText, name: 'Reports & Analytics', count: '400+ Reports' },
  ];

  return (
    <section className="py-20 relative overflow-hidden">
      {/* Enhanced background decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-20 -left-20 w-96 h-96 bg-primary-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute top-40 -right-20 w-96 h-96 bg-primary-200 rounded-full mix-blend-multiply filter blur-3xl opacity-15 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 w-96 h-96 bg-primary-100 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '4s' }}></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(239,68,68,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(239,68,68,0.03)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      </div>

      <div className="w-11/12 mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-2 rounded-full text-sm font-medium mb-6 shadow-lg shadow-primary-200">
            <Sparkles size={16} className="animate-pulse" />
            <span>Comprehensive HR Solutions</span>
          </div>
          
          <h2 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-gray-900 via-primary-800 to-gray-900 bg-clip-text text-transparent mb-6 leading-tight">
            HR Management Areas
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Discover our comprehensive suite of HR management tools designed to optimize every aspect of your human resource operations and drive organizational success
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {categories.map((category, index) => (
            <div
              key={category.name}
              className="group relative transform transition-all duration-500 ease-out hover:scale-105"
              onMouseEnter={() => setHoveredCategory(index)}
              onMouseLeave={() => setHoveredCategory(null)}
            >
              {/* Glow effect */}
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur"></div>
              
              {/* Main card */}
              <div className="relative bg-white p-8 rounded-2xl shadow-lg border border-gray-100 cursor-pointer transition-all duration-500 hover:shadow-2xl hover:shadow-primary-100/50 hover:-translate-y-2 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary-50/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute top-0 right-0 w-20 h-20 bg-primary-100 rounded-full transform translate-x-6 -translate-y-6 opacity-0 group-hover:opacity-40 transition-all duration-500"></div>
                <div className="absolute bottom-0 left-0 w-16 h-16 bg-primary-200 rounded-full transform -translate-x-4 translate-y-4 opacity-0 group-hover:opacity-30 transition-all duration-700"></div>
                
                <div className="relative z-10">
                  <div className="mb-6 flex justify-center">
                    <div className="relative p-4 bg-primary-50 rounded-2xl group-hover:bg-primary-100 transition-all duration-300 group-hover:scale-110">
                      <category.icon 
                        size={36} 
                        className="text-primary-600 group-hover:text-primary-700 transition-colors duration-300" 
                      />
                      <div className="absolute inset-0 bg-primary-500 rounded-2xl opacity-0 group-hover:opacity-20 animate-ping"></div>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <h3 className="font-bold text-lg text-gray-900 mb-2 group-hover:text-primary-900 transition-colors duration-300">
                      {category.name}
                    </h3>
                    <p className="text-sm text-gray-500 mb-4 group-hover:text-gray-600 transition-colors duration-300">
                      {category.count}
                    </p>
                    
                    <div className="flex items-center justify-center gap-2 text-primary-600 font-medium text-sm opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                      <span>Explore</span>
                      <ArrowRight size={16} className="transform group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="inline-flex items-center gap-3 bg-white px-8 py-4 rounded-full shadow-lg border border-gray-100 hover:shadow-xl hover:border-primary-200 transition-all duration-300 cursor-pointer group">
            <span className="text-gray-700 font-medium">View Complete Platform</span>
            <ArrowRight size={20} className="text-primary-600 group-hover:translate-x-1 transition-transform duration-300" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Categories;
