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
import { useFirestoreWithFallback } from '../hooks/useFirestoreWithFallback';
import { useAuth } from '../contexts/AuthContext';
import { UserServiceWithFallback } from '../services/userServiceWithFallback';
import NewUserModal from '../components/modals/NewUserModal';
import { User as UserType } from '../types';

const Users: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [loading, setLoading] = useState(false);
  const newUserModal = useModal();
  const { userData } = useAuth();

  // Utiliser le hook avec fallback pour récupérer les utilisateurs
  const { 
    data: users, 
    loading: usersLoading, 
    error, 
    isOffline, 
    isUsingFallback, 
    loadingMessage,
    retryConnection 
  } = useFirestoreWithFallback<UserType>('users');

  const roles = [
    { value: 'all', label: 'Tous les rôles' },
    { value: 'admin', label: 'Administrateur' },
    { value: 'manager', label: 'Gestionnaire' },
    { value: 'supervisor', label: 'Responsable Service' },
    { value: 'user', label: 'Utilisateur' }
  ];

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      admin: { label: 'Administrateur', color: '#DC143C', bgColor: '#DC143C20' },
      manager: { label: 'Gestionnaire', color: '#6B2C91', bgColor: '#6B2C9120' },
      supervisor: { label: 'Responsable', color: '#D4AF37', bgColor: '#D4AF3720' },
      user: { label: 'Utilisateur', color: '#00A86B', bgColor: '#00A86B20' }
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
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
        Actif
      </span>
    ) : (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
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

  const handleNewUser = async (newUserData: any) => {
    if (!userData) return;
    
    setLoading(true);
    try {
      // Créer l'utilisateur avec Firebase Auth et Firestore
      await UserServiceWithFallback.createUser({
        name: newUserData.name,
        email: newUserData.email,
        phone: newUserData.phone,
        role: newUserData.role,
        service: newUserData.service,
        status: 'active'
      }, newUserData.password);
      
      // Le hook useFirestore se mettra à jour automatiquement
    } catch (error: any) {
      console.error('Erreur lors de la création de l\'utilisateur:', error);
      alert('Erreur lors de la création de l\'utilisateur: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = async (userId: string, updates: Partial<UserType>) => {
    try {
      await UserServiceWithFallback.updateUser(userId, updates);
    } catch (error: any) {
      console.error('Erreur lors de la modification de l\'utilisateur:', error);
      alert('Erreur lors de la modification: ' + error.message);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;
    
    try {
      await UserServiceWithFallback.deleteUser(userId);
    } catch (error: any) {
      console.error('Erreur lors de la suppression de l\'utilisateur:', error);
      alert('Erreur lors de la suppression: ' + error.message);
    }
  };

  const roleStats = {
    admin: users.filter(u => u.role === 'admin').length,
    manager: users.filter(u => u.role === 'manager').length,
    supervisor: users.filter(u => u.role === 'supervisor').length,
    user: users.filter(u => u.role === 'user').length
  };

  if (usersLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 mx-auto mb-4" style={{ borderColor: '#6B2C91' }}></div>
          <p className="text-lg font-medium" style={{ color: '#6B2C91' }}>
            {loadingMessage}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Connexion à Firebase en cours...
          </p>
        </div>
      </div>
    );
  }

  if (error && users.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Erreur</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={retryConnection}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#6B2C91' }}>
            Gestion des Utilisateurs
          </h1>
          {/* 🚀 INDICATEUR DE STATUT AMÉLIORÉ */}
          <div className="flex items-center mt-2 space-x-4">
            <div className="flex items-center">
              {isOffline ? (
                <span className="text-sm text-red-600">Mode hors ligne</span>
              ) : (
                <span className="text-sm text-green-600">Connecté ({users.length} utilisateurs)</span>
              )}
            </div>
            
            {isUsingFallback && (
              <div className="flex items-center">
                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                  Données locales ({users.length})
                </span>
                <button
                  onClick={retryConnection}
                  className="ml-2 p-1 hover:bg-gray-100 rounded"
                  title="Réessayer la connexion"
                >
                  <RefreshCw className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            )}
          </div>
          <p className="text-gray-600 mt-1">
            Gérez les comptes utilisateurs et leurs permissions
          </p>
        </div>
        <button 
          onClick={newUserModal.openModal}
          disabled={loading}
          className="flex items-center px-4 py-2 text-white rounded-lg hover:opacity-90 transition-opacity"
          style={{ backgroundColor: '#6B2C91' }}
        >
          <Plus className="w-4 h-4 mr-2" />
          {loading ? 'Création...' : 'Nouvel Utilisateur'}
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
        {/* 🚀 MESSAGE D'ÉTAT AMÉLIORÉ */}
        {error && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center">
              <Users className="w-5 h-5 text-blue-500 mr-2" />
              <div className="flex-1">
                <p className="text-sm text-blue-800">
                  {error} • {users.length} utilisateurs disponibles
                </p>
                {isUsingFallback && (
                  <p className="text-xs text-blue-600 mt-1">
                    ✅ Vous pouvez continuer à travailler • Synchronisation automatique en arrière-plan
                  </p>
                )}
              </div>
              {(isOffline || isUsingFallback) && (
                <button
                  onClick={retryConnection}
                  className="ml-2 px-3 py-1 text-xs bg-blue-200 text-blue-800 rounded hover:bg-blue-300"
                >
                  Réessayer
                </button>
              )}
            </div>
          </div>
        )}
        
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
                      onClick={() => handleEditUser(user.id, { status: user.status === 'active' ? 'inactive' : 'active' })}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Rôle
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                  Statut
                      onClick={() => handleDeleteUser(user.id)}
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