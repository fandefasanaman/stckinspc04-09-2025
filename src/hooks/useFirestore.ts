import { useState, useEffect } from 'react';
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

  useEffect(() => {
    setLoading(true);
    setError(null);

    const q = query(collection(db, collectionName), ...queryConstraints);
    
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const documents = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as T));
        
        setData(documents);
        setLoading(false);
      },
      (err) => {
        console.error('Erreur Firestore:', err);
        setError(err.message);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [collectionName, queryConstraints]);

  return { data, loading, error };
}