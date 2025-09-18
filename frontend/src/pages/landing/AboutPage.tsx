import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Users, 
  Target, 
  Award, 
  Clock, 
  Shield, 
  Zap,
  Heart,
  CheckCircle,
  Star,
  ArrowRight,
  Eye,
  TrendingUp,
  Building,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Briefcase,
  GraduationCap,
  Globe,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Rocket,
  Lightbulb,
  HandHeart
} from "lucide-react";
import HeaderBanner from "../../components/landing/HeaderBanner";



export default function AboutPage() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6
      }
    }
  };

  const stats = [
    { number: "500+", label: "Companies Served", icon: <Building className="w-8 h-8" /> },
    { number: "8+", label: "Years Experience", icon: <Calendar className="w-8 h-8" /> },
    { number: "50,000+", label: "Employees Managed", icon: <Users className="w-8 h-8" /> },
    { number: "98.5%", label: "Client Satisfaction", icon: <Star className="w-8 h-8" /> }
  ];

  const values = [
    {
      icon: <Shield className="w-12 h-12" />,
      title: "Security & Privacy",
      description: "We maintain the highest standards of data security and privacy protection for all employee information and HR data.",
      color: "from-green-400 to-green-600"
    },
    {
      icon: <Zap className="w-12 h-12" />,
      title: "Innovation Excellence",
      description: "Continuously evolving our HR solutions with cutting-edge technology to meet the changing needs of modern workplaces.",
      color: "from-yellow-400 to-orange-500"
    },
    {
      icon: <Heart className="w-12 h-12" />,
      title: "People First",
      description: "Every feature we build puts people at the center, creating solutions that enhance the employee experience and HR efficiency.",
      color: "from-red-400 to-pink-500"
    },
    {
      icon: <TrendingUp className="w-12 h-12" />,
      title: "Continuous Improvement",
      description: "We constantly refine our platform based on user feedback and industry best practices to deliver exceptional value.",
      color: "from-purple-400 to-purple-600"
    }
  ];

  const teamMembers = [
    {
      name: "Dr. Alphonse Byiringiro",
      position: "Founder & CEO",
      experience: "15 Years",
      specialization: "HR Strategy & Digital Transformation",
      description: "Visionary leader with extensive experience in HR technology and organizational development across East Africa.",
      gradient: "from-blue-500 to-indigo-600"
    },
    {
      name: "Yves Ntamashimikiro",
      position: "Chief Technology Officer",
      experience: "12 Years",
      specialization: "Software Architecture & System Design",
      description: "Expert in building scalable HR platforms with focus on security, performance, and user experience.",
      gradient: "from-green-500 to-teal-600"
    },
    {
      name: "Sarah Uwimana",
      position: "Head of HR Solutions",
      experience: "10 Years",
      specialization: "HR Operations & Process Optimization",
      description: "Dedicated to designing HR workflows that streamline operations and enhance employee engagement.",
      gradient: "from-purple-500 to-pink-600"
    },
    {
      name: "Grace Mukamana",
      position: "Customer Success Director",
      experience: "8 Years",
      specialization: "Client Relations & Implementation",
      description: "Ensures seamless implementation and ongoing success for organizations adopting ABY HR Management.",
      gradient: "from-orange-500 to-red-600"
    }
  ];

  const milestones = [
    {
      year: "2016",
      title: "Company Founded",
      description: "Started with a mission to digitize HR processes for African businesses, beginning in Rwanda",
      icon: <Rocket className="w-6 h-6" />
    },
    {
      year: "2018",
      title: "First 100 Clients",
      description: "Reached milestone of serving 100 organizations with our core HR management platform",
      icon: <Users className="w-6 h-6" />
    },
    {
      year: "2020",
      title: "Remote Work Solutions",
      description: "Launched enhanced remote work capabilities during the global shift to digital workplaces",
      icon: <Globe className="w-6 h-6" />
    },
    {
      year: "2022",
      title: "Regional Expansion",
      description: "Extended services across East Africa, serving clients in Kenya, Uganda, and Tanzania",
      icon: <TrendingUp className="w-6 h-6" />
    },
    {
      year: "2024",
      title: "AI-Powered Features",
      description: "Introduced artificial intelligence capabilities for predictive analytics and automated insights",
      icon: <Lightbulb className="w-6 h-6" />
    }
  ];

  const testimonials = [
    {
      quote: "ABY HR Management transformed our entire workforce management process. The efficiency gains have been remarkable.",
      author: "John Mugisha",
      position: "HR Director",
      company: "TechCorp Rwanda"
    },
    {
      quote: "The platform's intuitive design made employee onboarding seamless. Our team adoption was incredibly smooth.",
      author: "Mary Kamau",
      position: "People Operations Manager",
      company: "Growth Solutions Kenya"
    },
    {
      quote: "Outstanding customer support and continuous innovation. ABY has been instrumental in our digital transformation.",
      author: "David Ssemwanga",
      position: "CEO",
      company: "Innovation Hub Uganda"
    }
  ];

  const nextTestimonial = () => {
    setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setActiveTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-orange-50">
      {/* Header Section */}
      <HeaderBanner
        title="About ABY HR Management"
        subtitle="Home / About us"
        backgroundStyle="image"
        icon={<Users className="w-10 h-10 text-white" />}
      />
      
      {/* Company Overview */}
      <section className="py-20 bg-white relative overflow-hidden">
        <motion.div
          animate={{
            rotate: [0, 360],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-0 right-0 w-64 h-64 bg-orange-100/30 rounded-full blur-2xl"
        />
        
        <div className="w-11/12 mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="grid lg:grid-cols-1 gap-12 items-center"
          >
            <motion.div variants={itemVariants}>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                Transforming HR Management in Africa
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                ABY HR Management was founded with a clear vision: to provide African businesses with 
                world-class HR technology that simplifies workforce management and drives organizational success.
              </p>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                We understand the unique challenges facing businesses in our region and have built our 
                platform to address these specific needs while maintaining international standards of 
                functionality and security.
              </p>
              
              <motion.div 
                variants={containerVariants}
                className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
              >
                {stats.map((stat, index) => (
                  <motion.div 
                    key={index} 
                    variants={itemVariants}
                    whileHover={{ 
                      scale: 1.05,
                      boxShadow: "0 10px 25px rgba(0,0,0,0.1)"
                    }}
                    className="text-center bg-orange-50 rounded-lg p-4 cursor-pointer transition-all duration-300"
                  >
                    <motion.div 
                      animate={{ 
                        rotate: [0, 5, -5, 0],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ 
                        duration: 2,
                        repeat: Infinity,
                        delay: index * 0.2
                      }}
                      className="text-orange-600 mb-2 flex justify-center"
                    >
                      {stat.icon}
                    </motion.div>
                    <div className="text-2xl font-bold text-orange-700 mb-1">{stat.number}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
            
            <motion.div 
              variants={itemVariants}
              className="relative"
            >
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="relative bg-gradient-to-br from-orange-500 to-orange-700 rounded-2xl p-8 text-white shadow-2xl"
              >
                <div className="flex items-center mb-6">
                  <Globe className="w-12 h-12 mr-4" />
                  <div>
                    <h3 className="text-2xl font-bold">Serving East Africa</h3>
                    <p className="text-orange-100">Rwanda • Kenya • Uganda • Tanzania</p>
                  </div>
                </div>
                <p className="text-orange-100 leading-relaxed">
                  Our platform serves organizations across the East African region, providing 
                  localized HR solutions that understand the unique business environment and 
                  regulatory requirements of each market.
                </p>
                
                {/* Floating elements */}
                <motion.div
                  animate={{ y: [-10, 10, -10] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute top-4 right-4 w-8 h-8 bg-white/20 rounded-full"
                />
                <motion.div
                  animate={{ y: [10, -10, 10] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute bottom-4 left-4 w-6 h-6 bg-white/20 rounded-full"
                />
              </motion.div>
              
              <motion.div
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center"
              >
                <Sparkles className="w-8 h-8 text-white" />
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

    {/* Values Section */}
      <section className="py-20 bg-white">
        <div className="w-11/12 mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="text-center mb-16"
          >
            <motion.h3 
              variants={itemVariants}
              className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4"
            >
              Our Core Values
            </motion.h3>
            <motion.p 
              variants={itemVariants}
              className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto"
            >
              The principles that guide everything we do
            </motion.p>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {values.map((value, index) => (
              <motion.div 
                key={index} 
                variants={itemVariants}
                whileHover={{ 
                  y: -10,
                  scale: 1.05
                }}
                className="text-center group"
              >
                <motion.div 
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className={`bg-gradient-to-br ${value.color} rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all duration-300`}
                >
                  <div className="text-white">
                    {value.icon}
                  </div>
                </motion.div>
                <h4 className="text-xl font-bold text-gray-900 mb-4">{value.title}</h4>
                <p className="text-gray-600">{value.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

    

      {/* Timeline Section */}
      <section className="py-20 bg-white">
        <div className="w-11/12 mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="text-center mb-16"
          >
            <motion.h3 
              variants={itemVariants}
              className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4"
            >
              Our Journey
            </motion.h3>
            <motion.p 
              variants={itemVariants}
              className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto"
            >
              Key milestones that shaped ABY HR Management
            </motion.p>
          </motion.div>

          <div className="relative">
            {/* Timeline line */}
            <motion.div
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5 }}
              className="hidden lg:block absolute left-1/2 transform -translate-x-px h-full w-0.5 bg-orange-200 origin-top"
            />
            <motion.div
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5 }}
              className="lg:hidden absolute left-8 top-0 h-full w-0.5 bg-orange-200 origin-top"
            />
            
            <div className="space-y-8 lg:space-y-12">
              {milestones.map((milestone, index) => (
                <motion.div 
                  key={index} 
                  initial={{ opacity: 0, x: index % 2 === 0 ? -100 : 100 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2, duration: 0.6 }}
                  className={`relative flex items-center ${
                    index % 2 === 0 ? 'lg:justify-start' : 'lg:justify-end'
                  }`}
                >
                  {/* Timeline dot */}
                  <motion.div 
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.2 + 0.3, duration: 0.4 }}
                    whileHover={{ scale: 1.5 }}
                    className="hidden lg:block absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-orange-600 rounded-full border-4 border-white shadow-lg z-10"
                  />
                  <motion.div 
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.2 + 0.3, duration: 0.4 }}
                    className="lg:hidden absolute left-6 transform -translate-x-1/2 w-4 h-4 bg-orange-600 rounded-full border-4 border-white shadow-lg z-10"
                  />
                  
                  {/* Content */}
                  <div className={`
                    w-full lg:w-5/12 
                    pl-16 lg:pl-0
                    ${index % 2 === 0 ? 'lg:pr-8 lg:text-right' : 'lg:pl-8 lg:text-left'}
                  `}>
                    <motion.div 
                      whileHover={{ 
                        scale: 1.05,
                        boxShadow: "0 20px 40px rgba(0,0,0,0.1)"
                      }}
                      className="bg-orange-50 rounded-lg p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-orange-100 cursor-pointer"
                    >
                      <div className="flex items-center justify-center lg:justify-start mb-3">
                        <motion.div
                          animate={{ rotate: [0, 360] }}
                          transition={{ duration: 3, repeat: Infinity, delay: index }}
                          className="text-orange-600 mr-2"
                        >
                          {milestone.icon}
                        </motion.div>
                        <div className="text-xl sm:text-2xl font-bold text-orange-700">{milestone.year}</div>
                      </div>
                      <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-3">{milestone.title}</h4>
                      <p className="text-sm sm:text-base text-gray-600 leading-relaxed">{milestone.description}</p>
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-r from-orange-50 to-orange-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="text-center mb-16"
          >
            <motion.h3 
              variants={itemVariants}
              className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4"
            >
              What Our Clients Say
            </motion.h3>
            <motion.p 
              variants={itemVariants}
              className="text-lg sm:text-xl text-gray-600"
            >
              Hear from organizations that trust ABY HR Management
            </motion.p>
          </motion.div>

          <motion.div 
            key={activeTestimonial}
            initial={{ opacity: 0, rotateY: 90 }}
            animate={{ opacity: 1, rotateY: 0 }}
            exit={{ opacity: 0, rotateY: -90 }}
            transition={{ duration: 0.5 }}
            className="relative bg-white rounded-2xl p-8 shadow-xl"
          >
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute top-4 left-4 text-orange-200"
            >
              <HandHeart className="w-8 h-8" />
            </motion.div>
            
            <div className="text-center">
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-lg sm:text-xl text-gray-600 mb-6 italic leading-relaxed"
              >
                "{testimonials[activeTestimonial].quote}"
              </motion.p>
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col items-center"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center mb-3">
                  <span className="text-white font-bold text-lg">
                    {testimonials[activeTestimonial].author.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <h4 className="font-bold text-gray-900 text-lg">{testimonials[activeTestimonial].author}</h4>
                <p className="text-blue-600 font-medium">{testimonials[activeTestimonial].position}</p>
                <p className="text-gray-500 text-sm">{testimonials[activeTestimonial].company}</p>
              </motion.div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between items-center mt-8">
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={prevTestimonial}
                className="p-3 rounded-full bg-orange-100 hover:bg-orange-200 transition-colors duration-300 shadow-lg"
              >
                <ChevronLeft className="w-6 h-6 text-orange-600" />
              </motion.button>
              
              <div className="flex space-x-2">
                {testimonials.map((_, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.2 }}
                    whileTap={{ scale: 0.8 }}
                    onClick={() => setActiveTestimonial(index)}
                    className={`w-3 h-3 rounded-full transition-colors duration-300 ${
                      index === activeTestimonial ? 'bg-orange-600' : 'bg-orange-200'
                    }`}
                  />
                ))}
              </div>
              
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={nextTestimonial}
                className="p-3 rounded-full bg-orange-100 hover:bg-orange-200 transition-colors duration-300 shadow-lg"
              >
                <ChevronRight className="w-6 h-6 text-orange-600" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

    
    </div>
  );
}