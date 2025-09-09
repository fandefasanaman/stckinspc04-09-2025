import React from 'react';

const Settings: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#6B2C91' }}>
          Paramètres
        </h1>
        <p className="text-gray-600 mt-1">
          Configuration de l'application
        </p>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm p-6">
        <p className="text-gray-500">
          Page de paramètres en cours de développement...
        </p>
      </div>
    </div>
  );
};

export default Settings;