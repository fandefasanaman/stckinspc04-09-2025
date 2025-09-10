import { useState, useEffect, useRef } from 'react';
import { 
  collection, 
  query, 
  onSnapshot, 
  QueryConstraint,
  DocumentData 
} from 'firebase/firestore';
import { db } from '../config/firebase';

export function useFirestoreWithFallback<T = DocumentData>(
  collectionName: string, 
  queryConstraints: QueryConstraint[] = [],
  fallbackData: T[] = [],
  enhancedFallbackData?: T[]
) {
  const [data, setData] = useState<T[]>(enhancedFallbackData || fallbackData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [isUsingFallback, setIsUsingFallback] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Connexion à Firebase...');
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    setLoading(true);
    setError(null);
    setIsOffline(false);
    setIsUsingFallback(false);
    setLoadingMessage('Connexion à Firebase...');

    // Messages de progression
    let timeoutStage = 0;
    const progressMessages = [
      'Connexion à Firebase...',
      'Chargement des données...',
      'Synchronisation en cours...',
      'Finalisation du chargement...'
    ];
    
    const progressInterval = setInterval(() => {
      if (mounted.current && loading && timeoutStage < progressMessages.length - 1) {
        timeoutStage++;
        setLoadingMessage(progressMessages[timeoutStage]);
      }
    }, 3000);
    
    // Timeout de 15 secondes pour passer en mode fallback
    const timeoutId = setTimeout(() => {
      if (mounted.current) {
        console.warn(`Timeout Firebase pour ${collectionName} - utilisation des données de fallback`);
        setError('Connexion lente - utilisation des données en cache');
        setIsOffline(true);
        setIsUsingFallback(true);
        setData(enhancedFallbackData || fallbackData);
        setLoading(false);
        setLoadingMessage('');
      }
    }, 15000);

    const q = query(collection(db, collectionName), ...queryConstraints);
    
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        clearTimeout(timeoutId);
        clearInterval(progressInterval);
        if (mounted.current) {
          const documents = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as T));
          
          console.log(`✅ Données Firebase chargées pour ${collectionName}: ${documents.length} éléments`);
          setData(documents);
          setLoading(false);
          setError(null);
          setIsOffline(false);
          setIsUsingFallback(false);
          setLoadingMessage('');
        }
      },
      (err) => {
        clearTimeout(timeoutId);
        clearInterval(progressInterval);
        if (mounted.current) {
          console.error(`Erreur Firestore pour ${collectionName}:`, err);
          
          // Utiliser les données de fallback en cas d'erreur
          if ((enhancedFallbackData || fallbackData).length > 0) {
            setData(enhancedFallbackData || fallbackData);
            setIsUsingFallback(true);
            setError(`Erreur Firebase: ${err.message} - Données de fallback utilisées`);
          } else {
            setError(`Erreur Firebase: ${err.message}`);
          }
          
          setIsOffline(true);
          setLoading(false);
          setLoadingMessage('');
        }
      }
    );

    return () => {
      mounted.current = false;
      clearTimeout(timeoutId);
      clearInterval(progressInterval);
      unsubscribe();
    };
  }, [collectionName, JSON.stringify(queryConstraints), JSON.stringify(fallbackData), JSON.stringify(enhancedFallbackData)]);

  const retryConnection = () => {
    setError(null);
    setIsOffline(false);
    setIsUsingFallback(false);
    setLoading(true);
    setLoadingMessage('Reconnexion...');
  };

  useEffect(() => {
    return () => {
      mounted.current = false;
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