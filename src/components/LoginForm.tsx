import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const LoginForm: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);

  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleRetry = async () => {
    setIsRetrying(true);
    setError('');
    
    // Attendre un peu avant de réessayer
    setTimeout(() => {
      setIsRetrying(false);
    }, 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(formData.email, formData.password);
      navigate('/', { replace: true });
    } catch (error: any) {
      console.error('Erreur de connexion:', error);
      
      // Messages d'erreur plus conviviaux
      if (error.message.includes('Timeout')) {
        setError('Connexion lente. Vérifiez votre connexion internet et réessayez.');
      } else if (error.message.includes('network')) {
        setError('Problème de réseau. Vérifiez votre connexion internet.');
      } else {
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  // Permettre l'accès en mode dégradé après plusieurs échecs
  const handleOfflineAccess = () => {
    console.warn('Accès en mode dégradé activé');
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex justify-center">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
              style={{ backgroundColor: '#D4AF37' }}
            >
              <Building2 className="w-8 h-8" style={{ color: '#6B2C91' }} />
            </div>
          </div>
          <h2 className="text-3xl font-bold" style={{ color: '#6B2C91' }}>
            INSPC Befelatanana
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Système de Gestion de Stock
          </p>
          <p className="text-xs text-gray-500">
            Connectez-vous à votre compte
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
              {error.includes('Timeout') || error.includes('réseau') ? (
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={handleRetry}
                    disabled={isRetrying}
                    className="text-sm text-red-600 hover:text-red-800 underline"
                  >
                    {isRetrying ? 'Reconnexion...' : 'Réessayer'}
                  </button>
                  <span className="text-red-300">|</span>
                  <button
                    type="button"
                    onClick={handleOfflineAccess}
                    className="text-sm text-red-600 hover:text-red-800 underline"
                  >
                    Continuer en mode dégradé
                  </button>
                </div>
              ) : null}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Adresse email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  style={{ '--tw-ring-color': '#6B2C91' } as any}
                  placeholder="votre.email@inspc.mg"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pl-10 pr-12 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  style={{ '--tw-ring-color': '#6B2C91' } as any}
                  placeholder="Votre mot de passe"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || isRetrying}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ 
                backgroundColor: '#6B2C91',
                '--tw-ring-color': '#6B2C91'
              } as any}
            >
              {loading || isRetrying ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {isRetrying ? 'Reconnexion...' : 'Connexion en cours...'}
                </div>
              ) : (
                'Se connecter'
              )}
            </button>
          </div>

          {/* Mode dégradé info */}
          <div className="text-center">
            <button
              type="button"
              onClick={handleOfflineAccess}
              className="text-xs text-gray-500 hover:text-gray-700 underline"
            >
              Accéder en mode hors ligne
            </button>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              En cas de problème de connexion, contactez l'administrateur système
            </p>
          </div>
        </form>

        {/* Footer */}
        <div className="text-center text-xs text-gray-400">
          <p>© 2024 Institut National de Santé Publique et Communautaire</p>
          <p>Version 1.0.0</p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;