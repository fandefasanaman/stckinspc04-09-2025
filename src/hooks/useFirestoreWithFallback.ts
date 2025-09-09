import { useState, useEffect, useRef } from 'react';
import { 
  collection, 
  query, 
  onSnapshot, 
  QueryConstraint,
  DocumentData 
} from 'firebase/firestore';
import { db } from '../config/firebase';

// Interface pour les données avec fallback
interface FirestoreWithFallbackResult<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  isOffline: boolean;
  isUsingFallback: boolean;
  loadingMessage: string;
  retryConnection: () => void;
}

// Données de fallback pour les articles
const FALLBACK_ARTICLES = [
  {
    id: 'fallback-1',
    code: 'FB001',
    name: 'Papier A4 80g',
    category: 'Fournitures Bureau',
    unit: 'paquet',
    currentStock: 45,
    minStock: 20,
    maxStock: 100,
    status: 'normal' as const,
    supplier: 'FOURNITURES ANTANANARIVO',
    description: 'Papier blanc A4 80g/m² pour impression',
    createdAt: '2024-01-15T10:00:00.000Z',
    updatedAt: '2024-01-20T14:30:00.000Z',
    lastEntry: '2024-01-20T14:30:00.000Z'
  },
  {
    id: 'fallback-2',
    code: 'IT002',
    name: 'Cartouches HP 305',
    category: 'Consommables IT',
    unit: 'unité',
    currentStock: 8,
    minStock: 15,
    maxStock: 50,
    status: 'low' as const,
    supplier: 'DISTRIMAD',
    description: 'Cartouches d\'encre HP 305 noir et couleur',
    createdAt: '2024-01-10T09:00:00.000Z',
    updatedAt: '2024-01-22T11:15:00.000Z',
    lastEntry: '2024-01-18T16:45:00.000Z'
  },
  {
    id: 'fallback-3',
    code: 'MED003',
    name: 'Gants latex M',
    category: 'Consommables Médicaux',
    unit: 'boîte',
    currentStock: 0,
    minStock: 10,
    maxStock: 30,
    status: 'out' as const,
    supplier: 'PHARMADIS MADAGASCAR',
    description: 'Gants d\'examen en latex taille M, boîte de 100',
    createdAt: '2024-01-05T08:30:00.000Z',
    updatedAt: '2024-01-23T09:00:00.000Z',
    lastEntry: '2024-01-15T13:20:00.000Z'
  },
  {
    id: 'fallback-4',
    code: 'ENT004',
    name: 'Désinfectant surfaces',
    category: 'Produits Entretien',
    unit: 'litre',
    currentStock: 25,
    minStock: 15,
    maxStock: 40,
    status: 'normal' as const,
    supplier: 'HYGIÈNE MADA',
    description: 'Désinfectant multi-surfaces virucide',
    createdAt: '2024-01-08T14:00:00.000Z',
    updatedAt: '2024-01-21T10:45:00.000Z',
    lastEntry: '2024-01-21T10:45:00.000Z'
  },
  {
    id: 'fallback-5',
    code: 'FB005',
    name: 'Stylos bille bleu',
    category: 'Fournitures Bureau',
    unit: 'paquet',
    currentStock: 12,
    minStock: 10,
    maxStock: 50,
    status: 'normal' as const,
    supplier: 'FOURNITURES ANTANANARIVO',
    description: 'Stylos à bille bleu, paquet de 10',
    createdAt: '2024-01-12T11:30:00.000Z',
    updatedAt: '2024-01-19T15:20:00.000Z',
    lastEntry: '2024-01-19T15:20:00.000Z'
  }
];

// Données de fallback pour les inventaires
const FALLBACK_INVENTORIES = [
  {
    id: 'fallback-inv-1',
    name: 'Inventaire Trimestriel Q1 2024',
    category: 'Général',
    responsible: 'Marie Kouassi',
    scheduledDate: '2024-03-15',
    status: 'completed' as const,
    articlesCount: 125,
    discrepancies: 3,
    description: 'Inventaire trimestriel complet de tous les articles',
    includeCategories: ['Fournitures Bureau', 'Consommables IT'],
    createdAt: '2024-03-01T08:00:00.000Z',
    completedAt: '2024-03-15T17:30:00.000Z'
  },
  {
    id: 'fallback-inv-2',
    name: 'Inventaire Médical Janvier',
    category: 'Consommables Médicaux',
    responsible: 'Dr. Aya Traoré',
    scheduledDate: '2024-01-30',
    status: 'validated' as const,
    articlesCount: 45,
    discrepancies: 1,
    description: 'Inventaire spécialisé des consommables médicaux',
    includeCategories: ['Consommables Médicaux'],
    createdAt: '2024-01-20T09:00:00.000Z',
    completedAt: '2024-01-30T16:00:00.000Z',
    validatedAt: '2024-02-01T10:00:00.000Z'
  }
];

