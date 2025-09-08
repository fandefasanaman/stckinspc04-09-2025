import React from 'react';
import { Menu, Bell, Search, User, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { userData, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-md hover:bg-gray-100"
          >
            <Menu className="w-5 h-5" style={{ color: '#6B2C91' }} />
          </button>
          
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent w-80"
              style={{ focusRingColor: '#6B2C91' }}
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="relative p-2 rounded-full hover:bg-gray-100">
            <Bell className="w-5 h-5" style={{ color: '#6B2C91' }} />
            <span 
              className="absolute -top-1 -right-1 w-4 h-4 text-xs text-white rounded-full flex items-center justify-center"
              style={{ backgroundColor: '#DC143C' }}
            >
              3
            </span>
          </button>

          {/* User menu */}
          <div className="flex items-center space-x-3">
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium" style={{ color: '#6B2C91' }}>
                {userData?.name || 'Utilisateur'}
              </p>
              <p className="text-xs text-gray-500">
                {userData?.role === 'admin' ? 'Administrateur' :
                 userData?.role === 'manager' ? 'Gestionnaire' :
                 userData?.role === 'supervisor' ? 'Responsable' : 'Utilisateur'}
              </p>
            </div>
            <div className="relative">
              <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                  style={{ backgroundColor: '#00A86B' }}
                >
                  {userData?.name ? userData.name.charAt(0).toUpperCase() : <User className="w-4 h-4" />}
                </div>
              </button>
            </div>
            <button 
              onClick={handleSignOut}
              className="p-2 rounded-lg hover:bg-gray-100"
              title="Se déconnecter"
            >
              <LogOut className="w-5 h-5" style={{ color: '#DC143C' }} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;