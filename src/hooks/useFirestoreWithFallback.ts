import { useState, useEffect, useRef } from 'react';
import { 
  collection, 
  query, 
  onSnapshot, 
  QueryConstraint,
  DocumentData 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Article, Movement, User, Inventory, InventoryItem, StockAlert, Supplier } from '../types';

// Fonction pour nettoyer et valider les données selon le type de collection
function sanitizeDocumentData<T>(collectionName: string, docData: any): T {
  const baseData = { ...docData };
  
  // Nettoyage spécifique par collection
  switch (collectionName) {
    case 'movements':
      return {
        ...baseData,
        service: baseData.service || 'Service non défini',
        articleCode: baseData.articleCode || 'CODE_INCONNU',
        articleName: baseData.articleName || 'Article Inconnu',
        userName: baseData.userName || 'Utilisateur Inconnu',
        unit: baseData.unit || 'unité',
        quantity: baseData.quantity || 0,
        date: baseData.date || new Date().toISOString().split('T')[0],
        time: baseData.time || new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        status: baseData.status || 'pending',
        type: baseData.type || 'entry',
        createdAt: baseData.createdAt || new Date().toISOString(),
        supplier: baseData.supplier || '',
        beneficiary: baseData.beneficiary || '',
        reason: baseData.reason || ''
      } as T;
      
    case 'articles':
      return {
        ...baseData,
        code: baseData.code || 'CODE_INCONNU',
        name: baseData.name || 'Article Inconnu',
        category: baseData.category || 'Catégorie Inconnue',
        unit: baseData.unit || 'unité',
        currentStock: baseData.currentStock || 0,
        minStock: baseData.minStock || 0,
        maxStock: baseData.maxStock || 100,
        status: baseData.status || 'normal',
        supplier: baseData.supplier || '',
        description: baseData.description || '',
        createdAt: baseData.createdAt || new Date().toISOString(),
        updatedAt: baseData.updatedAt || new Date().toISOString()
      } as T;
      
    case 'users':
      return {
        ...baseData,
        name: baseData.name || 'Utilisateur Inconnu',
        email: baseData.email || 'email@inconnu.mg',
        phone: baseData.phone || '',
        role: baseData.role || 'user',
        service: (baseData.service && baseData.service !== 'non défini' && baseData.service.trim() !== '') 
          ? baseData.service 
          : 'Service Inconnu',
        status: baseData.status || 'active',
        createdAt: baseData.createdAt || new Date().toISOString()
      } as T;
      
    case 'inventories':
      return {
        ...baseData,
        name: baseData.name || 'Inventaire Inconnu',
        category: baseData.category || 'Général',
        responsible: baseData.responsible || 'Responsable Inconnu',
        scheduledDate: baseData.scheduledDate || new Date().toISOString().split('T')[0],
        status: baseData.status || 'planned',
        articlesCount: baseData.articlesCount || 0,
        discrepancies: baseData.discrepancies || 0,
        includeCategories: baseData.includeCategories || [],
        createdAt: baseData.createdAt || new Date().toISOString()
      } as T;
      
    case 'inventory_items':
      return {
        ...baseData,
        inventoryId: baseData.inventoryId || '',
        articleId: baseData.articleId || '',
        articleCode: baseData.articleCode || 'CODE_INCONNU',
        articleName: baseData.articleName || 'Article Inconnu',
        theoreticalStock: baseData.theoreticalStock || 0,
        status: baseData.status || 'pending',
        location: baseData.location || ''
      } as T;
      
    case 'alerts':
      return {
        ...baseData,
        type: baseData.type || 'low_stock',
        articleId: baseData.articleId || '',
        articleCode: baseData.articleCode || 'CODE_INCONNU',
        articleName: baseData.articleName || 'Article Inconnu',
        priority: baseData.priority || 'medium',
        status: baseData.status || 'active',
        createdAt: baseData.createdAt || new Date().toISOString()
      } as T;
      
    case 'suppliers':
      return {
        ...baseData,
        name: baseData.name || 'Fournisseur Inconnu',
        code: baseData.code || 'FOUR_INCONNU',
        contact: baseData.contact || {},
        categories: baseData.categories || [],
        status: baseData.status || 'active',
        createdAt: baseData.createdAt || new Date().toISOString(),
        updatedAt: baseData.updatedAt || new Date().toISOString()
      } as T;
      
    default:
      // Pour les autres collections, retourner les données telles quelles
      return baseData as T;
  }
}
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
        
        // Nettoyer les données de fallback avant de les utiliser
        const cleanedFallbackData = (enhancedFallbackData || fallbackData).map(item => 
          sanitizeDocumentData<T>(collectionName, item)
        );
        setData(cleanedFallbackData);
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
          // 🚀 NETTOYAGE ET VALIDATION DES DONNÉES FIREBASE
          const documents = querySnapshot.docs.map(doc => {
            const rawData = { id: doc.id, ...doc.data() };
            // Nettoyer et valider les données selon le type de collection
            return sanitizeDocumentData<T>(collectionName, rawData);
          });
          
          
          console.log(`✅ Données Firebase nettoyées et chargées pour ${collectionName}: ${documents.length} éléments`);
          console.log(`🔍 Exemple de données nettoyées:`, documents[0]);
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
            // Nettoyer les données de fallback avant de les utiliser
            const cleanedFallbackData = (enhancedFallbackData || fallbackData).map(item => 
              sanitizeDocumentData<T>(collectionName, item)
            );
            setData(cleanedFallbackData);
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