import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

const FeaturedModules = () => {
  const modules = [
    {
      id: 1,
      name: "Employee Management",
      category: "Core Module",
      image: "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=400&h=400&fit=crop",
      features: ["Employee Profiles", "Document Management", "Contact Directory"],
      badge: "Essential"
    },
    {
      id: 2,
      name: "Payroll Processing",
      category: "Finance Module",
      image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=400&fit=crop",
      features: ["Automated Calculations", "Tax Management", "Salary Reports"],
      badge: "Automated"
    },
    {
      id: 3,
      name: "Attendance Tracking",
      category: "Time Management",
      image: "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=400&h=400&fit=crop",
      features: ["Clock In/Out", "Leave Management", "Overtime Tracking"],
      badge: "Real-time"
    },
    {
      id: 4,
      name: "Performance Reviews",
      category: "Evaluation Module",
      image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=400&fit=crop",
      features: ["Goal Setting", "360° Reviews", "Performance Analytics"],
      badge: "Advanced"
    },
    {
      id: 5,
      name: "Recruitment Portal",
      category: "Hiring Module",
      image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop",
      features: ["Job Posting", "Candidate Tracking", "Interview Scheduling"],
      badge: "Comprehensive"
    },
    {
      id: 6,
      name: "Training Management",
      category: "Development Module",
      image: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=400&h=400&fit=crop",
      features: ["Course Catalog", "Progress Tracking", "Certification Management"],
      badge: "Growth Focused"
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="w-full xl:w-11/12 mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Core HR Modules</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive HR solutions designed to streamline your workforce management and enhance organizational efficiency
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {modules.map((module, index) => (
            <motion.div
              key={module.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -10, boxShadow: '0 25px 50px rgba(0,0,0,0.1)' }}
              viewport={{ once: true }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden group cursor-pointer"
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
              </div>
              
              <div className="p-6">
                <div className="mb-2">
                  <span className="text-primary-600 text-sm font-medium">{module.category}</span>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{module.name}</h3>
                
                <div className="space-y-2 mb-4">
                  {module.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-primary-600 rounded-full"></div>
                      <span className="text-gray-600 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-primary-600 to-primary-700 text-white py-3 px-4 rounded-lg font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all"
                >
                  Learn More <ChevronRight size={18} />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedModules;