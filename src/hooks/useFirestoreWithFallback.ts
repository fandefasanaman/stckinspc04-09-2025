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
  const mounted = useRef(true);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Obtenir les données de fallback appropriées
  const getFallbackData = (): T[] => {
    if (fallbackData) return fallbackData;
    
    // Données de fallback spécifiques par collection
    switch (collectionName) {
      case 'articles':
        return FALLBACK_ARTICLES as T[];
      default:
        return localCache.get(collectionName) || [];
    }
  };

  // Fonction pour utiliser les données de fallback
  const useFallbackData = (errorMessage?: string) => {
    if (!mounted.current) return;
    
    const fallback = getFallbackData();
    console.warn(`Utilisation des données de fallback pour ${collectionName}:`, errorMessage);
    
    setData(fallback);
    setIsUsingFallback(true);
    setIsOffline(true);
    setError(errorMessage || 'Connexion Firebase indisponible - données locales utilisées');
    setLoading(false);
  };

  // Fonction pour réessayer la connexion
  const retryConnection = () => {
    if (!mounted.current) return;
    
    console.log(`Tentative de reconnexion à Firebase pour ${collectionName}...`);
    setRetryCount(prev => prev + 1);
    setError(null);
    setLoading(true);
  };

  // Fonction principale pour se connecter à Firebase
  const connectToFirebase = () => {
    if (!mounted.current) return;

    try {
      // Timeout pour éviter l'attente infinie
      const timeoutId = setTimeout(() => {
        if (mounted.current && loading) {
          console.warn(`Timeout Firebase pour ${collectionName} - basculement vers fallback`);
          useFallbackData('Timeout de connexion Firebase');
        }
      }, 8000); // 8 secondes timeout

      const q = query(collection(db, collectionName), ...queryConstraints);
      
      const unsubscribe = onSnapshot(
        q,
        (querySnapshot) => {
          clearTimeout(timeoutId);
          if (!mounted.current) return;

          try {
            const documents = querySnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            } as T));
            
            // Sauvegarder dans le cache local
            localCache.set(collectionName, documents);
            
            setData(documents);
            setLoading(false);
            setError(null);
            setIsOffline(false);
            setIsUsingFallback(false);
            
            console.log(`Données Firebase chargées avec succès pour ${collectionName}:`, documents.length, 'éléments');
          } catch (processingError) {
            console.error('Erreur lors du traitement des données Firebase:', processingError);
            useFallbackData('Erreur de traitement des données');
          }
        },
        (firestoreError) => {
          clearTimeout(timeoutId);
          if (!mounted.current) return;
          
          console.error('Erreur Firestore:', firestoreError);
          
          // Gestion spécifique des erreurs
          let errorMessage = 'Erreur de connexion Firebase';
          if (firestoreError.code === 'unavailable') {
            errorMessage = 'Firebase temporairement indisponible';
          } else if (firestoreError.code === 'permission-denied') {
            errorMessage = 'Permissions insuffisantes';
          } else if (firestoreError.code === 'failed-precondition') {
            errorMessage = 'Configuration Firebase incorrecte';
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

    // Vérifier d'abord si on a des données en cache
    const cachedData = localCache.get(collectionName);
    if (cachedData && cachedData.length > 0) {
      setData(cachedData as T[]);
      setLoading(false);
      console.log(`Données en cache utilisées pour ${collectionName}`);
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
    retryConnection
  };
}