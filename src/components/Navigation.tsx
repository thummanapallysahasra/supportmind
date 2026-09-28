import React from 'react';
import { ViewTab } from '../types/index.js';
import {
  IconDashboard,
  IconUsers,
  IconChat,
  IconMemory,
  IconTicket,
  IconAnalytics,
  IconSettings,
  IconDatabase,
  IconClose,
} from './icons.js';

interface NavigationProps {
  currentTab: ViewTab;
  onSelectTab: (tab: ViewTab) => void;
  openTicketsCount: number;
  memoryConnected: boolean;
  activeNamespace?: string;
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

export function Navigation({
  currentTab,
  onSelectTab,
  openTicketsCount,
  memoryConnected,
  activeNamespace = 'customer_CUST_001',
  isOpen,
  onToggle,
  onClose,
}: NavigationProps) {
  const navItems: { id: ViewTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'dashboard', label: 'Home (Dashboard)', icon: <IconDashboard /> },
    { id: 'customers', label: 'Customers', icon: <IconUsers /> },
    { id: 'chat', label: 'Support Agent', icon: <IconChat /> },
    { id: 'memory', label: 'Memory Timeline', icon: <IconMemory /> },
    { id: 'tickets', label: 'Tickets', icon: <IconTicket />, badge: openTicketsCount },
    { id: 'analytics', label: 'Intelligence Analytics', icon: <IconAnalytics /> },
    { id: 'settings', label: 'Settings', icon: <IconSettings /> },
  ];

  return (
    <>
      {/* Backdrop overlay when menu is open */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 transition-opacity"
          aria-hidden="true"
        />
      )}

      {/* Drawer Menu (Only opens when user clicks three lines button) */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-72 bg-slate-900 text-slate-300 flex flex-col justify-between shrink-0 select-none border-r border-slate-800 z-50 transform transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Sidebar Menu"
      >
        {/* Brand & Toggle Header */}
        <div>
          <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-blue-600 text-white font-bold flex items-center justify-center text-xs tracking-wider">
                SM
              </div>
              <div>
                <div className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                  SupportMind
                  <span className="text-[10px] text-blue-400 font-mono font-medium">AI</span>
                </div>
                <div className="text-[11px] text-slate-400">TechKart Support</div>
              </div>
            </div>

            {/* Three lines / close button inside menu to close it */}
            <button
              onClick={onToggle}
              title="Close menu"
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors border border-slate-700/60"
              aria-label="Close navigation menu"
            >
              <IconClose className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Notice */}
          <div className="px-4 py-2 bg-slate-950/60 border-b border-slate-800/80 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Navigation Menu</span>
            <span className="text-[10px] font-mono text-blue-400">Hindsight v1.4</span>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navItems.map(item => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id);
                    onClose();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 text-xs font-medium transition-colors text-left ${
                    isActive
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isActive ? 'text-blue-400' : 'text-slate-400'}>{item.icon}</span>
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer System Status */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${memoryConnected ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              <span className="text-[11px] font-medium text-slate-200">
                Hindsight: {memoryConnected ? 'Connected' : 'Offline'}
              </span>
            </div>
          </div>
          <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1.5 truncate">
            <IconDatabase className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="truncate">{activeNamespace}</span>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-400">
            <span>Persistent Memory Layer</span>
            <span className="text-slate-400 font-mono">Demo Mode</span>
          </div>
        </div>
      </aside>
    </>
  );
}