// Données de fallback pour les rapports
const FALLBACK_REPORTS = [
  {
    id: 'fallback-report-1',
    name: 'Rapport Mensuel Janvier 2024',
    type: 'stock_status' as const,
    period: 'month',
    format: 'pdf' as const,
    includeCharts: true,
    includeDetails: true,
    services: ['Service Administratif', 'Service IT'],
    categories: ['Fournitures Bureau', 'Consommables IT'],
    createdBy: 'admin-1',
    createdAt: '2024-02-01T10:00:00.000Z',
    lastGenerated: '2024-02-01T10:30:00.000Z'
  },
  {
    id: 'fallback-report-2',
    name: 'Analyse Consommation Q1',
    type: 'consumption' as const,
    period: 'quarter',
    format: 'excel' as const,
    includeCharts: false,
    includeDetails: true,
    services: ['Tous'],
    categories: ['Toutes'],
    createdBy: 'manager-1',
    createdAt: '2024-03-31T15:00:00.000Z'
  }
];

// Données de fallback pour les utilisateurs
const FALLBACK_USERS = [
  {
    id: 'fallback-user-1',
    name: 'Marie Kouassi',
    email: 'marie.kouassi@inspc.mg',
    phone: '+261 34 12 345 67',
    role: 'manager' as const,
    service: 'Service Administratif',
    status: 'active' as const,
    createdAt: '2024-01-01T08:00:00.000Z',
    lastLogin: '2024-01-25T09:30:00.000Z'
  },
  {
    id: 'fallback-user-2',
    name: 'Dr. Aya Traoré',
    email: 'aya.traore@inspc.mg',
    phone: '+261 34 23 456 78',
    role: 'supervisor' as const,
    service: 'Service Médical',
    status: 'active' as const,
    createdAt: '2024-01-05T10:00:00.000Z',
    lastLogin: '2024-01-24T14:15:00.000Z'
  },
  {
    id: 'fallback-user-3',
    name: 'Jean Koffi',
    email: 'jean.koffi@inspc.mg',
    phone: '+261 34 34 567 89',
    role: 'user' as const,
    service: 'Service IT',
    status: 'active' as const,
    createdAt: '2024-01-10T11:00:00.000Z',
    lastLogin: '2024-01-23T16:45:00.000Z'
  }
];
// Cache local pour les données
const localCache = new Map<string, any[]>();

