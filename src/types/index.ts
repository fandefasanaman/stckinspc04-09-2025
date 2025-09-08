export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'manager' | 'supervisor' | 'user';
  service: string;
  status: 'active' | 'inactive';
  createdAt: string;
  lastLogin?: string;
}

export interface Article {
  id: string;
  code: string;
  name: string;
  category: string;
  unit: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  unitPrice?: number;
  supplier?: string;
  description?: string;
  status: 'normal' | 'low' | 'out';
  lastEntry?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Movement {
  id: string;
  type: 'entry' | 'exit';
  articleId: string;
  articleCode: string;
  articleName: string;
  quantity: number;
  unit: string;
  userId: string;
  userName: string;
  service: string;
  reference?: string;
  supplier?: string;
  beneficiary?: string;
  reason?: string;
  notes?: string;
  status: 'pending' | 'validated' | 'rejected';
  date: string;
  time: string;
  createdAt: string;
  validatedBy?: string;
  validatedAt?: string;
}

export interface Inventory {
  id: string;
  name: string;
  category: string;
  responsible: string;
  scheduledDate: string;
  status: 'planned' | 'in_progress' | 'completed' | 'validated';
  articlesCount: number;
  discrepancies: number;
  description?: string;
  includeCategories: string[];
  createdAt: string;
  completedAt?: string;
  validatedAt?: string;
}

export interface InventoryItem {
  id: string;
  inventoryId: string;
  articleId: string;
  articleCode: string;
  articleName: string;
  theoreticalStock: number;
  physicalStock?: number;
  difference?: number;
  status: 'pending' | 'counted' | 'validated';
  location?: string;
  notes?: string;
  countedBy?: string;
  countedAt?: string;
}

export interface StockAlert {
  id: string;
  type: 'low_stock' | 'out_of_stock' | 'expiring';
  articleId: string;
  articleCode: string;
  articleName: string;
  currentStock?: number;
  minStock?: number;
  expiryDate?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'resolved';
  createdAt: string;
  resolvedAt?: string;
}