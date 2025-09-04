import React, { useState } from 'react';
import { X, Upload, Image, Save } from 'lucide-react';

interface LogoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (logoData: any) => void;
}

const LogoUploadModal: React.FC<LogoUploadModalProps> = ({ isOpen, onClose, onSave }) => {
  const [logoData, setLogoData] = useState({
    type: 'upload',
    file: null as File | null,
    url: '',
    name: '',
    description: ''
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoData({ ...logoData, file, name: file.name });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(logoData);
    setLogoData({
      type: 'upload',
      file: null,
      url: '',
      name: '',
      description: ''
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <Image className="w-6 h-6 mr-3" style={{ color: '#6B2C91' }} />
            <h2 className="text-xl font-semibold" style={{ color: '#6B2C91' }}>
              Gestion du Logo
            </h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Logo Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Type de logo
              </label>
              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="logoType"
                    value="upload"
                    checked={logoData.type === 'upload'}
                    onChange={(e) => setLogoData({ ...logoData, type: e.target.value })}
                    className="h-4 w-4 focus:ring-2"
                    style={{ '--tw-ring-color': '#6B2C91' } as any}
                  />
                  <div className="ml-3">
                    <Upload className="w-5 h-5 mb-1" style={{ color: '#6B2C91' }} />
                    <p className="text-sm font-medium">Télécharger un fichier</p>
                    <p className="text-xs text-gray-500">PNG, JPG, SVG</p>
                  </div>
                </label>
                <label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="logoType"
                    value="url"
                    checked={logoData.type === 'url'}
                    onChange={(e) => setLogoData({ ...logoData, type: e.target.value })}
                    className="h-4 w-4 focus:ring-2"
                    style={{ '--tw-ring-color': '#6B2C91' } as any}
                  />
                  <div className="ml-3">
                    <Image className="w-5 h-5 mb-1" style={{ color: '#6B2C91' }} />
                    <p className="text-sm font-medium">URL d'image</p>
                    <p className="text-xs text-gray-500">Lien externe</p>
                  </div>
                </label>
              </div>
            </div>

            {/* File Upload */}
            {logoData.type === 'upload' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fichier logo *
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      Glissez-déposez votre logo ici ou
                    </p>
                    <label className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      Parcourir les fichiers
                    </label>
                  </div>
                  {logoData.file && (
                    <p className="text-sm text-green-600 mt-2">
                      Fichier sélectionné: {logoData.file.name}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* URL Input */}
            {logoData.type === 'url' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL du logo *
                </label>
                <input
                  type="url"
                  required={logoData.type === 'url'}
                  value={logoData.url}
                  onChange={(e) => setLogoData({ ...logoData, url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                  style={{ '--tw-ring-color': '#6B2C91' } as any}
                  placeholder="https://exemple.com/logo.png"
                />
              </div>
            )}

            {/* Logo Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom du logo
              </label>
              <input
                type="text"
                value={logoData.name}
                onChange={(e) => setLogoData({ ...logoData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                style={{ '--tw-ring-color': '#6B2C91' } as any}
                placeholder="Ex: Logo principal INSPC"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                rows={3}
                value={logoData.description}
                onChange={(e) => setLogoData({ ...logoData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                style={{ '--tw-ring-color': '#6B2C91' } as any}
                placeholder="Description du logo..."
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="flex items-center px-6 py-2 text-white rounded-lg hover:opacity-90 transition-opacity"
              style={{ backgroundColor: '#6B2C91' }}
            >
              <Save className="w-4 h-4 mr-2" />
              Enregistrer Logo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LogoUploadModal;