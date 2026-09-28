import { Customer, Ticket } from './types.js';
import { SEED_CUSTOMERS, SEED_TICKETS } from './seedData.js';

class CustomerService {
  private customers: Map<string, Customer> = new Map();

  constructor() {
    this.reset();
  }

  public reset() {
    this.customers.clear();
    for (const c of SEED_CUSTOMERS) {
      this.customers.set(c.id, JSON.parse(JSON.stringify(c)));
    }
  }

  public getAll(): Customer[] {
    return Array.from(this.customers.values());
  }

  public getById(id: string): Customer | undefined {
    return this.customers.get(id);
  }

  public incrementInteractions(id: string) {
    const cust = this.customers.get(id);
    if (cust) {
      cust.totalInteractions += 1;
      cust.lastInteraction = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    }
  }

  public incrementOpenTickets(id: string) {
    const cust = this.customers.get(id);
    if (cust) {
      cust.openTickets += 1;
      cust.status = 'active';
    }
  }

  public decrementOpenTickets(id: string) {
    const cust = this.customers.get(id);
    if (cust && cust.openTickets > 0) {
      cust.openTickets -= 1;
      if (cust.openTickets === 0) {
        cust.status = 'resolved';
      }
    }
  }
}

class TicketService {
  private tickets: Ticket[] = [];

  constructor() {
    this.reset();
  }

  public reset() {
    this.tickets = JSON.parse(JSON.stringify(SEED_TICKETS));
  }

  public getAll(): Ticket[] {
    return this.tickets;
  }

  public getByCustomer(customerId: string): Ticket[] {
    return this.tickets.filter(t => t.customerId === customerId);
  }

  public create(ticketData: Omit<Ticket, 'id' | 'createdAt'>): Ticket {
    const nextNum = 1043 + this.tickets.length;
    const newTicket: Ticket = {
      ...ticketData,
      id: `TK-${nextNum}`,
      createdAt: new Date().toISOString(),
    };
    this.tickets.unshift(newTicket);
    return newTicket;
  }

  public updateStatus(ticketId: string, status: 'Unresolved' | 'Resolved' | 'Escalated'): Ticket | null {
    const ticket = this.tickets.find(t => t.id === ticketId);
    if (ticket) {
      ticket.currentStatus = status;
      return ticket;
    }
    return null;
  }
}

export const customerService = new CustomerService();
export const ticketService = new TicketService();
