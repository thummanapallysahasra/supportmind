import { MemoryItem, TimelineEvent, Customer, Ticket } from './types.js';
import { SEED_MEMORIES, SEED_TIMELINE, SEED_CUSTOMERS, SEED_TICKETS } from './seedData.js';

class HindsightMemoryService {
  private memories: Map<string, MemoryItem[]> = new Map();
  private timeline: Map<string, TimelineEvent[]> = new Map();
  private isConnected: boolean = true;
  private mode: 'Demo Mode' | 'Live Hindsight API' = 'Demo Mode';

  constructor() {
    this.init();
  }

  private init() {
    // Populate seed memories by customer namespace
    this.memories.clear();
    this.timeline.clear();

    for (const mem of SEED_MEMORIES) {
      const ns = mem.namespace;
      if (!this.memories.has(ns)) {
        this.memories.set(ns, []);
      }
      this.memories.get(ns)!.push({ ...mem });
    }

    for (const event of SEED_TIMELINE) {
      const custId = event.customerId;
      if (!this.timeline.has(custId)) {
        this.timeline.set(custId, []);
      }
      this.timeline.get(custId)!.push({ ...event });
    }
  }

  public getStatus() {
    let totalMemories = 0;
    for (const memList of this.memories.values()) {
      totalMemories += memList.length;
    }
    return {
      connected: this.isConnected,
      mode: this.mode,
      totalNamespaces: this.memories.size,
      totalMemories,
      latencyMs: 18,
      lastSync: new Date().toISOString(),
      provider: 'Hindsight Semantic Memory Layer',
    };
  }

  public getCustomerNamespace(customerId: string): string {
    return `customer_${customerId.replace(/[^a-zA-Z0-9]/g, '_')}`;
  }

  public getAllMemoriesForCustomer(customerId: string): MemoryItem[] {
    const ns = this.getCustomerNamespace(customerId);
    return this.memories.get(ns) || [];
  }

  public getTimelineForCustomer(customerId: string): TimelineEvent[] {
    return this.timeline.get(customerId) || [];
  }

