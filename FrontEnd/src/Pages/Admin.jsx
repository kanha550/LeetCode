
import React, { useState } from 'react';
import { Plus, Edit, Trash2, Video, Shield, BarChart3 } from 'lucide-react';
import { NavLink } from 'react-router';

function Admin() {
  const [hoveredCard, setHoveredCard] = useState(null);

  const adminOptions = [
    {
      id: 'create',
      title: 'Create Problem',
      description: 'Add new coding challenges with test cases',
      icon: Plus,
      gradient: 'from-emerald-500 to-teal-600',
      hoverGradient: 'from-emerald-600 to-teal-700',
      route: '/admin/create'
    },
    {
      id: 'update',
      title: 'Update Problem',
      description: 'Modify existing problems and solutions',
      icon: Edit,
      gradient: 'from-amber-500 to-orange-600',
      hoverGradient: 'from-amber-600 to-orange-700',
      route: '/admin/update'
    },
    {
      id: 'delete',
      title: 'Delete Problem',
      description: 'Remove outdated or incorrect problems',
      icon: Trash2,
      gradient: 'from-rose-500 to-red-600',
      hoverGradient: 'from-rose-600 to-red-700',
      route: '/admin/delete'
    },
    {
      id: 'video',
      title: 'Video Solutions',
      description: 'Upload and manage tutorial videos',
      icon: Video,
      gradient: 'from-violet-500 to-purple-600',
      hoverGradient: 'from-violet-600 to-purple-700',
      route: '/admin/video'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -top-48 -left-48 animate-pulse"></div>
        <div className="absolute w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -bottom-48 -right-48 animate-pulse delay-700"></div>
      </div>

      <div className="relative container mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 mb-6 px-6 py-3 bg-slate-800/50 backdrop-blur-sm rounded-full border border-slate-700/50">
            <Shield className="text-blue-400" size={24} />
            <span className="text-slate-300 font-medium">Administrator Access</span>
          </div>
          
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            Admin Control Panel
          </h1>
          
          <p className="text-slate-400 text-xl max-w-2xl mx-auto">
            Manage your coding platform with powerful administrative tools
          </p>
        </div>
          
        {/* Admin Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {adminOptions.map((option) => {
            const IconComponent = option.icon;
            const isHovered = hoveredCard === option.id;
            
            return (
              <NavLink
                key={option.id}
                to={option.route}
                onMouseEnter={() => setHoveredCard(option.id)}
                onMouseLeave={() => setHoveredCard(null)}
                className="group relative"
              >
                <div className="relative bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 overflow-hidden transition-all duration-500 hover:border-slate-600 hover:shadow-2xl hover:shadow-purple-500/20 hover:-translate-y-2">
                  {/* Gradient overlay on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${isHovered ? option.hoverGradient : option.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
                  
                  {/* Icon container */}
                  <div className={`relative inline-flex p-4 rounded-xl bg-gradient-to-br ${option.gradient} mb-6 group-hover:scale-110 transition-transform duration-500`}>
                    <IconComponent className="text-white" size={28} />
                  </div>
                  
                  {/* Content */}
                  <div className="relative">
                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-white group-hover:to-slate-300 transition-all duration-300">
                      {option.title}
                    </h3>
                    
                    <p className="text-slate-400 text-sm leading-relaxed mb-6">
                      {option.description}
                    </p>
                    
                    {/* Action arrow */}
                    <div className="flex items-center gap-2 text-slate-400 group-hover:text-white transition-colors duration-300">
                      <span className="text-sm font-medium">Get Started</span>
                      <svg 
                        className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </NavLink>
            );
          })}
        </div>

        {/* Footer note */}
        <div className="text-center mt-16">
          <p className="text-slate-500 text-sm">
            Need help? Check out the <span className="text-blue-400 hover:underline cursor-pointer">documentation</span> or <span className="text-blue-400 hover:underline cursor-pointer">contact support</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Admin;