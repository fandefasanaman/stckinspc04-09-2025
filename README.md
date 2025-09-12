# Application de Gestion de Stock INSPC - Befelatanana

## Description
Application web de gestion de stock développée pour l'Institut National de Santé Publique et Communautaire (INSPC) de Befelatanana. Cette application permet de gérer efficacement les stocks de fournitures, consommables médicaux, matériel informatique et produits d'entretien.

## Fonctionnalités

### 🔐 Authentification et Autorisation
- Connexion sécurisée avec Firebase Authentication
- Gestion des rôles (Admin, Gestionnaire, Responsable, Utilisateur)
- Contrôle d'accès basé sur les permissions

### 📦 Gestion des Articles
- Catalogue complet des articles avec codes, catégories et unités
- Suivi des stocks minimum et maximum
- Gestion des fournisseurs
- Alertes automatiques pour les stocks faibles

### 📊 Mouvements de Stock
- Enregistrement des entrées et sorties
- Validation des mouvements par les responsables
- Traçabilité complète des opérations
- Historique détaillé par service

### 📋 Inventaires
- Planification et suivi des inventaires physiques
- Comparaison stock théorique vs physique
- Gestion des écarts et ajustements
- Validation par les responsables

### 📈 Rapports et Analyses
- Tableaux de bord avec indicateurs clés
- Rapports de consommation par service
- Analyses des tendances
- Export des données (PDF, Excel, CSV)

### 👥 Gestion des Utilisateurs
- Administration des comptes utilisateurs
- Attribution des rôles et permissions
- Suivi des connexions et activités

## Technologies Utilisées

### Frontend
- **React 18** avec TypeScript
- **Tailwind CSS** pour le styling
- **React Router** pour la navigation
- **Lucide React** pour les icônes

### Backend
- **Firebase Authentication** pour l'authentification
- **Cloud Firestore** pour la base de données
- **Firebase Storage** pour le stockage de fichiers

### Outils de Développement
- **Vite** comme bundler
- **ESLint** pour la qualité du code
- **PostCSS** et **Autoprefixer**

## Structure du Projet

```
src/
├── components/          # Composants réutilisables
│   ├── modals/         # Modales (création, édition)
│   ├── Header.tsx      # En-tête de l'application
│   ├── Sidebar.tsx     # Menu de navigation
│   └── ...
├── contexts/           # Contextes React
│   └── AuthContext.tsx # Gestion de l'authentification
├── hooks/              # Hooks personnalisés
│   ├── useModal.ts     # Gestion des modales
│   └── useFirestore.ts # Hook Firestore
├── pages/              # Pages principales
│   ├── Dashboard.tsx   # Tableau de bord
│   ├── Articles.tsx    # Gestion des articles
│   ├── Movements.tsx   # Mouvements de stock
│   ├── Inventory.tsx   # Inventaires
│   ├── Reports.tsx     # Rapports
│   ├── Users.tsx       # Gestion utilisateurs
│   └── Settings.tsx    # Paramètres
├── services/           # Services Firebase
│   ├── authService.ts  # Service d'authentification
│   ├── articleService.ts # Service articles
│   ├── movementService.ts # Service mouvements
│   ├── userService.ts  # Service utilisateurs
│   └── alertService.ts # Service alertes
├── types/              # Types TypeScript
│   └── index.ts        # Définitions des types
├── config/             # Configuration
│   └── firebase.ts     # Configuration Firebase
└── App.tsx             # Composant principal
```

## Installation et Configuration

### Prérequis
- Node.js 18+ 
- npm ou yarn
- Compte Firebase

### Installation
```bash
# Cloner le projet
git clone [URL_DU_REPO]
cd stock-inspc

# Installer les dépendances
npm install

# Démarrer en mode développement
npm run dev
```

### Configuration Firebase
1. Créer un projet Firebase
2. Activer Authentication (Email/Password)
3. Créer une base de données Firestore
4. Configurer les règles de sécurité Firestore
5. Mettre à jour la configuration dans `src/config/firebase.ts`

### Règles de Sécurité Firestore
Copier le contenu du fichier `firestore.rules` dans la console Firebase.

## Utilisation

### Première Connexion
1. Un compte administrateur doit être créé manuellement dans Firebase
2. Se connecter avec les identifiants administrateur
3. Créer les autres utilisateurs via l'interface

### Gestion Quotidienne
1. **Entrées de Stock** : Enregistrer les réceptions de marchandises
2. **Sorties de Stock** : Traiter les demandes des services
3. **Suivi des Alertes** : Vérifier les stocks faibles quotidiennement
4. **Validation** : Approuver les mouvements en attente

### Inventaires Périodiques
1. Planifier un inventaire via l'interface
2. Effectuer le comptage physique
3. Saisir les quantités réelles
4. Valider les écarts et ajustements

## Rôles et Permissions

### Administrateur
- Accès complet à toutes les fonctionnalités
- Gestion des utilisateurs et paramètres système
- Validation de tous les mouvements

### Gestionnaire
- Gestion complète des stocks
- Validation des mouvements
- Accès aux rapports détaillés

### Responsable de Service
- Validation des demandes de son service
- Consultation des stocks
- Rapports de son service

### Validateur de Sorties
- Validation exclusive des sorties de stock en attente
- Consultation en lecture seule de tous les mouvements
- Accès aux rapports de validation
- Interface simplifiée et spécialisée

### Utilisateur
- Demandes de sortie uniquement
- Consultation limitée des stocks
- Historique personnel

## Maintenance et Support

### Sauvegarde
- Les données sont automatiquement sauvegardées par Firebase
- Exporter régulièrement les données importantes

### Monitoring
- Surveiller les alertes de stock
- Vérifier les logs d'erreur dans Firebase Console
- Contrôler l'utilisation des quotas Firebase

### Mises à Jour
- Tester les mises à jour en environnement de développement
- Déployer progressivement en production
- Informer les utilisateurs des nouvelles fonctionnalités

## Contact et Support
Pour toute question ou problème technique, contacter l'équipe de développement ou l'administrateur système de l'INSPC.

---
© 2024 Institut National de Santé Publique et Communautaire - Befelatanana
Version 1.0.0