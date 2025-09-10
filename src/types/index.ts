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
  supplierId?: string;
  description?: string;
  status: 'normal' | 'low' | 'out';
  lastEntry?: string;
  batchNumber?: string;
  expiryDate?: string;
  location?: string;
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
  supplierId?: string;
  deliveryNote?: string;
  receivedDate?: string;
  batchNumber?: string;
  expiryDate?: string;
  qualityCheck?: 'pending' | 'passed' | 'failed';
  qualityNotes?: string;
  location?: string;
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
  startedAt?: string;
  startedBy?: string;
  completedAt?: string;
  completedBy?: string;
  validatedAt?: string;
  validatedBy?: string;
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
  validatedAt?: string;
  validatedBy?: string;
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

export interface Supplier {
  id: string;
  name: string;
  code: string;
  contact: {
    email?: string;
    phone?: string;
    address?: string;
  };
  categories: string[];
  status: 'active' | 'inactive';
  rating?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  lastOrder?: string;
}

export interface StockLocation {
  id: string;
  name: string;
  code: string;
  type: 'warehouse' | 'shelf' | 'room' | 'cabinet';
  description?: string;
  capacity?: number;
  status: 'active' | 'inactive';
  createdAt: string;
}