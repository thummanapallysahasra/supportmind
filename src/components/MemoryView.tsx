import React, { useState } from 'react';
import { Customer, MemoryItem, TimelineEvent } from '../types/index.js';
import { IconSearch, IconMemory, IconPlus, IconClock, IconCheck, IconDatabase } from './icons.js';

interface MemoryViewProps {
  customers: Customer[];
  selectedCustomerId: string;
  onSelectCustomer: (id: string) => void;
  memories: MemoryItem[];
  timeline: TimelineEvent[];
  onAddMemory: (customerId: string, memoryData: any) => void;
}

export function MemoryView({
  customers,
  selectedCustomerId,
  onSelectCustomer,
  memories,
  timeline,
  onAddMemory,
}: MemoryViewProps) {
  const [activeTab, setActiveTab] = useState<'timeline' | 'namespaces'>('timeline');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // New Memory state
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<'payment' | 'order' | 'delivery' | 'return' | 'refund' | 'account' | 'technical' | 'preference'>('technical');
  const [newSummary, setNewSummary] = useState('');
  const [newSolution, setNewSolution] = useState('');
  const [newOutcome, setNewOutcome] = useState('');
  const [newTags, setNewTags] = useState('');

  const activeCustomer = customers.find(c => c.id === selectedCustomerId) || customers[0];

  const filteredMemories = memories.filter(
    m =>
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.solution.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const customerTimeline = timeline.filter(t => t.customerId === activeCustomer?.id);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddMemory(activeCustomer.id, {
      category: newCategory,
      title: newTitle,
      summary: newSummary,
      solution: newSolution,
      outcome: newOutcome,
      device: activeCustomer.device,
      tags: newTags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean),
    });

    setShowAddModal(false);
    setNewTitle('');
    setNewSummary('');
    setNewSolution('');
    setNewOutcome('');
    setNewTags('');
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="bg-white border border-slate-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-500 uppercase tracking-wider mb-1">
            <IconDatabase className="w-3.5 h-3.5 text-blue-700" />
            <span>Hindsight Semantic Memory Layer</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Customer Memory & Interaction Timeline
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Browse partitioned namespaces, chronological customer resolutions, and verified solution memories.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Namespace Customer Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Customer:</span>
            <select
              value={activeCustomer?.id}
              onChange={e => onSelectCustomer(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 text-xs font-medium bg-white text-slate-900 focus:outline-none focus:border-blue-600"
            >
              {customers.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} (customer_{c.id.replace('-', '_')})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 bg-blue-700 text-white text-xs font-bold hover:bg-blue-800 transition-colors flex items-center gap-1.5"
          >
            <IconPlus className="w-3.5 h-3.5" />
            <span>Record Memory</span>
          </button>
        </div>
      </div>

      {/* Segmented View Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-4 py-2 text-xs font-bold transition-colors border-b-2 -mb-2 ${
              activeTab === 'timeline'
                ? 'border-blue-700 text-blue-700 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Chronological Timeline
          </button>
          <button
            onClick={() => setActiveTab('namespaces')}
            className={`px-4 py-2 text-xs font-bold transition-colors border-b-2 -mb-2 ${
              activeTab === 'namespaces'
                ? 'border-blue-700 text-blue-700 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            Hindsight Memory Cards ({filteredMemories.length})
          </button>
        </div>

        {activeTab === 'namespaces' && (
          <div className="relative w-64">
            <IconSearch className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search memory cards..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-blue-600"
            />
          </div>
        )}
      </div>

      {/* Tab 1: Chronological Memory Timeline */}
      {activeTab === 'timeline' && (
        <div className="bg-white border border-slate-200 p-8 space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <span className="text-xs font-mono uppercase text-slate-500">Timeline Analysis</span>
            <h2 className="text-lg font-bold text-slate-900">
              Interaction & Resolution History: {activeCustomer.name}
            </h2>
            <div className="text-xs text-slate-500 mt-1">
              Device: <strong className="text-slate-800">{activeCustomer.device}</strong> · Total interactions recorded:{' '}
              <strong className="text-slate-800 font-mono">{activeCustomer.totalInteractions}</strong>
            </div>
          </div>

          <div className="relative pl-6 space-y-8 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {customerTimeline.map((item, idx) => (
              <div key={item.id || idx} className="relative group">
                {/* Bullet */}
                <div className="absolute -left-6 top-1 w-4 h-4 bg-white border-2 border-blue-600 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-blue-700" />
                </div>

                <div className="border border-slate-200 p-5 bg-slate-50/70 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-200/80 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-blue-700">{item.date}</span>
                      <span className="text-slate-300">/</span>
                      <span className="font-bold text-slate-900 text-sm">{item.issue}</span>
                    </div>
                    {item.memoryRefId && (
                      <span className="text-[10px] font-mono text-slate-500 bg-white px-2 py-0.5 border border-slate-200">
                        Hindsight Ref: {item.memoryRefId}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-1">
                    <div className="p-3 bg-white border border-slate-200">
                      <div className="text-[10px] font-mono uppercase text-slate-500 font-bold mb-1">
                        Diagnosis
                      </div>
                      <p className="text-slate-700 leading-relaxed">{item.diagnosis}</p>
                    </div>

                    <div className="p-3 bg-white border border-slate-200">
                      <div className="text-[10px] font-mono uppercase text-slate-500 font-bold mb-1">
                        Suggested Action
                      </div>
                      <p className="text-slate-700 leading-relaxed">{item.suggestedAction}</p>
                    </div>

                    <div className="p-3 bg-emerald-50/60 border border-emerald-200">
                      <div className="text-[10px] font-mono uppercase text-emerald-800 font-bold mb-1">
                        Verified Outcome
                      </div>
                      <p className="text-emerald-900 leading-relaxed">{item.outcome}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Memory Namespace Cards */}
      {activeTab === 'namespaces' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMemories.map(mem => (
            <div key={mem.id} className="bg-white border border-slate-200 p-5 space-y-3 text-xs">
              <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{mem.title}</span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                    {mem.namespace} · {mem.id}
                  </div>
                </div>
                <span className="font-mono text-[10px] uppercase text-blue-800 bg-blue-50 px-2 py-0.5 border border-blue-200 shrink-0">
                  {mem.category}
                </span>
              </div>

              <p className="text-slate-600 leading-relaxed">{mem.summary}</p>

              <div className="p-2.5 bg-slate-50 border border-slate-200 space-y-1">
                <div className="text-[10px] font-mono uppercase text-slate-500 font-bold">
                  Persistent Solution
                </div>
                <div className="text-slate-800 font-medium">{mem.solution}</div>
              </div>

              <div className="p-2.5 bg-emerald-50/50 border border-emerald-200 text-emerald-900">
                <span className="font-bold">Result: </span>
                <span>{mem.outcome}</span>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {mem.tags.map(t => (
                    <span key={t} className="bg-slate-100 px-1.5 py-0.2 border border-slate-200 text-slate-700">
                      {t}
                    </span>
                  ))}
                </div>
                <span>Recalls: {mem.recalledCount}x</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Memory Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-300 w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-xs font-mono uppercase text-slate-500">Hindsight Engine</span>
                <h3 className="text-base font-bold text-slate-900">
                  Record New Memory for {activeCustomer.name}
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-mono font-bold"
              >
                [X]
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Memory Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HDMI Display Flickering Resolution"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full p-2 border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value as any)}
                    className="w-full p-2 border border-slate-300 bg-white text-slate-900"
                  >
                    <option value="payment">Payment</option>
                    <option value="order">Order</option>
                    <option value="delivery">Delivery</option>
                    <option value="return">Return</option>
                    <option value="refund">Refund</option>
                    <option value="technical">Technical</option>
                    <option value="account">Account</option>
                    <option value="preference">Preference</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Tags (comma-separated)</label>
                  <input
                    type="text"
                    placeholder="hdmi, display, cable"
                    value={newTags}
                    onChange={e => setNewTags(e.target.value)}
                    className="w-full p-2 border border-slate-300 bg-white text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Problem Summary</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Describe the issue reported by the customer..."
                  value={newSummary}
                  onChange={e => setNewSummary(e.target.value)}
                  className="w-full p-2 border border-slate-300 bg-white text-slate-900"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Successful Solution</label>
                <textarea
                  rows={2}
                  required
                  placeholder="What solution resolved this issue?"
                  value={newSolution}
                  onChange={e => setNewSolution(e.target.value)}
                  className="w-full p-2 border border-slate-300 bg-white text-slate-900"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Verified Outcome</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Display stable at 4K 60Hz"
                  value={newOutcome}
                  onChange={e => setNewOutcome(e.target.value)}
                  className="w-full p-2 border border-slate-300 bg-white text-slate-900"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-700 text-white font-bold hover:bg-blue-800"
                >
                  Store Memory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
