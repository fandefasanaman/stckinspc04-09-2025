import React from 'react';
import { Menu, Bell, Search, User, LogOut } from 'lucide-react';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  return (
    <header className="bg-white shadow-sm border-b" style={{ borderColor: '#E5E0DB' }}>
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
              className="pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:border-transparent w-80"
              style={{ borderColor: '#E5E0DB', '--tw-ring-color': '#6B2C91' } as any}
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
              style={{ backgroundColor: '#2D8A47' }}
            >
              3
            </span>
          </button>

          {/* User menu */}
          <div className="flex items-center space-x-3">
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium" style={{ color: '#6B2C91' }}>Admin INSPC Befelatanana</p>
              <p className="text-xs" style={{ color: '#5A4A42' }}>Administrateur</p>
            </div>
            <div className="relative">
              <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100">
                <div 
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                  style={{ backgroundColor: '#2D8A47' }}
                >
                  <User className="w-4 h-4" />
                </div>
              </button>
            </div>
            <button className="p-2 rounded-lg hover:bg-gray-100">
              <LogOut className="w-5 h-5" style={{ color: '#2D8A47' }} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;