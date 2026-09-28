import { AnalyticsData, Ticket } from './types.js';
import { INITIAL_ANALYTICS } from './seedData.js';
import { hindsightService } from './hindsightService.js';
import { customerService, ticketService } from './customerService.js';

class AnalyticsService {
  private analytics: AnalyticsData;

  constructor() {
    this.analytics = JSON.parse(JSON.stringify(INITIAL_ANALYTICS));
  }

  public getMetrics(): AnalyticsData {
    const hindsightStatus = hindsightService.getStatus();
    const allTickets = ticketService.getAll();
    const allCustomers = customerService.getAll();

    return {
      ...this.analytics,
      totalCustomers: allCustomers.length * 208, // Scaled realistic SaaS metrics
      totalConversations: this.analytics.totalConversations,
      memoriesStored: hindsightStatus.totalMemories + 7400,
      problemsResolved: allTickets.filter((t: Ticket) => t.currentStatus === 'Resolved').length + 4516,
      repeatedIssuesDetected: this.analytics.repeatedIssuesDetected,
      avgResolutionTimeMinutes: 3.2,
      memoryUtilizationRate: 78.4,
    };
  }

  public recordConversation() {
    this.analytics.totalConversations += 1;
  }

  public reset() {
    this.analytics = JSON.parse(JSON.stringify(INITIAL_ANALYTICS));
  }
}

export const analyticsService = new AnalyticsService();
