export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  device: string;
  avatarColor: string;
  preferences: string[];
  totalInteractions: number;
  lastInteraction: string;
  openTickets: number;
  status: 'active' | 'pending' | 'resolved';
  currentOrders: Order[];
}

export interface Order {
  id: string;
  productName: string;
  category: string;
  price: number;
  date: string;
  status: 'Delivered' | 'In Transit' | 'Processing' | 'Cancelled';
}

export interface MemoryItem {
  id: string;
  customerId: string;
  namespace: string;
  category: 'payment' | 'order' | 'delivery' | 'return' | 'refund' | 'account' | 'technical' | 'preference';
  title: string;
  summary: string;
  solution: string;
  outcome: string;
  device?: string;
  timestamp: string;
  dateDisplay: string;
  tags: string[];
  importance: number;
  relevanceScore?: number;
  recalledCount: number;
}

export interface TimelineEvent {
  id: string;
  customerId: string;
  date: string;
  issue: string;
  diagnosis: string;
  suggestedAction: string;
  outcome: string;
  memoryRefId?: string;
}

export interface Ticket {
  id: string;
  customerId: string;
  customerName: string;
  issue: string;
  category: string;
  previousOccurrences: number;
  knownPattern: string;
  previousSuccessfulSolution: string;
  currentStatus: 'Unresolved' | 'Resolved' | 'Escalated';
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  createdAt: string;
  device: string;
}

export interface ChatMessage {
  id: string;
  sender: 'customer' | 'agent' | 'system';
  content: string;
  timestamp: string;
  memoryUsed?: MemoryItem[];
  memoryStored?: {
    id: string;
    title: string;
    summary: string;
  };
}

export interface AnalyticsData {
  totalCustomers: number;
  totalConversations: number;
  memoriesStored: number;
  problemsResolved: number;
  repeatedIssuesDetected: number;
  avgResolutionTimeMinutes: number;
  memoryUtilizationRate: number;
  issuesByCategory: { category: string; count: number; percentage: number }[];
  resolutionTrend: { month: string; genericAvgMin: number; memoryAvgMin: number }[];
}

export type ViewTab = 'dashboard' | 'customers' | 'chat' | 'memory' | 'tickets' | 'analytics' | 'settings';
