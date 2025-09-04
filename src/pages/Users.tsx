import React, { useState } from 'react';
import { 
  Users as UsersIcon, 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2,
  Shield,
  User,
  Mail,
  Phone,
  Building
} from 'lucide-react';
import { useModal } from '../hooks/useModal';
import NewUserModal from '../components/modals/NewUserModal';

const Users: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const newUserModal = useModal();

  const roles = [
    { value: 'all', label: 'Tous les rôles' },
    { value: 'admin', label: 'Administrateur' },
    { value: 'manager', label: 'Gestionnaire' },
    { value: 'supervisor', label: 'Responsable Service' },
    { value: 'user', label: 'Utilisateur' }
  ];

  const users = [
    {
      id: 1,
      name: 'Marie Kouassi',
      email: 'marie.kouassi@inspc.mg',
      phone: '+261 34 12 345 67',
      role: 'admin',
      service: 'Service Administratif',
      status: 'active',
      lastLogin: '2024-01-15 10:30',
      createdAt: '2023-06-15'
    },
    {
      id: 2,
      name: 'Dr. Aya Traoré',
      email: 'aya.traore@inspc.mg',
      phone: '+261 33 98 765 43',
      role: 'manager',
      service: 'Unité d\'Échographie',
      status: 'active',
      lastLogin: '2024-01-15 09:15',
      createdAt: '2023-08-20'
    },
    {
      id: 3,
      name: 'Jean Koffi',
      email: 'jean.koffi@inspc.mg',
      phone: '+261 32 23 456 78',
      role: 'supervisor',
      service: 'Service Pédagogique et Scientifique',
      status: 'active',
      lastLogin: '2024-01-14 16:45',
      createdAt: '2023-09-10'
    },
    {
      id: 4,
      name: 'Paul Diabaté',
      email: 'paul.diabate@inspc.mg',
      phone: '+261 34 87 654 32',
      role: 'user',
      service: 'Direction Générale',
      status: 'active',
      lastLogin: '2024-01-14 14:20',
      createdAt: '2023-11-05'
    },
    {
      id: 5,
      name: 'Fatou Bamba',
      email: 'fatou.bamba@inspc.mg',
      phone: '+261 33 11 223 34',
      role: 'user',
      service: 'Service Documentation',
      status: 'inactive',
      lastLogin: '2024-01-10 11:30',
      createdAt: '2023-12-01'
    }
  ];

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      admin: { label: 'Administrateur', color: '#2D8A47', bgColor: '#2D8A4720' },
      manager: { label: 'Gestionnaire', color: '#6B2C91', bgColor: '#6B2C9120' },
      supervisor: { label: 'Responsable', color: '#D4AF37', bgColor: '#D4AF3720' },
      user: { label: 'Utilisateur', color: '#2D8A47', bgColor: '#2D8A4720' }
    };

    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.user;

    return (
      <span 
        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
        style={{ backgroundColor: config.bgColor, color: config.color }}
      >
        <Shield className="w-3 h-3 mr-1" />
        {config.label}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    return status === 'active' ? (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: '#2D8A4720', color: '#2D8A47' }}>
        Actif
      </span>
    ) : (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: '#2D8A4720', color: '#2D8A47' }}>
        Inactif
      </span>
    );
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.service.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const handleNewUser = (userData: any) => {
    console.log('Nouvel utilisateur:', userData);
    // Logique pour créer l'utilisateur
  };

  const roleStats = {
    admin: users.filter(u => u.role === 'admin').length,
    manager: users.filter(u => u.role === 'manager').length,
    supervisor: users.filter(u => u.role === 'supervisor').length,
    user: users.filter(u => u.role === 'user').length
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#6B2C91' }}>
            Gestion des Utilisateurs
          </h1>
          <p className="mt-1" style={{ color: '#5A4A42' }}>
            Gérez les comptes utilisateurs et leurs permissions
          </p>
        </div>
        <button 
          onClick={newUserModal.openModal}
          className="flex items-center px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity"
          style={{ backgroundColor: '#6B2C91' }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouvel Utilisateur
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center mr-4"
              style={{ backgroundColor: '#6B2C9120' }}
            >
              <UsersIcon className="w-6 h-6" style={{ color: '#6B2C91' }} />
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: '#6B2C91' }}>
                {users.length}
              </p>
              <p className="text-sm text-gray-600">Total Utilisateurs</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center mr-4"
              style={{ backgroundColor: '#DC143C20' }}
            >
              <Shield className="w-6 h-6" style={{ color: '#DC143C' }} />
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: '#DC143C' }}>
                {roleStats.admin}
              </p>
              <p className="text-sm text-gray-600">Administrateurs</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center mr-4"
              style={{ backgroundColor: '#D4AF3720' }}
            >
              <Shield className="w-6 h-6" style={{ color: '#D4AF37' }} />
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: '#D4AF37' }}>
                {roleStats.manager + roleStats.supervisor}
              </p>
              <p className="text-sm text-gray-600">Gestionnaires</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center">
            <div 
              className="w-12 h-12 rounded-lg flex items-center justify-center mr-4"
              style={{ backgroundColor: '#00A86B20' }}
            >
              <User className="w-6 h-6" style={{ color: '#00A86B' }} />
            </div>
            <div>
              <p className="text-2xl font-bold" style={{ color: '#00A86B' }}>
                {users.filter(u => u.status === 'active').length}
              </p>
              <p className="text-sm text-gray-600">Utilisateurs Actifs</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un utilisateur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
              style={{ '--tw-ring-color': '#6B2C91' } as any}
            />
          </div>

          {/* Role Filter */}
          <div className="flex items-center space-x-4">
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
              style={{ '--tw-ring-color': '#6B2C91' } as any}
            >
              {roles.map(role => (
                <option key={role.value} value={role.value}>
                  {role.label}
                </option>
              ))}
            </select>
            <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Filter className="w-4 h-4 mr-2" />
              Filtres
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead style={{ backgroundColor: '#6B2C91' }}>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Utilisateur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Rôle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Dernière Connexion
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-white uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium mr-3"
                        style={{ backgroundColor: '#6B2C91' }}
                      >
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {user.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          Créé le {user.createdAt}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      <div className="flex items-center text-sm text-gray-900">
                        <Mail className="w-4 h-4 mr-2 text-gray-400" />
                        {user.email}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <Phone className="w-4 h-4 mr-2 text-gray-400" />
                        {user.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Building className="w-4 h-4 mr-2 text-gray-400" />
                      <span 
                        className="text-sm font-medium"
                        style={{ color: '#00A86B' }}
                      >
                        {user.service}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getRoleBadge(user.role)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(user.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.lastLogin}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button 
                        className="p-2 rounded-lg hover:bg-gray-100"
                        style={{ color: '#00A86B' }}
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        className="p-2 rounded-lg hover:bg-gray-100"
                        style={{ color: '#DC143C' }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Role Permissions */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold" style={{ color: '#6B2C91' }}>
            Permissions par Rôle
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Aperçu des permissions accordées à chaque rôle
          </p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="border rounded-lg p-4">
              <div className="flex items-center mb-3">
                <Shield className="w-5 h-5 mr-2" style={{ color: '#DC143C' }} />
                <h4 className="font-medium" style={{ color: '#DC143C' }}>
                  Administrateur
                </h4>
              </div>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Configuration système</li>
                <li>• Gestion utilisateurs</li>
                <li>• Tous les rapports</li>
                <li>• Validation inventaires</li>
              </ul>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center mb-3">
                <Shield className="w-5 h-5 mr-2" style={{ color: '#6B2C91' }} />
                <h4 className="font-medium" style={{ color: '#6B2C91' }}>
                  Gestionnaire
                </h4>
              </div>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Gestion stock complète</li>
                <li>• Validation mouvements</li>
                <li>• Rapports détaillés</li>
                <li>• Gestion fournisseurs</li>
              </ul>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center mb-3">
                <Shield className="w-5 h-5 mr-2" style={{ color: '#D4AF37' }} />
                <h4 className="font-medium" style={{ color: '#D4AF37' }}>
                  Responsable
                </h4>
              </div>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Validation demandes service</li>
                <li>• Consultation stock</li>
                <li>• Rapports service</li>
                <li>• Demandes approvisionnement</li>
              </ul>
            </div>

            <div className="border rounded-lg p-4">
              <div className="flex items-center mb-3">
                <User className="w-5 h-5 mr-2" style={{ color: '#00A86B' }} />
                <h4 className="font-medium" style={{ color: '#00A86B' }}>
                  Utilisateur
                </h4>
              </div>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Demandes de sortie</li>
                <li>• Consultation articles</li>
                <li>• Historique personnel</li>
                <li>• Notifications</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      <NewUserModal
        isOpen={newUserModal.isOpen}
        onClose={newUserModal.closeModal}
        onSave={handleNewUser}
      />
    </div>
  );
};

export default Users;