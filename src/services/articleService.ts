import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  Timestamp 
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Article } from '../types';

export class ArticleService {
  private static collectionName = 'articles';

  // Obtenir tous les articles
  static async getArticles(): Promise<Article[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        orderBy('name', 'asc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Article));
    } catch (error) {
      console.error('Erreur lors de la récupération des articles:', error);
      throw new Error('Impossible de récupérer les articles');
    }
  }

  // Obtenir un article par ID
  static async getArticleById(id: string): Promise<Article | null> {
    try {
      const docRef = doc(db, this.collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        } as Article;
      }
      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'article:', error);
      throw new Error('Impossible de récupérer l\'article');
    }
  }

  // Obtenir un article par code
  static async getArticleByCode(code: string): Promise<Article | null> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('code', '==', code)
      );
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        return {
          id: doc.id,
          ...doc.data()
        } as Article;
      }
      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'article par code:', error);
      throw new Error('Impossible de récupérer l\'article');
    }
  }

  // Créer un nouvel article
  static async createArticle(articleData: Omit<Article, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      // Vérifier si le code existe déjà
      const existingArticle = await this.getArticleByCode(articleData.code);
      if (existingArticle) {
        throw new Error('Un article avec ce code existe déjà');
      }

      const now = new Date().toISOString();
      const newArticle = {
        ...articleData,
        currentStock: 0,
        status: 'normal' as const,
        createdAt: now,
        updatedAt: now
      };

      const docRef = await addDoc(collection(db, this.collectionName), newArticle);
      return docRef.id;
    } catch (error: any) {
      console.error('Erreur lors de la création de l\'article:', error);
      throw new Error(error.message || 'Impossible de créer l\'article');
    }
  }

  // Mettre à jour un article
  static async updateArticle(id: string, updates: Partial<Article>): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'article:', error);
      throw new Error('Impossible de mettre à jour l\'article');
    }
  }

  // Mettre à jour le stock d'un article
  static async updateStock(id: string, newStock: number): Promise<void> {
    try {
      const article = await this.getArticleById(id);
      if (!article) {
        throw new Error('Article non trouvé');
      }

      let status: 'normal' | 'low' | 'out' = 'normal';
      if (newStock === 0) {
        status = 'out';
      } else if (newStock <= article.minStock) {
        status = 'low';
      }

      await this.updateArticle(id, {
        currentStock: newStock,
        status,
        lastEntry: new Date().toISOString()
      });
    } catch (error: any) {
      console.error('Erreur lors de la mise à jour du stock:', error);
      throw new Error(error.message || 'Impossible de mettre à jour le stock');
    }
  }

  // Supprimer un article
  static async deleteArticle(id: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'article:', error);
      throw new Error('Impossible de supprimer l\'article');
    }
  }

  // Obtenir les articles avec stock faible
  static async getLowStockArticles(): Promise<Article[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('status', 'in', ['low', 'out']),
        orderBy('currentStock', 'asc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Article));
    } catch (error) {
      console.error('Erreur lors de la récupération des articles en stock faible:', error);
      throw new Error('Impossible de récupérer les articles en stock faible');
    }
  }

  // Obtenir les articles par catégorie
  static async getArticlesByCategory(category: string): Promise<Article[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('category', '==', category),
        orderBy('name', 'asc')
      );
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Article));
    } catch (error) {
      console.error('Erreur lors de la récupération des articles par catégorie:', error);
      throw new Error('Impossible de récupérer les articles par catégorie');
    }
  }

  // Écouter les changements en temps réel
  static onArticlesChange(callback: (articles: Article[]) => void) {
    const q = query(
      collection(db, this.collectionName),
      orderBy('name', 'asc')
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const articles = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Article));
      callback(articles);
    });
  }
}