export function useFirestoreWithFallback<T = DocumentData>(
  collectionName: string, 
  queryConstraints: QueryConstraint[] = [],
  fallbackData?: T[]
): FirestoreWithFallbackResult<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [isUsingFallback, setIsUsingFallback] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState('Initialisation...');
  const mounted = useRef(true);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Obtenir les données de fallback appropriées
  const getFallbackData = (): T[] => {
    if (fallbackData) return fallbackData;
    
    // Données de fallback spécifiques par collection
    switch (collectionName) {
      case 'articles':
        return FALLBACK_ARTICLES as T[];
      case 'inventories':
        return FALLBACK_INVENTORIES as T[];
      case 'reports':
        return FALLBACK_REPORTS as T[];
      case 'users':
        return FALLBACK_USERS as T[];
      default:
        return localCache.get(collectionName) || [];
    }
  };

  // Fonction pour utiliser les données de fallback
  const useFallbackData = (errorMessage?: string) => {
    if (!mounted.current) return;
    
    const fallback = getFallbackData();
    console.warn(`📦 Utilisation des données de fallback pour ${collectionName} (${fallback.length} éléments):`, errorMessage);
    
    setData(fallback);
    setIsUsingFallback(true);
    setIsOffline(true);
    setError(errorMessage || `Données locales utilisées (${fallback.length} éléments disponibles)`);
    setLoading(false);
    setLoadingMessage('');
  };

  // Fonction pour réessayer la connexion
  const retryConnection = () => {
    if (!mounted.current) return;
    
    console.log(`🔄 Tentative de reconnexion à Firebase pour ${collectionName}...`);
    setRetryCount(prev => prev + 1);
    setError(null);
    setLoading(true);
    setLoadingMessage('Reconnexion en cours...');
  };

  // Fonction principale pour se connecter à Firebase
  const connectToFirebase = () => {
    if (!mounted.current) return;

    try {
      setLoadingMessage('Connexion à Firebase...');
      
      // 🚀 TIMEOUT OPTIMISÉ avec messages de progression
      let progressStage = 0;
      const progressMessages = [
        'Connexion à Firebase...',
        'Authentification en cours...',
        'Chargement des données...',
        'Synchronisation...',
        'Finalisation...'
      ];
      
      const progressInterval = setInterval(() => {
        if (mounted.current && loading && progressStage < progressMessages.length - 1) {
          progressStage++;
          setLoadingMessage(progressMessages[progressStage]);
        }
      }, 4000); // Toutes les 4 secondes
      
      // Timeout augmenté à 25 secondes avec retry automatique
      const timeoutId = setTimeout(() => {
        if (mounted.current && loading) {
          console.warn(`⏰ Timeout Firebase pour ${collectionName} après 25s - basculement vers fallback`);
          
          // Essayer un retry automatique avant le fallback
          if (retryCount < 2) {
            console.log(`🔄 Retry automatique ${retryCount + 1}/2 pour ${collectionName}`);
            setRetryCount(prev => prev + 1);
            setLoadingMessage('Nouvelle tentative...');
            return;
          }
          
          useFallbackData('Connexion lente - données locales chargées');
        }
      }, 25000); // 25 secondes timeout

      const q = query(collection(db, collectionName), ...queryConstraints);
      
      const unsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
          clearTimeout(timeoutId);
          clearInterval(progressInterval);
          if (!mounted.current) return;

          try {
            const documents = querySnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            } as T));
            
            // Sauvegarder dans le cache local
            localCache.set(collectionName, documents);
            
            console.log(`✅ Firebase connecté avec succès pour ${collectionName}: ${documents.length} éléments`);
            setData(documents);
            setLoading(false);
            setError(null);
            setIsOffline(false);
            setIsUsingFallback(false);
            setLoadingMessage('');
          } catch (processingError) {
            console.error('Erreur lors du traitement des données Firebase:', processingError);
            useFallbackData('Erreur de traitement des données');
          }
        },
        (firestoreError) => {
          clearTimeout(timeoutId);
          clearInterval(progressInterval);
          if (!mounted.current) return;
          
          console.error('Erreur Firestore:', firestoreError);
          
          // Gestion spécifique des erreurs
          let errorMessage = 'Connexion Firebase interrompue';
          if (firestoreError.code === 'unavailable') {
            errorMessage = 'Firebase temporairement indisponible - données locales utilisées';
          } else if (firestoreError.code === 'permission-denied') {
            errorMessage = 'Permissions insuffisantes - vérifiez votre authentification';
          } else if (firestoreError.code === 'failed-precondition') {
            errorMessage = 'Configuration Firebase incorrecte - contactez l\'administrateur';
          }
          
          useFallbackData(errorMessage);
        }
      );

      unsubscribeRef.current = unsubscribe;
      
    } catch (connectionError) {
      console.error('Erreur de connexion Firebase:', connectionError);
      useFallbackData('Impossible de se connecter à Firebase');
    }
  };

  // Effect principal
  useEffect(() => {
    mounted.current = true;
    setLoading(true);
    setError(null);
    setIsOffline(false);
    setIsUsingFallback(false);
    setLoadingMessage('Initialisation...');

    // Vérifier d'abord si on a des données en cache
    const cachedData = localCache.get(collectionName);
    if (cachedData && cachedData.length > 0) {
      setData(cachedData as T[]);
      // Ne pas arrêter le loading, continuer à essayer Firebase en arrière-plan
      console.log(`📦 Données en cache trouvées pour ${collectionName} (${cachedData.length} éléments)`);
      setLoadingMessage('Synchronisation avec Firebase...');
    }

    // Essayer de se connecter à Firebase
    connectToFirebase();

    return () => {
      mounted.current = false;
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [collectionName, JSON.stringify(queryConstraints), retryCount]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      mounted.current = false;
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);

  return { 
    data, 
    loading, 
    error, 
    isOffline, 
    isUsingFallback,
    loadingMessage,
    retryConnection
  };
}