  public retrieveRelevantMemories(customerId: string, query: string, limit: number = 3): MemoryItem[] {
    const ns = this.getCustomerNamespace(customerId);
    const customerMemories = this.memories.get(ns) || [];

    if (customerMemories.length === 0) {
      return [];
    }

    const queryNormalized = query.toLowerCase();
    const queryTokens = queryNormalized.split(/\W+/).filter(t => t.length > 2);

    // Compute semantic match score based on title, summary, solution, and tags
    const scored = customerMemories.map(mem => {
      let score = 0;
      const memText = `${mem.title} ${mem.summary} ${mem.solution} ${mem.tags.join(' ')}`.toLowerCase();

      // Keyword & synonym heuristics
      const paymentSynonyms = ['payment', 'pay', 'transaction', 'upi', 'card', 'checkout', 'money', 'charged', 'timeout', 'debit', 'credit'];
      const orderSynonyms = ['order', 'cancel', 'duplicate', 'buy', 'purchase', 'dispatch'];
      const deliverySynonyms = ['delivery', 'courier', 'late', 'delay', 'tracking', 'transit', 'address', 'gate'];
      const audioSynonyms = ['earbuds', 'sound', 'audio', 'volume', 'balance', 'disconnect', 'bluetooth', 'firmware'];
      const laptopSynonyms = ['laptop', 'fan', 'noise', 'render', 'gpu', 'driver', 'thermal', 'heating'];
      const dockSynonyms = ['hub', 'dock', 'hdmi', 'screen', 'monitor', 'display', 'port', 'return'];

    // Check query intent
    const isPaymentQuery = paymentSynonyms.some(w => queryNormalized.includes(w));
    const isOrderQuery = orderSynonyms.some(w => queryNormalized.includes(w));
    const isDeliveryQuery = deliverySynonyms.some(w => queryNormalized.includes(w));
    const isAudioQuery = audioSynonyms.some(w => queryNormalized.includes(w));
    const isLaptopQuery = laptopSynonyms.some(w => queryNormalized.includes(w));
    const isDockQuery = dockSynonyms.some(w => queryNormalized.includes(w));

    // General memory recall queries (e.g. "what do you remember?", "previous issues", "my history")
    const recallPhrases = ['history', 'remember', 'previous', 'earlier', 'past', 'last time', 'again', 'before', 'record', 'solution', 'happened'];
    const isGeneralRecall = recallPhrases.some(w => queryNormalized.includes(w));

    if (isPaymentQuery && mem.category === 'payment') score += 0.65;
    if (isOrderQuery && mem.category === 'order') score += 0.6;
    if (isDeliveryQuery && mem.category === 'delivery') score += 0.6;
    if (isAudioQuery && mem.category === 'technical' && memText.includes('audio')) score += 0.65;
    if (isLaptopQuery && mem.category === 'technical' && memText.includes('laptop')) score += 0.65;
    if (isDockQuery && mem.category === 'return') score += 0.65;
    if (isGeneralRecall) score += 0.45;

    // Token frequency matching
    for (const token of queryTokens) {
      if (mem.tags.some(t => t.includes(token) || token.includes(t))) score += 0.25;
      if (mem.title.toLowerCase().includes(token)) score += 0.2;
      if (mem.summary.toLowerCase().includes(token)) score += 0.15;
      if (mem.solution.toLowerCase().includes(token)) score += 0.15;
    }

    // Add base importance weight
    score = Math.min(0.99, score + (mem.importance * 0.15));

    return {
      ...mem,
      relevanceScore: Math.round(score * 100),
    };
  });

  // Filter to those with meaningful relevance (> 30%) or top items if recall requested
  let matched = scored
    .filter(item => (item.relevanceScore || 0) >= 35)
    .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0))
    .slice(0, limit);

  // If no high score but general inquiry and customer has memories, provide the most significant recent memory
  if (matched.length === 0 && customerMemories.length > 0) {
    const highest = [...customerMemories].sort((a, b) => b.importance - a.importance)[0];
    if (highest) {
      matched = [{ ...highest, relevanceScore: 40 }];
    }
  }

  // Increment recall count for recalled items
  matched.forEach(item => {
    item.recalledCount += 1;
  });

  return matched;
}

  public storeMemory(
    customerId: string,
    params: {
      category: 'payment' | 'order' | 'delivery' | 'return' | 'refund' | 'account' | 'technical' | 'preference';
      title: string;
      summary: string;
      solution: string;
      outcome: string;
      device?: string;
      tags: string[];
    }
  ): MemoryItem {
    const ns = this.getCustomerNamespace(customerId);
    if (!this.memories.has(ns)) {
      this.memories.set(ns, []);
    }

    const today = new Date();
    const dateDisplay = today.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    const isoDate = today.toISOString().split('T')[0];

    const newMemory: MemoryItem = {
      id: `MEM-${Date.now().toString().slice(-4)}`,
      customerId,
      namespace: ns,
      category: params.category,
      title: params.title,
      summary: params.summary,
      solution: params.solution,
      outcome: params.outcome,
      device: params.device || 'Mobile Device',
      timestamp: today.toISOString(),
      dateDisplay,
      tags: params.tags,
      importance: 0.9,
      recalledCount: 0,
      relevanceScore: 100,
    };

    this.memories.get(ns)!.unshift(newMemory);

    // Append to timeline
    if (!this.timeline.has(customerId)) {
      this.timeline.set(customerId, []);
    }
    const newTimelineEvent: TimelineEvent = {
      id: `TL-${Date.now().toString().slice(-4)}`,
      customerId,
      date: isoDate,
      issue: params.title,
      diagnosis: params.summary,
      suggestedAction: params.solution,
      outcome: params.outcome,
      memoryRefId: newMemory.id,
    };
    this.timeline.get(customerId)!.push(newTimelineEvent);

    return newMemory;
  }

  public reset() {
    this.init();
  }
}

export const hindsightService = new HindsightMemoryService();
