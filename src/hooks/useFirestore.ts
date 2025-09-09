import { useState, useEffect, useRef } from 'react';
import { 
  collection, 
  query, 
  onSnapshot, 
  QueryConstraint,
  DocumentData 
} from 'firebase/firestore';
import { db } from '../config/firebase';

export function useFirestore<T = DocumentData>(
  collectionName: string, 
  queryConstraints: QueryConstraint[] = []
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Connexion à Firebase...');
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    setLoading(true);
    setError(null);
    setIsOffline(false);
    setLoadingMessage('Connexion à Firebase...');

    // 🚀 TIMEOUT OPTIMISÉ - Plus long et avec messages progressifs
    let timeoutStage = 0;
    const progressMessages = [
      'Connexion à Firebase...',
      'Chargement des données...',
      'Synchronisation en cours...',
      'Finalisation du chargement...'
    ];
    
    // Messages de progression toutes les 3 secondes
    const progressInterval = setInterval(() => {
      if (mounted.current && loading && timeoutStage < progressMessages.length - 1) {
        timeoutStage++;
        setLoadingMessage(progressMessages[timeoutStage]);
      }
    }, 3000);
    
    // Timeout final augmenté à 20 secondes
    const timeoutId = setTimeout(() => {
      if (mounted.current) {
        console.warn(`Timeout Firebase pour ${collectionName} après 20s - passage en mode dégradé`);
        setError('Connexion lente - utilisation des données en cache');
        setIsOffline(true);
        setLoading(false);
        setLoadingMessage('');
      }
    }, 20000); // 20 secondes timeout (doublé)

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
          
          console.log(`✅ Données Firebase chargées avec succès pour ${collectionName}: ${documents.length} éléments`);
          setData(documents);
          setLoading(false);
          setError(null);
          setIsOffline(false);
          setLoadingMessage('');
        }
      },
      (err) => {
        clearTimeout(timeoutId);
        clearInterval(progressInterval);
        if (mounted.current) {
          console.error('Erreur Firestore:', err);
          
          // Gestion spécifique des erreurs de connexion
          if (err.code === 'unavailable') {
            setError('Firebase temporairement indisponible - données en cache utilisées');
            setIsOffline(true);
          } else if (err.code === 'permission-denied') {
            setError('Permissions insuffisantes pour accéder aux données');
          } else {
            setError(`Erreur Firebase: ${err.message}`);
          }
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
  }, [collectionName, queryConstraints]);

  useEffect(() => {
    return () => {
      mounted.current = false;
    };
  }, []);

  return { data, loading, error, isOffline, loadingMessage };
}