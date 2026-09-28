import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';
import { Customer, MemoryItem } from './types.js';

class AIService {
  private ai: GoogleGenAI | null = null;
  private currentModel = 'gemini-3.5-flash-lite';

  constructor() {
    this.initAI();
  }

  private initAI(): GoogleGenAI | null {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey && !this.ai) {
      this.ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    }
    return this.ai;
  }

  public getStatus() {
    const apiKey = process.env.GEMINI_API_KEY;
    return {
      provider: 'Google Gemini AI',
      model: this.currentModel,
      configured: Boolean(apiKey),
      status: Boolean(apiKey) ? 'Connected' : 'Fallback Engine Active',
    };
  }

  public async generateSupportResponse(params: {
    customer: Customer;
    userMessage: string;
    conversationHistory: { sender: 'customer' | 'agent' | 'system'; content: string }[];
    memoryEnabled: boolean;
    retrievedMemories: MemoryItem[];
  }): Promise<{
    reply: string;
    memoryUsedCount: number;
    memoryStoredProposal?: { category: any; title: string; summary: string; solution: string; outcome: string; tags: string[] };
  }> {
    const { customer, userMessage, conversationHistory, memoryEnabled, retrievedMemories } = params;

    const ordersSummary =
      customer.currentOrders && customer.currentOrders.length > 0
        ? customer.currentOrders
            .map(o => `Order #${o.id}: ${o.productName} (${o.category}, $${o.price}, Status: ${o.status}, Date: ${o.date})`)
            .join('\n')
        : 'No active orders';

    let systemInstruction = '';
    let prompt = '';

    if (memoryEnabled && retrievedMemories.length > 0) {
      const memoriesContext = retrievedMemories
        .map(
          (m, idx) =>
            `[Memory Item #${idx + 1}]
Date: ${m.dateDisplay}
Title: ${m.title}
Category: ${m.category.toUpperCase()}
Context & Summary: ${m.summary}
Previous Successful Solution: ${m.solution}
Outcome: ${m.outcome}
Device Used: ${m.device}
Relevance Match: ${m.relevanceScore}%`
        )
        .join('\n\n');

      systemInstruction = `You are SupportMind, an enterprise AI customer support memory agent for TechKart, a premier electronics e-commerce store in India.
Your core capability is HINDSIGHT PERSISTENT MEMORY. Unlike ordinary chatbots that forget previous interactions, you recall the customer's history, previous issues, and verified solutions to provide instant, contextual resolution.

CUSTOMER DOSSIER:
- Name: ${customer.name} (Customer ID: ${customer.id})
- Registered Device: ${customer.device}
- Contact: ${customer.email} | ${customer.phone}
- Preferences: ${customer.preferences.join('; ')}
- Total Lifetime Interactions: ${customer.totalInteractions}
- Customer Orders:
${ordersSummary}

RETRIEVED HINDSIGHT PERSISTENT MEMORIES:
${memoriesContext}

CORE BEHAVIOR GUIDELINES:
1. Address the customer directly and acknowledge their context immediately.
2. If the customer mentions an issue matching a past occurrence (such as payment failure, checkout issue, refund, delivery instruction, audio/device issue), you MUST explicitly reference the previous interaction from Hindsight memory (for example, mention their previous UPI gateway timeout on their iPhone 15 and how switching to card payment resolved it).
3. Offer the previous successful solution immediately to resolve their friction without making them repeat themselves.
4. Maintain full conversational continuity across multi-turn exchanges. If the customer asks follow-up questions, answer accurately using the dossier, conversation thread, and memories.
5. Professional, helpful, empathetic tone.
6. CRITICAL CONSTRAINTS:
   - Do NOT use emojis.
   - Do NOT use em dashes.
   - Do NOT invent past events that are not in the dossier or memories.`;

      const recentConvo = conversationHistory
        .slice(-6)
        .map(c => `${c.sender === 'customer' ? customer.name : 'SupportMind Agent'}: ${c.content}`)
        .join('\n');

      prompt = `${recentConvo ? `Conversation Thread:\n${recentConvo}\n\n` : ''}${customer.name}: "${userMessage}"\n\nGenerate personalized support response based on Hindsight memory:`;
    } else {
      // Memory Disabled or No relevant memory found
      systemInstruction = `You are a standard customer support chatbot for TechKart electronics store.
Hindsight memory is DISABLED or no prior memories exist. Treat this conversation as a brand new interaction. You have NO recollection of any past issues or solutions.

Customer Name: ${customer.name}
Device: ${customer.device}

INSTRUCTIONS:
1. Greet the customer politely.
2. Ask for details from scratch (Order ID, exact error message, payment method used, or device specifications).
3. Do NOT reference any past conversations or past solutions.
4. Do NOT use emojis. Do NOT use em dashes.
5. Provide standard troubleshooting inquiries.`;

      const recentConvo = conversationHistory
        .slice(-6)
        .map(c => `${c.sender === 'customer' ? customer.name : 'Support Chatbot'}: ${c.content}`)
        .join('\n');

      prompt = `${recentConvo ? `Conversation Thread:\n${recentConvo}\n\n` : ''}${customer.name}: "${userMessage}"\n\nGenerate standard support response:`;
    }

    // Call Gemini API with model fallback chain
    const client = this.initAI();
    if (client) {
      const candidateModels = ['gemini-3.5-flash-lite', 'gemini-3.8-flash', 'gemini-3.5-flash'];
      for (const modelName of candidateModels) {
        try {
          const response = await client.models.generateContent({
            model: modelName,
            contents: prompt,
            config: {
              systemInstruction,
              temperature: 0.35,
              maxOutputTokens: 450,
            },
          });

          const reply = response.text ? response.text.trim() : '';
          if (reply) {
            this.currentModel = modelName;
            return {
              reply,
              memoryUsedCount: memoryEnabled ? retrievedMemories.length : 0,
              memoryStoredProposal: this.detectMemoryStorageNeed(userMessage, reply, customer),
            };
          }
        } catch (err: any) {
          console.warn(`Gemini model ${modelName} call failed, trying next candidate:`, err.message || err);
        }
      }
    }

    // Deterministic High-Quality Fallback Engine (Hero Scenarios & Offline Resilience)
    const reply = this.getFallbackReply(customer, userMessage, memoryEnabled, retrievedMemories);
    return {
      reply,
      memoryUsedCount: memoryEnabled ? retrievedMemories.length : 0,
      memoryStoredProposal: this.detectMemoryStorageNeed(userMessage, reply, customer),
    };
  }

  private getFallbackReply(customer: Customer, userMessage: string, memoryEnabled: boolean, memories: MemoryItem[]): string {
    const msg = userMessage.toLowerCase();

    if (!memoryEnabled) {
      if (msg.includes('payment') || msg.includes('pay') || msg.includes('upi') || msg.includes('card') || msg.includes('failed')) {
        return `Hello ${customer.name}, I would be happy to assist with your payment issue. Could you please provide your Order ID, the exact payment method you are attempting to use, and any error message displayed on your screen? Once I have those details, we can initiate troubleshooting.`;
      }
      if (msg.includes('cancel') || msg.includes('order')) {
        return `Hello ${customer.name}. To assist with your order request, please provide your 8-digit Order Number and the email address associated with your TechKart purchase so I can look up the account.`;
      }
      if (msg.includes('earbud') || msg.includes('sound') || msg.includes('audio') || msg.includes('headphone')) {
        return `Thank you for reaching TechKart technical support. Please specify the model number of your audio device and whether you have tried rebooting the unit and clearing existing Bluetooth pairings.`;
      }
      return `Hello ${customer.name}, thank you for contacting TechKart Support. Could you please specify your order number or product details along with a description of the issue so I can assist you?`;
    }

    // Memory ON Fallback
    if (customer.id === 'CUST-001' && (msg.includes('payment') || msg.includes('pay') || msg.includes('again') || msg.includes('not working') || msg.includes('failed'))) {
      return `I remember you experienced a similar payment issue earlier, where the UPI transaction timed out during checkout on your iPhone 15. Switching to card payment resolved it last time. Are you currently trying UPI again? If so, I recommend switching directly to your card payment option for immediate authorization.`;
    }

    if (customer.id === 'CUST-002' && (msg.includes('invoice') || msg.includes('tax') || msg.includes('receipt') || msg.includes('bill'))) {
      return `Welcome back Sneha. I recall your preference for itemized PDF invoices with breakdown numbers. I have located your recent purchase of the TechKart UltraSound Headphones (ORD-87102) and can email the GST tax invoice directly to sneha.reddy@example.com.`;
    }

    if (customer.id === 'CUST-003' && (msg.includes('earbud') || msg.includes('audio') || msg.includes('desync') || msg.includes('connect'))) {
      return `Hello Arjun. In your previous support session, your SonicBuds Pro had a Bluetooth LE sync conflict between your Pixel 8 Pro and MacBook. The verified fix was performing a 10-second case reset and updating to firmware v2.1. Would you like me to guide you through that sequence?`;
    }

    if (customer.id === 'CUST-004' && (msg.includes('delivery') || msg.includes('gate') || msg.includes('time') || msg.includes('package'))) {
      return `Hi Priya. I see from our previous records that deliveries to your address require clearance with your building security desk between 09:00 and 12:00. Your current order of the PulseActive Smartwatch (ORD-91024) is in transit and I have attached these dispatch notes for the courier.`;
    }

    if (memories.length > 0) {
      const top = memories[0];
      return `I found a previous interaction regarding "${top.title}" from ${top.dateDisplay}. Last time, the solution was: ${top.solution}. Are you encountering the same symptom on your ${customer.device}?`;
    }

    return `Hello ${customer.name}. I am checking your TechKart account on ${customer.device}. I see no prior issues matching this specific request, so let us troubleshoot step by step. What symptom are you currently seeing?`;
  }

  private detectMemoryStorageNeed(
    userMessage: string,
    reply: string,
    customer: Customer
  ): { category: any; title: string; summary: string; solution: string; outcome: string; tags: string[] } | undefined {
    const text = (userMessage + ' ' + reply).toLowerCase();

    if (text.includes('payment') || text.includes('upi') || text.includes('checkout') || text.includes('card')) {
      return {
        category: 'payment',
        title: 'Recurring Payment Gateway Timeout',
        summary: `Customer encountered repeated payment blockage on ${customer.device}. Confirmed payment flow friction.`,
        solution: 'Advised switching to card gateway; suggested storing preferred card in checkout profile.',
        outcome: 'Payment pathway verified and guidance recorded.',
        tags: ['payment', 'upi', 'checkout', 'card-fallback'],
      };
    }

    if (text.includes('earbud') || text.includes('sound') || text.includes('sync') || text.includes('audio')) {
      return {
        category: 'technical',
        title: 'Audio Channel Bluetooth Re-synchronization',
        summary: `User experienced audio desync on ${customer.device}.`,
        solution: 'Guided through 10-second case hardware reset and reconnect cycle.',
        outcome: 'Audio synchronization restored.',
        tags: ['audio', 'earbuds', 'bluetooth', 'firmware'],
      };
    }

    if (text.includes('delivery') || text.includes('gate') || text.includes('slot') || text.includes('courier')) {
      return {
        category: 'delivery',
        title: 'Delivery Schedule Gate Clearance Instruction',
        summary: `Customer requested gated security protocol for morning delivery slot.`,
        solution: 'Updated dispatch instructions to security desk clearance.',
        outcome: 'Delivery instructions updated for carrier.',
        tags: ['delivery', 'morning-slot', 'security-desk'],
      };
    }

    return undefined;
  }
}

export const aiService = new AIService();
