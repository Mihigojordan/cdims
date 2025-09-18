import React from 'react';
import { ArrowRight, Play, Sparkles, Zap, Users } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="relative min-h-[90vh] bg-gradient-to-br from-white via-primary-50 to-white  overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-primary-100/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-40 right-20 w-96 h-96 bg-primary-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-primary-50/20 to-primary-100/20 rounded-full blur-3xl animate-spin-slow"></div>
        
        {/* Floating particles */}
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${10 + Math.random() * 20}s`
            }}
          >
            <div className="w-2 h-2 bg-primary-300/40 rounded-full"></div>
          </div>
        ))}
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

      <div className="w-11/12 mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex justify-center w-full gap-12 items-center min-h-[80vh]">
          
          {/* Left Content */}
          <div className="flex justify-center text-center items-center flex-col gap-10">
            <div className="space-y-6">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-primary-100/50 to-primary-200/50 backdrop-blur-sm border border-primary-300/50 text-primary-600 px-6 py-3 rounded-full text-sm font-medium">
                <Sparkles size={16} className="animate-pulse text-primary-500" />
                Modern HR Solutions 2025
                <Zap size={16} className="animate-pulse delay-500 text-primary-500" />
              </div>
              
              {/* Main Heading */}
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-gray-800 via-primary-500 to-gray-800 bg-clip-text text-transparent">
                  Streamline Your
                </span>
                {' '}
                <span className="bg-gradient-to-r from-primary-400 via-primary-600 to-primary-400 bg-clip-text text-transparent animate-pulse">
                  HR Operations
                </span>  <br />
                <span className="bg-gradient-to-r from-gray-800 via-primary-500 to-gray-800 bg-clip-text text-transparent">
                  with ABY System
                </span>
              </h1>
              
              {/* Description */}
              <p className="text-lg text-gray-600 leading-relaxed max-w-3xl ">
                Transform your human resource management with our comprehensive platform. From employee onboarding to payroll processing, manage your workforce efficiently and effectively.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="group relative bg-gradient-to-r from-primary-500 to-primary-600 text-white px-8 py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 hover:from-primary-600 hover:to-primary-700 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-primary-500/25">
                <span className="relative z-10">Get Started</span>
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl"></div>
              </button>
              
              <button className="group relative backdrop-blur-sm border-2 border-primary-400/50 text-primary-500 px-8 py-4 rounded-xl font-semibold text-lg flex items-center justify-center gap-2 hover:border-primary-500 hover:bg-primary-100/20 transition-all duration-300 transform hover:scale-105">
                <Play size={20} className="group-hover:scale-110 transition-transform text-primary-500" />
                <span>Watch Demo</span>
              </button>
            </div>

            {/* Stats */}
            <div className="flex gap-8 pt-8">
              {[
                { number: '10K+', label: 'Companies Trust Us' },
                { number: '500K+', label: 'Employees Managed' },
                { number: '99%', label: 'Client Satisfaction' }
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-primary-600 bg-clip-text text-transparent">
                    {stat.number}
                  </div>
                  <div className="text-sm text-gray-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
{/*






*/}
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-spin-slow {
          animation: spin-slow 60s linear infinite;
        }
        
        .bg-grid-pattern {
          background-image: radial-gradient(circle at 1px 1px, rgba(239, 68, 68, 0.1) 1px, transparent 0);
          background-size: 50px 50px;
        }
        
        .delay-1000 {
          animation-delay: 1s;
        }
        
        .delay-500 {
          animation-delay: 0.5s;
        }
        
        .delay-1500 {
          animation-delay: 1.5s;
        }
      `}</style>
    </section>
  );
};

export default HeroSection;