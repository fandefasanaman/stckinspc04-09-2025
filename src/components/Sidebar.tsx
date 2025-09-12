import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ArrowUpDown, 
  ClipboardList, 
  BarChart3, 
  Users, 
  Settings,
  X,
  Building2
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();

  const menuItems = [
    { path: '/', icon: LayoutDashboard, label: 'Tableau de Bord' },
    { path: '/articles', icon: Package, label: 'Articles' },
    { path: '/movements', icon: ArrowUpDown, label: 'Mouvements' },
    { path: '/inventory', icon: ClipboardList, label: 'Inventaire' },
    { path: '/reports', icon: BarChart3, label: 'Rapports' },
    { path: '/users', icon: Users, label: 'Utilisateurs' },
    { path: '/settings', icon: Settings, label: 'Paramètres' },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200" style={{ backgroundColor: '#D4AF37' }}>
          <div className="flex items-center space-x-3">
            <Building2 className="w-8 h-8" style={{ color: '#6B2C91' }} />
            <div>
              <h1 className="text-lg font-bold" style={{ color: '#6B2C91' }}>INSPC</h1>
              <p className="text-xs" style={{ color: '#6B2C91' }}>Befelatanana</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="lg:hidden p-1 rounded-md hover:bg-gray-100"
          >
            <X className="w-5 h-5" style={{ color: '#6B2C91' }} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-4">
          {/* Message spécial pour les validateurs */}
          {userData?.role === 'validator' && (
            <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center">
                <div 
                  className="w-6 h-6 rounded-full flex items-center justify-center mr-2"
                  style={{ backgroundColor: '#FF6B35' }}
                >
                  <span className="text-xs text-white font-bold">V</span>
                </div>
                <div>
                  <p className="text-xs font-medium text-orange-800">Mode Validateur</p>
                  <p className="text-xs text-orange-600">Validation des sorties uniquement</p>
                </div>
              </div>
            </div>
          )}
          
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={onClose}
                    className={`
                      flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200
                      ${isActive 
                        ? 'text-white shadow-md' 
                        : 'text-gray-600 hover:bg-gray-50'
                      }
                    `}
                    style={isActive ? { backgroundColor: '#6B2C91' } : {}}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="text-center">
            <p className="text-xs text-gray-500">Version 1.0.0</p>
            <p className="text-xs text-gray-500">© 2024 INSPC Antananarivo</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;