/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Customer, MemoryItem, TimelineEvent, Ticket, AnalyticsData, ViewTab } from './types/index.js';
import { Navigation } from './components/Navigation.js';
import { DashboardView } from './components/DashboardView.js';
import { CustomersView } from './components/CustomersView.js';
import { SupportAgentView } from './components/SupportAgentView.js';
import { MemoryView } from './components/MemoryView.js';
import { TicketsView } from './components/TicketsView.js';
import { AnalyticsView } from './components/AnalyticsView.js';
import { SettingsView } from './components/SettingsView.js';
import { IconMenu, IconClose } from './components/icons.js';

export default function App() {
  const [currentTab, setCurrentTab] = useState<ViewTab>('dashboard');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('CUST-001');
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalCustomers: 1248,
    totalConversations: 4930,
    memoriesStored: 7412,
    problemsResolved: 4520,
    repeatedIssuesDetected: 894,
    avgResolutionTimeMinutes: 3.2,
    memoryUtilizationRate: 78.4,
    issuesByCategory: [
      { category: 'Payment', count: 1480, percentage: 32 },
      { category: 'Delivery', count: 1120, percentage: 25 },
      { category: 'Product & Tech', count: 910, percentage: 20 },
      { category: 'Return & Refund', count: 680, percentage: 15 },
      { category: 'Account & Billing', count: 360, percentage: 8 },
    ],
    resolutionTrend: [
      { month: 'Apr', genericAvgMin: 14.5, memoryAvgMin: 7.8 },
      { month: 'May', genericAvgMin: 14.2, memoryAvgMin: 6.4 },
      { month: 'Jun', genericAvgMin: 13.9, memoryAvgMin: 5.1 },
      { month: 'Jul', genericAvgMin: 14.1, memoryAvgMin: 4.3 },
      { month: 'Aug', genericAvgMin: 13.8, memoryAvgMin: 3.6 },
      { month: 'Sep', genericAvgMin: 13.7, memoryAvgMin: 3.2 },
    ],
  });

  const [memoryEnabled, setMemoryEnabled] = useState<boolean>(true);
  const [initialMessageForChat, setInitialMessageForChat] = useState<string | undefined>(undefined);
  const [hindsightConnected, setHindsightConnected] = useState<boolean>(true);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Initial Data Fetch
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setIsLoading(true);
      const [custRes, ticketsRes, analyticsRes, statusRes] = await Promise.all([
        fetch('/api/customers').then(r => r.json()),
        fetch('/api/tickets').then(r => r.json()),
        fetch('/api/analytics').then(r => r.json()),
        fetch('/api/hindsight/status').then(r => r.json()),
      ]);

      if (custRes.customers) setCustomers(custRes.customers);
      if (ticketsRes.tickets) setTickets(ticketsRes.tickets);
      if (analyticsRes.analytics) setAnalytics(analyticsRes.analytics);
      if (statusRes.status) setHindsightConnected(statusRes.status.connected);

      // Load initial customer details (Rahul Sharma)
      const targetId = selectedCustomerId || 'CUST-001';
      const detailRes = await fetch(`/api/customers/${targetId}`).then(r => r.json());
      if (detailRes.memories) setMemories(detailRes.memories);
      if (detailRes.timeline) setTimeline(detailRes.timeline);
    } catch (err) {
      console.error('Failed to load application data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCustomerDetails = async (customerId: string) => {
    setSelectedCustomerId(customerId);
    try {
      const res = await fetch(`/api/customers/${customerId}`);
      const data = await res.json();
      if (data.memories) setMemories(data.memories);
      if (data.timeline) setTimeline(data.timeline);
    } catch (err) {
      console.error('Error loading customer details:', err);
    }
  };

  // Launch the 60-second hackathon hero scenario
  const handleLaunchHeroDemo = () => {
    setSelectedCustomerId('CUST-001');
    setMemoryEnabled(true);
    setInitialMessageForChat("My payment isn't working again.");
    setCurrentTab('chat');
  };

  const handleStartSupport = (customer: Customer) => {
    setSelectedCustomerId(customer.id);
    setCurrentTab('chat');
  };

  const handleCreateTicket = async (ticketData: Omit<Ticket, 'id' | 'createdAt'>) => {
    try {
      const res = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticketData),
      });
      const data = await res.json();
      if (data.ticket) {
        setTickets(prev => [data.ticket, ...prev]);
        setCustomers(prev =>
          prev.map(c => (c.id === ticketData.customerId ? { ...c, openTickets: c.openTickets + 1 } : c))
        );
      }
    } catch (err) {
      console.error('Failed to create ticket:', err);
    }
  };

  const handleUpdateTicketStatus = async (ticketId: string, status: 'Unresolved' | 'Resolved' | 'Escalated') => {
    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.ticket) {
        setTickets(prev => prev.map(t => (t.id === ticketId ? data.ticket : t)));
      }
    } catch (err) {
      console.error('Failed to update ticket status:', err);
    }
  };

  const handleAddMemory = async (customerId: string, memoryData: any) => {
    try {
      const res = await fetch(`/api/customers/${customerId}/memories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(memoryData),
      });
      const data = await res.json();
      if (data.memory) {
        setMemories(prev => [data.memory, ...prev]);
        // Also reload timeline
        const tlRes = await fetch(`/api/customers/${customerId}/timeline`).then(r => r.json());
        if (tlRes.timeline) setTimeline(tlRes.timeline);
      }
    } catch (err) {
      console.error('Failed to add memory:', err);
    }
  };

  const handleResetDemoData = async () => {
    const res = await fetch('/api/demo/reset', { method: 'POST' });
    if (res.ok) {
      await loadAllData();
    }
  };

  const selectedCustomer =
    customers.find(c => c.id === selectedCustomerId) ||
    customers[0] || {
      id: 'CUST-001',
      name: 'Rahul Sharma',
      email: 'rahul.sharma@example.com',
      phone: '+91 98201 44812',
      device: 'iPhone 15',
      avatarColor: '#1e3a8a',
      preferences: ['Prefers email updates'],
      totalInteractions: 14,
      lastInteraction: '18 Aug 2026',
      openTickets: 1,
      status: 'active' as const,
      currentOrders: [],
    };

  const openTicketsCount = tickets.filter(t => t.currentStatus === 'Unresolved').length;

  const getTabLabel = (tab: ViewTab) => {
    switch (tab) {
      case 'dashboard':
        return 'Home';
      case 'customers':
        return 'Customers';
      case 'chat':
        return 'Support Agent';
      case 'memory':
        return 'Memory Timeline';
      case 'tickets':
        return 'Tickets';
      case 'analytics':
        return 'Analytics';
      case 'settings':
        return 'Settings';
      default:
        return 'Home';
    }
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-slate-100 text-slate-900 select-none">
      {/* Top Application Header with Three Lines Hamburger Button */}
      <header className="h-13 bg-white border-b border-slate-200 px-4 flex items-center justify-between shrink-0 z-30">
        <div className="flex items-center gap-3">
          {/* Three Small Lines Button to toggle the menu open and close */}
          <button
            onClick={() => setIsMenuOpen(prev => !prev)}
            className="p-1.5 border border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors flex items-center justify-center gap-1.5 focus:outline-hidden"
            title="Toggle Menu (Three lines)"
            aria-label="Toggle navigation menu"
          >
            {isMenuOpen ? (
              <IconClose className="w-4 h-4 text-slate-800" />
            ) : (
              <IconMenu className="w-4 h-4 text-slate-800" />
            )}
            <span className="text-xs font-semibold text-slate-800 hidden sm:inline">Menu</span>
          </button>

          {/* Brand & Home click target */}
          <button
            onClick={() => {
              setCurrentTab('dashboard');
              setIsMenuOpen(false);
            }}
            className="flex items-center gap-2 hover:opacity-90 transition-opacity text-left"
            title="Return to Home page"
          >
            <div className="w-6 h-6 bg-blue-600 text-white font-bold flex items-center justify-center text-[10px] tracking-wider">
              SM
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 tracking-tight">SupportMind</span>
              <span className="hidden sm:inline-block ml-1.5 text-[9px] font-mono px-1 py-0.5 bg-blue-50 text-blue-700 border border-blue-200">
                TechKart
              </span>
            </div>
          </button>

          {/* Current Page breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 pl-3 border-l border-slate-200">
            <span className="hidden md:inline">Viewing:</span>
            <span className="font-semibold text-slate-900">{getTabLabel(currentTab)}</span>
          </div>
        </div>

        {/* Right header actions */}
        <div className="flex items-center gap-2">
          {/* Direct Home button */}
          {currentTab !== 'dashboard' && (
            <button
              onClick={() => {
                setCurrentTab('dashboard');
                setIsMenuOpen(false);
              }}
              className="text-xs font-medium px-2.5 py-1 text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-300 transition-colors"
            >
              Home
            </button>
          )}

          {/* Hero Demo trigger button */}
          <button
            onClick={handleLaunchHeroDemo}
            className="text-xs font-semibold px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100 transition-colors hidden sm:flex items-center gap-1"
            title="Launch 60-second hero demo with Rahul Sharma"
          >
            <span>Hero Demo</span>
          </button>

          {/* Current Customer Chip */}
          <button
            onClick={() => {
              setCurrentTab('customers');
              setIsMenuOpen(false);
            }}
            className="text-xs text-slate-700 bg-slate-50 border border-slate-200 hover:bg-slate-100 px-2 py-1 transition-colors flex items-center gap-1.5"
            title="Active Customer"
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: selectedCustomer.avatarColor }} />
            <span className="font-medium max-w-[110px] truncate">{selectedCustomer.name}</span>
          </button>

          {/* Hindsight Status */}
          <div className="flex items-center gap-1.5 text-xs text-slate-700 bg-slate-50 border border-slate-200 px-2 py-1">
            <span className={`w-2 h-2 rounded-full ${hindsightConnected ? 'bg-emerald-500' : 'bg-rose-500'}`} />
            <span className="text-[11px] font-mono hidden lg:inline">
              {hindsightConnected ? 'Memory Active' : 'Offline'}
            </span>
          </div>
        </div>
      </header>

      {/* Drawer Navigation Menu (toggled by the three small lines button) */}
      <Navigation
        currentTab={currentTab}
        onSelectTab={tab => {
          setCurrentTab(tab);
          setIsMenuOpen(false);
        }}
        openTicketsCount={openTicketsCount}
        memoryConnected={hindsightConnected}
        activeNamespace={`customer_${selectedCustomer.id.replace('-', '_')}`}
        isOpen={isMenuOpen}
        onToggle={() => setIsMenuOpen(prev => !prev)}
        onClose={() => setIsMenuOpen(false)}
      />

      {/* Main View Area - Displays Home Page first */}
      <main className="flex-1 h-[calc(100vh-3.25rem)] overflow-y-auto bg-[#f4f6f8]">
        {currentTab === 'dashboard' && (
          <DashboardView
            onNavigate={setCurrentTab}
            onLaunchHeroDemo={handleLaunchHeroDemo}
            customers={customers}
            memories={memories}
            analytics={analytics}
          />
        )}

        {currentTab === 'customers' && (
          <CustomersView
            customers={customers}
            selectedCustomerId={selectedCustomerId}
            onSelectCustomer={loadCustomerDetails}
            onStartSupport={handleStartSupport}
            memories={memories}
            tickets={tickets}
          />
        )}

        {currentTab === 'chat' && (
          <SupportAgentView
            customers={customers}
            selectedCustomer={selectedCustomer}
            onSelectCustomer={cust => loadCustomerDetails(cust.id)}
            memoryEnabled={memoryEnabled}
            onToggleMemory={() => setMemoryEnabled(!memoryEnabled)}
            onCreateTicket={handleCreateTicket}
            initialMessageToSend={initialMessageForChat}
            onClearInitialMessage={() => setInitialMessageForChat(undefined)}
          />
        )}

        {currentTab === 'memory' && (
          <MemoryView
            customers={customers}
            selectedCustomerId={selectedCustomerId}
            onSelectCustomer={loadCustomerDetails}
            memories={memories}
            timeline={timeline}
            onAddMemory={handleAddMemory}
          />
        )}

        {currentTab === 'tickets' && (
          <TicketsView
            tickets={tickets}
            onUpdateTicketStatus={handleUpdateTicketStatus}
            onOpenSupportForCustomer={id => {
              loadCustomerDetails(id);
              setCurrentTab('chat');
            }}
          />
        )}

        {currentTab === 'analytics' && <AnalyticsView analytics={analytics} />}

        {currentTab === 'settings' && (
          <SettingsView
            onResetDemoData={handleResetDemoData}
            onSelectSampleCustomer={cust => {
              loadCustomerDetails(cust.id);
              setCurrentTab('chat');
            }}
            customers={customers}
            memoryEnabled={memoryEnabled}
            onToggleMemory={() => setMemoryEnabled(!memoryEnabled)}
          />
        )}
      </main>
    </div>
  );
}
