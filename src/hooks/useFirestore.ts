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
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    setLoading(true);
    setError(null);
    setIsOffline(false);

    // Timeout pour éviter le chargement infini
    const timeoutId = setTimeout(() => {
      if (mounted.current) {
        console.warn(`Timeout lors du chargement de ${collectionName} - passage en mode dégradé`);
        setError('Connexion lente - données en cache affichées');
        setIsOffline(true);
        setLoading(false);
      }
    }, 10000); // 10 secondes timeout

    const q = query(collection(db, collectionName), ...queryConstraints);
    
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        clearTimeout(timeoutId);
        if (mounted.current) {
          const documents = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as T));
          
          setData(documents);
          setLoading(false);
          setError(null);
          setIsOffline(false);
        }
      },
      (err) => {
        clearTimeout(timeoutId);
        if (mounted.current) {
          console.error('Erreur Firestore:', err);
          
          // Gestion spécifique des erreurs de connexion
          if (err.code === 'unavailable') {
            setError('Mode hors ligne - données en cache affichées');
            setIsOffline(true);
          } else if (err.code === 'permission-denied') {
            setError('Permissions insuffisantes pour accéder aux données');
          } else {
            setError(`Erreur de connexion: ${err.message}`);
          }
          setLoading(false);
        }
      }
    );

    return () => {
      mounted.current = false;
      clearTimeout(timeoutId);
      unsubscribe();
    };
  }, [collectionName, queryConstraints]);

  useEffect(() => {
    return () => {
      mounted.current = false;
    };
  }, []);

  return { data, loading, error, isOffline };
}