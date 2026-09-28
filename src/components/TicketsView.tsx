import React, { useState } from 'react';
import { Ticket } from '../types/index.js';
import { IconTicket, IconCheck, IconAlert, IconSearch, IconClock } from './icons.js';

interface TicketsViewProps {
  tickets: Ticket[];
  onUpdateTicketStatus: (ticketId: string, status: 'Unresolved' | 'Resolved' | 'Escalated') => void;
  onOpenSupportForCustomer: (customerId: string) => void;
}

export function TicketsView({
  tickets,
  onUpdateTicketStatus,
  onOpenSupportForCustomer,
}: TicketsViewProps) {
  const [filterStatus, setFilterStatus] = useState<'All' | 'Unresolved' | 'Resolved' | 'Escalated'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTickets = tickets.filter(t => {
    const matchesFilter = filterStatus === 'All' || t.currentStatus === filterStatus;
    const matchesSearch =
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.issue.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.knownPattern.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono uppercase text-slate-500 tracking-wider mb-1">
            TechKart Operations
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Support Ticket Management
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Every ticket links directly to Hindsight persistent memory to preserve recurring pattern detection.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs font-mono text-slate-700 bg-slate-100 px-3 py-1.5 border border-slate-300">
            Total Tickets: <strong className="tabular-nums">{tickets.length}</strong>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-1">
          {(['All', 'Unresolved', 'Resolved', 'Escalated'] as const).map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 text-xs font-semibold transition-colors border ${
                filterStatus === status
                  ? 'bg-blue-700 text-white border-blue-700'
                  : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-100'
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="relative w-72">
          <IconSearch className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search tickets, customers, patterns..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-blue-600"
          />
        </div>
      </div>

      {/* Tickets List */}
      <div className="space-y-4">
        {filteredTickets.length === 0 ? (
          <div className="p-12 text-center bg-white border border-slate-200 text-slate-500 text-xs">
            No tickets match the selected filter.
          </div>
        ) : (
          filteredTickets.map(ticket => (
            <div
              key={ticket.id}
              className="bg-white border border-slate-200 p-6 space-y-4 text-xs transition-colors hover:border-slate-300"
            >
              {/* Ticket Top Meta */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-bold text-slate-900">
                    {ticket.id}
                  </span>
                  <span className="text-slate-400">·</span>
                  <button
                    onClick={() => onOpenSupportForCustomer(ticket.customerId)}
                    className="font-bold text-blue-700 hover:underline text-sm"
                  >
                    {ticket.customerName}
                  </button>
                  <span className="text-slate-400">({ticket.customerId} · {ticket.device})</span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`font-mono text-[10px] font-bold uppercase px-2 py-0.5 border ${
                      ticket.priority === 'Urgent' || ticket.priority === 'High'
                        ? 'bg-rose-50 text-rose-800 border-rose-200'
                        : ticket.priority === 'Medium'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    Priority: {ticket.priority}
                  </span>

                  <span
                    className={`font-mono text-[10px] font-bold uppercase px-2 py-0.5 border ${
                      ticket.currentStatus === 'Resolved'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : ticket.currentStatus === 'Escalated'
                        ? 'bg-rose-50 text-rose-800 border-rose-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}
                  >
                    Status: {ticket.currentStatus}
                  </span>
                </div>
              </div>

              {/* Issue Description */}
              <div className="space-y-1">
                <div className="font-bold text-slate-900 text-sm">{ticket.issue}</div>
                <div className="text-slate-500 font-mono text-[11px]">
                  Category: {ticket.category} · Created: {new Date(ticket.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                </div>
              </div>

              {/* Memory Insights Box */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3.5 bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <div className="text-[10px] font-mono uppercase text-slate-500 font-bold mb-0.5">
                    Previous Occurrences
                  </div>
                  <div className="font-mono font-bold text-slate-900 text-sm tabular-nums">
                    {ticket.previousOccurrences} times
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-mono uppercase text-slate-500 font-bold mb-0.5">
                    Known Memory Pattern
                  </div>
                  <div className="text-slate-800">{ticket.knownPattern}</div>
                </div>

                <div>
                  <div className="text-[10px] font-mono uppercase text-slate-500 font-bold mb-0.5">
                    Previous Successful Solution
                  </div>
                  <div className="text-emerald-800 font-medium">
                    {ticket.previousSuccessfulSolution}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <button
                  onClick={() => onOpenSupportForCustomer(ticket.customerId)}
                  className="text-xs font-semibold text-blue-700 hover:text-blue-900"
                >
                  Open in Support Agent →
                </button>

                <div className="flex items-center gap-2">
                  {ticket.currentStatus !== 'Resolved' && (
                    <button
                      onClick={() => onUpdateTicketStatus(ticket.id, 'Resolved')}
                      className="px-3 py-1.5 bg-emerald-700 text-white font-semibold hover:bg-emerald-800 transition-colors flex items-center gap-1.5"
                    >
                      <IconCheck className="w-3.5 h-3.5" />
                      <span>Mark Resolved</span>
                    </button>
                  )}

                  {ticket.currentStatus !== 'Escalated' && ticket.currentStatus !== 'Resolved' && (
                    <button
                      onClick={() => onUpdateTicketStatus(ticket.id, 'Escalated')}
                      className="px-3 py-1.5 bg-rose-700 text-white font-semibold hover:bg-rose-800 transition-colors flex items-center gap-1.5"
                    >
                      <IconAlert className="w-3.5 h-3.5" />
                      <span>Escalate</span>
                    </button>
                  )}

                  {ticket.currentStatus === 'Resolved' && (
                    <button
                      onClick={() => onUpdateTicketStatus(ticket.id, 'Unresolved')}
                      className="px-3 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                      Reopen Ticket
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
