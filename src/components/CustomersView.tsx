import React, { useState } from 'react';
import { Customer, MemoryItem, Ticket, ViewTab } from '../types/index.js';
import { IconSearch, IconChat, IconMemory, IconTicket } from './icons.js';

interface CustomersViewProps {
  customers: Customer[];
  selectedCustomerId: string;
  onSelectCustomer: (id: string) => void;
  onStartSupport: (customer: Customer) => void;
  memories: MemoryItem[];
  tickets: Ticket[];
}

export function CustomersView({
  customers,
  selectedCustomerId,
  onSelectCustomer,
  onStartSupport,
  memories,
  tickets,
}: CustomersViewProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCustomers = customers.filter(
    c =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.device.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeCustomer =
    customers.find(c => c.id === selectedCustomerId) || customers[0];

  const customerMemories = memories.filter(
    m => m.customerId === activeCustomer?.id
  );
  const customerTickets = tickets.filter(
    t => t.customerId === activeCustomer?.id
  );

  return (
    <div className="flex h-full bg-slate-50">
      {/* Customers List Sidebar */}
      <div className="w-80 border-r border-slate-200 bg-white flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-200">
          <div className="text-xs font-mono uppercase tracking-wider text-slate-500 mb-1">
            Directory
          </div>
          <h2 className="text-base font-bold text-slate-900 mb-3">Customers</h2>
          <div className="relative">
            <IconSearch className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search name, ID, device..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 focus:outline-none focus:border-blue-600 bg-white"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {filteredCustomers.map(cust => {
            const isSelected = cust.id === activeCustomer?.id;
            return (
              <button
                key={cust.id}
                onClick={() => onSelectCustomer(cust.id)}
                className={`w-full text-left p-3.5 transition-colors flex items-start gap-3 ${
                  isSelected ? 'bg-blue-50/70 border-l-2 border-blue-600' : 'hover:bg-slate-50'
                }`}
              >
                <div
                  className="w-8 h-8 text-white font-bold flex items-center justify-center text-xs shrink-0"
                  style={{ backgroundColor: cust.avatarColor }}
                >
                  {cust.name
                    .split(' ')
                    .map(n => n[0])
                    .join('')}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {cust.name}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {cust.id}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 truncate mt-0.5">
                    {cust.device}
                  </div>
                  <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-500 font-mono">
                    <span>Last: {cust.lastInteraction}</span>
                    {cust.openTickets > 0 && (
                      <span className="text-amber-800 bg-amber-50 px-1.5 py-0.2 border border-amber-200">
                        {cust.openTickets} open
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Customer Profile & Memory Details */}
      {activeCustomer && (
        <div className="flex-1 overflow-y-auto p-8 space-y-6">
          {/* Header Card */}
          <div className="bg-white border border-slate-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div
                className="w-12 h-12 text-white font-bold text-base flex items-center justify-center shrink-0"
                style={{ backgroundColor: activeCustomer.avatarColor }}
              >
                {activeCustomer.name
                  .split(' ')
                  .map(n => n[0])
                  .join('')}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-slate-900">
                    {activeCustomer.name}
                  </h1>
                  <span className="text-xs font-mono bg-slate-100 text-slate-700 px-2 py-0.5 border border-slate-200">
                    {activeCustomer.id}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                  <span>{activeCustomer.email}</span>
                  <span>·</span>
                  <span>{activeCustomer.phone}</span>
                  <span>·</span>
                  <span className="font-medium text-slate-700">
                    {activeCustomer.device}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onStartSupport(activeCustomer)}
              className="px-4 py-2 bg-blue-700 text-white text-xs font-bold hover:bg-blue-800 transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <IconChat className="w-4 h-4" />
              <span>Start Support Session</span>
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 p-4">
              <div className="text-[11px] text-slate-500 uppercase tracking-wide">
                Total Interactions
              </div>
              <div className="text-xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
                {activeCustomer.totalInteractions}
              </div>
            </div>
            <div className="bg-white border border-slate-200 p-4">
              <div className="text-[11px] text-slate-500 uppercase tracking-wide">
                Hindsight Memories
              </div>
              <div className="text-xl font-bold font-mono text-blue-700 mt-1 tabular-nums">
                {customerMemories.length}
              </div>
            </div>
            <div className="bg-white border border-slate-200 p-4">
              <div className="text-[11px] text-slate-500 uppercase tracking-wide">
                Open Tickets
              </div>
              <div className="text-xl font-bold font-mono text-amber-700 mt-1 tabular-nums">
                {activeCustomer.openTickets}
              </div>
            </div>
            <div className="bg-white border border-slate-200 p-4">
              <div className="text-[11px] text-slate-500 uppercase tracking-wide">
                Last Contact
              </div>
              <div className="text-sm font-semibold text-slate-800 mt-1.5">
                {activeCustomer.lastInteraction}
              </div>
            </div>
          </div>

          {/* Customer Preferences & Orders */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Preferences */}
            <div className="bg-white border border-slate-200 p-5 space-y-3">
              <div className="text-xs font-mono uppercase text-slate-500">
                Customer Preferences
              </div>
              <ul className="space-y-2 text-xs">
                {activeCustomer.preferences.map((pref, idx) => (
                  <li
                    key={idx}
                    className="p-2.5 bg-slate-50 border border-slate-200 text-slate-700 flex items-center justify-between"
                  >
                    <span>{pref}</span>
                    <span className="text-[10px] font-mono text-slate-400">
                      Persistent
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Current & Past Orders */}
            <div className="bg-white border border-slate-200 p-5 space-y-3">
              <div className="text-xs font-mono uppercase text-slate-500">
                Hardware & Order History
              </div>
              <div className="space-y-2 text-xs">
                {activeCustomer.currentOrders.map(ord => (
                  <div
                    key={ord.id}
                    className="p-3 bg-slate-50 border border-slate-200 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">
                        {ord.productName}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        {ord.id} · {ord.category} · {ord.date}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-slate-900 tabular-nums">
                        ${ord.price}
                      </div>
                      <div
                        className={`text-[10px] font-mono font-medium ${
                          ord.status === 'Delivered'
                            ? 'text-emerald-700'
                            : ord.status === 'In Transit'
                            ? 'text-blue-700'
                            : 'text-amber-700'
                        }`}
                      >
                        {ord.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Stored Hindsight Memories for this Customer */}
          <div className="bg-white border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <div className="text-xs font-mono uppercase text-slate-500">
                  Hindsight Persistent Storage
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  Customer Memory Bank (Namespace: customer_{activeCustomer.id.replace('-', '_')})
                </h3>
              </div>
              <span className="text-xs font-mono text-blue-700 bg-blue-50 px-2 py-0.5 border border-blue-200">
                {customerMemories.length} Memories Indexed
              </span>
            </div>

            <div className="space-y-3">
              {customerMemories.map(mem => (
                <div
                  key={mem.id}
                  className="p-4 border border-slate-200 bg-slate-50/60 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">
                        {mem.title}
                      </span>
                      <span className="text-[10px] font-mono uppercase text-slate-500 bg-white px-1.5 py-0.2 border border-slate-200">
                        {mem.category}
                      </span>
                    </div>
                    <span className="font-mono text-slate-500 text-[11px]">
                      {mem.dateDisplay}
                    </span>
                  </div>

                  <p className="text-slate-600">{mem.summary}</p>

                  <div className="p-2 bg-white border border-slate-200 text-slate-700">
                    <span className="font-semibold text-slate-900">
                      Previous Solution:{' '}
                    </span>
                    <span>{mem.solution}</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 font-mono">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span>Tags:</span>
                      {mem.tags.map(tag => (
                        <span key={tag} className="text-slate-600 bg-slate-200/60 px-1">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <span>Recalled: {mem.recalledCount} times</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
