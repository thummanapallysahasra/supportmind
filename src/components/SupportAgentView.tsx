import React, { useState, useRef, useEffect } from 'react';
import { Customer, MemoryItem, ChatMessage, Ticket } from '../types/index.js';
import {
  IconSend,
  IconMemory,
  IconTicket,
  IconRefresh,
  IconChevronDown,
  IconChevronRight,
  IconCheck,
  IconAlert,
  IconClock,
  IconDatabase,
} from './icons.js';

interface SupportAgentViewProps {
  customers: Customer[];
  selectedCustomer: Customer;
  onSelectCustomer: (customer: Customer) => void;
  memoryEnabled: boolean;
  onToggleMemory: () => void;
  onCreateTicket: (ticket: Omit<Ticket, 'id' | 'createdAt'>) => void;
  initialMessageToSend?: string;
  onClearInitialMessage?: () => void;
}

export function SupportAgentView({
  customers,
  selectedCustomer,
  onSelectCustomer,
  memoryEnabled,
  onToggleMemory,
  onCreateTicket,
  initialMessageToSend,
  onClearInitialMessage,
}: SupportAgentViewProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [expandedMemoryId, setExpandedMemoryId] = useState<string | null>(null);
  const [activeRelevantMemories, setActiveRelevantMemories] = useState<MemoryItem[]>([]);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [ticketSuccessNotice, setTicketSuccessNotice] = useState<string | null>(null);

  // New ticket form state
  const [ticketIssue, setTicketIssue] = useState('');
  const [ticketOccurrences, setTicketOccurrences] = useState(2);
  const [ticketPattern, setTicketPattern] = useState('');
  const [ticketSolution, setTicketSolution] = useState('');
  const [ticketPriority, setTicketPriority] = useState<'Low' | 'Medium' | 'High' | 'Urgent'>('Medium');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load customer memory context when selected customer changes
  useEffect(() => {
    fetchCustomerMemories(selectedCustomer.id);
    // Initialize default welcome message for the customer
    setMessages([
      {
        id: 'msg-welcome',
        sender: 'agent',
        content: `TechKart Support Console ready for ${selectedCustomer.name} (${selectedCustomer.id} · ${selectedCustomer.device}). How can I assist you with your hardware or active orders today?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  }, [selectedCustomer.id]);

  // Handle incoming hero demo message trigger if passed from Dashboard
  useEffect(() => {
    if (initialMessageToSend) {
      sendMessage(initialMessageToSend);
      if (onClearInitialMessage) onClearInitialMessage();
    }
  }, [initialMessageToSend]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  const fetchCustomerMemories = async (customerId: string) => {
    try {
      const res = await fetch(`/api/customers/${customerId}/memories`);
      const data = await res.json();
      if (data.memories) {
        setActiveRelevantMemories(data.memories);
      }
    } catch (err) {
      console.error('Error fetching customer memories:', err);
    }
  };

  const sendMessage = async (textToSend?: string) => {
    const messageContent = (textToSend || inputValue).trim();
    if (!messageContent || isGenerating) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'customer',
      content: messageContent,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsGenerating(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: selectedCustomer.id,
          message: messageContent,
          conversationHistory: messages.map(m => ({ sender: m.sender, content: m.content })),
          memoryEnabled,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        const agentMessage: ChatMessage = {
          id: `msg-agent-${Date.now()}`,
          sender: 'agent',
          content: result.reply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          memoryUsed: result.memoriesUsed,
          memoryStored: result.memoryStored,
        };

        setMessages(prev => [...prev, agentMessage]);

        // If memories were recalled, highlight them in the active panel
        if (result.memoriesUsed && result.memoriesUsed.length > 0) {
          setActiveRelevantMemories(prev => {
            const memoryIds = new Set(result.memoriesUsed.map((m: any) => m.id));
            return prev.map(m => ({
              ...m,
              relevanceScore: memoryIds.has(m.id) ? 95 : 30,
            }));
          });
        }

        // Auto-populate ticket fields if user wants to generate ticket from this event
        if (selectedCustomer.id === 'CUST-001' && messageContent.toLowerCase().includes('payment')) {
          setTicketIssue('Repeated UPI payment gateway timeout during checkout');
          setTicketOccurrences(2);
          setTicketPattern('UPI server timeout during peak traffic hours');
          setTicketSolution('Switch to credit/debit card payment gateway');
          setTicketPriority('Medium');
        } else {
          setTicketIssue(`${messageContent.slice(0, 50)}...`);
          setTicketOccurrences(1);
          setTicketPattern(result.memoriesUsed?.[0]?.title || 'Hardware/Order inquiry');
          setTicketSolution(result.memoriesUsed?.[0]?.solution || 'Standard resolution protocol');
          setTicketPriority('Medium');
        }
      } else {
        const errorMessage: ChatMessage = {
          id: `msg-err-${Date.now()}`,
          sender: 'system',
          content: `Support service error: ${result.error || 'Failed to process request'}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages(prev => [...prev, errorMessage]);
      }
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        sender: 'system',
        content: `Connection error: ${err.message}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTicketCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onCreateTicket({
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      issue: ticketIssue,
      category: 'Payment',
      previousOccurrences: Number(ticketOccurrences),
      knownPattern: ticketPattern,
      previousSuccessfulSolution: ticketSolution,
      currentStatus: 'Unresolved',
      priority: ticketPriority,
      device: selectedCustomer.device,
    });

    setShowTicketModal(false);
    setTicketSuccessNotice(`Ticket successfully created and registered with TechKart central operations.`);
    setTimeout(() => setTicketSuccessNotice(null), 4000);
  };

  // Demo shortcut messages
  const demoPrompts = [
    {
      label: 'Hero: "My payment isn\'t working again."',
      text: "My payment isn't working again.",
      targetCustomerId: 'CUST-001',
    },
    {
      label: 'GST Invoice: "I need my business PDF tax invoice"',
      text: 'I need my business PDF tax invoice for company expense reimbursement.',
      targetCustomerId: 'CUST-002',
    },
    {
      label: 'Audio Sync: "My left earbud is disconnecting"',
      text: 'My left earbud is disconnecting from my laptop again.',
      targetCustomerId: 'CUST-003',
    },
  ];

  return (
    <div className="flex h-full bg-slate-50">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white border-r border-slate-200">
        {/* Top Control Bar */}
        <div className="p-4 border-b border-slate-200 bg-white flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-900">SupportMind AI</h1>
                <span className="text-[11px] font-mono text-blue-700 bg-blue-50 px-2 py-0.5 border border-blue-200">
                  Memory-powered support
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                Session with <span className="font-semibold text-slate-800">{selectedCustomer.name}</span> (
                {selectedCustomer.device})
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Customer Switcher */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500">Customer:</span>
              <select
                value={selectedCustomer.id}
                onChange={e => {
                  const target = customers.find(c => c.id === e.target.value);
                  if (target) onSelectCustomer(target);
                }}
                className="px-2.5 py-1.5 border border-slate-300 text-xs font-medium bg-white text-slate-800 focus:outline-none focus:border-blue-600"
              >
                {customers.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.id})
                  </option>
                ))}
              </select>
            </div>

            {/* Memory ON / OFF Toggle */}
            <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
              <span className="text-xs font-medium text-slate-600">Hindsight Memory:</span>
              <button
                type="button"
                onClick={onToggleMemory}
                className={`px-3 py-1 text-xs font-bold transition-colors border ${
                  memoryEnabled
                    ? 'bg-blue-700 text-white border-blue-700'
                    : 'bg-slate-100 text-slate-600 border-slate-300 hover:bg-slate-200'
                }`}
              >
                {memoryEnabled ? 'MEMORY: ON' : 'MEMORY: OFF'}
              </button>
            </div>

            {/* Create Ticket Trigger */}
            <button
              onClick={() => setShowTicketModal(true)}
              className="px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors flex items-center gap-1.5"
            >
              <IconTicket className="w-3.5 h-3.5" />
              <span>Create Ticket</span>
            </button>
          </div>
        </div>

        {/* Demo Prompts Bar */}
        <div className="px-4 py-2 bg-slate-100/70 border-b border-slate-200 flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-mono uppercase text-slate-500 font-bold shrink-0">Demo Shortcuts:</span>
          {demoPrompts.map((d, idx) => (
            <button
              key={idx}
              onClick={() => {
                const targetCust = customers.find(c => c.id === d.targetCustomerId);
                if (targetCust && targetCust.id !== selectedCustomer.id) {
                  onSelectCustomer(targetCust);
                }
                sendMessage(d.text);
              }}
              className="px-2.5 py-1 bg-white border border-slate-300 text-[11px] text-slate-700 hover:border-blue-500 hover:text-blue-700 transition-colors font-medium truncate max-w-xs"
            >
              {d.label}
            </button>
          ))}
        </div>

        {/* Notice Banner */}
        {ticketSuccessNotice && (
          <div className="px-4 py-2 bg-emerald-50 border-b border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
            <IconCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{ticketSuccessNotice}</span>
          </div>
        )}

        {/* Chat Stream */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map(msg => {
            const isUser = msg.sender === 'customer';
            const isSystem = msg.sender === 'system';

            if (isSystem) {
              return (
                <div key={msg.id} className="p-3 bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                  <IconAlert className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{msg.content}</span>
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} max-w-2xl ${
                  isUser ? 'ml-auto' : 'mr-auto'
                }`}
              >
                <div className="flex items-center gap-2 mb-1 text-[11px] font-mono text-slate-500">
                  <span className="font-semibold text-slate-700">
                    {isUser ? selectedCustomer.name : 'SupportMind Agent'}
                  </span>
                  <span>·</span>
                  <span>{msg.timestamp}</span>
                </div>

                <div
                  className={`p-4 text-xs leading-relaxed border ${
                    isUser
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-white text-slate-800 border-slate-200'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>

                {/* Agent Memory Footprint */}
                {!isUser && msg.memoryUsed && msg.memoryUsed.length > 0 && (
                  <div className="mt-2 w-full">
                    <button
                      onClick={() =>
                        setExpandedMemoryId(expandedMemoryId === msg.id ? null : msg.id)
                      }
                      className="flex items-center gap-2 px-2.5 py-1 text-[11px] font-mono font-medium text-blue-800 bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors"
                    >
                      <IconMemory className="w-3.5 h-3.5 text-blue-700" />
                      <span>Hindsight Context Recalled ({msg.memoryUsed.length} memories)</span>
                      {expandedMemoryId === msg.id ? (
                        <IconChevronDown className="w-3 h-3" />
                      ) : (
                        <IconChevronRight className="w-3 h-3" />
                      )}
                    </button>

                    {/* Expandable Memory Detail */}
                    {expandedMemoryId === msg.id && (
                      <div className="mt-2 p-3 bg-slate-50 border border-slate-200 text-xs space-y-2">
                        <div className="text-[10px] font-mono uppercase text-slate-500">
                          Recalled Persistent Data Points:
                        </div>
                        {msg.memoryUsed.map(mem => (
                          <div key={mem.id} className="p-2.5 bg-white border border-slate-200 space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-slate-900">{mem.title}</span>
                              <span className="text-[10px] font-mono text-slate-500">{mem.dateDisplay}</span>
                            </div>
                            <p className="text-slate-600">{mem.summary}</p>
                            <div className="text-[11px] text-emerald-800 pt-1 border-t border-slate-100">
                              <span className="font-semibold">Applied Solution: </span>
                              <span>{mem.solution}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Stored Memory Footprint */}
                {!isUser && msg.memoryStored && (
                  <div className="mt-1.5 text-[11px] font-mono text-emerald-700 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                    <span>Hindsight: Recorded new interaction event to namespace</span>
                  </div>
                )}
              </div>
            );
          })}

          {isGenerating && (
            <div className="flex items-center gap-2 text-xs text-slate-500 font-mono p-3 bg-slate-50 border border-slate-200 max-w-sm">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <span>
                {memoryEnabled
                  ? 'Querying Hindsight persistent memory and generating response...'
                  : 'Generating generic support response...'}
              </span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-200 bg-white">
          <form
            onSubmit={e => {
              e.preventDefault();
              sendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder={`Ask as customer ${selectedCustomer.name} (e.g. "My payment isn't working again.")...`}
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              disabled={isGenerating}
              className="flex-1 px-4 py-2.5 text-xs border border-slate-300 focus:outline-none focus:border-blue-600 disabled:opacity-50 bg-white"
            />
            <button
              type="submit"
              disabled={isGenerating || !inputValue.trim()}
              className="px-5 py-2.5 bg-blue-700 text-white text-xs font-bold hover:bg-blue-800 transition-colors disabled:opacity-50 flex items-center gap-1.5"
            >
              <IconSend className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>
          <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 font-mono">
            <span>
              Memory status:{' '}
              <strong className={memoryEnabled ? 'text-blue-700' : 'text-slate-600'}>
                {memoryEnabled ? 'ACTIVE (Retrieving history)' : 'DISABLED (Generic bot mode)'}
              </strong>
            </span>
            <span>Customer ID: {selectedCustomer.id}</span>
          </div>
        </div>
      </div>

      {/* Right Side Panel: Customer Memory */}
      <div className="w-88 bg-slate-50 flex flex-col shrink-0 overflow-y-auto border-l border-slate-200">
        <div className="p-4 border-b border-slate-200 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-500 font-bold">
              Customer Memory
            </span>
            <span className="text-[10px] font-mono text-blue-700 bg-blue-50 px-2 py-0.5 border border-blue-200">
              Hindsight Persistent
            </span>
          </div>
          <h2 className="text-base font-bold text-slate-900 mt-1">{selectedCustomer.name}</h2>
          <div className="text-xs text-slate-500 mt-0.5 font-mono">
            Namespace: customer_{selectedCustomer.id.replace('-', '_')}
          </div>
        </div>

        <div className="p-5 space-y-5 text-xs">
          {/* Hardware & Identity */}
          <div className="bg-white border border-slate-200 p-4 space-y-2">
            <div className="text-[10px] font-mono uppercase text-slate-500">Hardware Profile</div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Registered Device:</span>
              <span className="font-semibold text-slate-900">{selectedCustomer.device}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Last Interaction:</span>
              <span className="font-mono text-slate-800">{selectedCustomer.lastInteraction}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Total Contacts:</span>
              <span className="font-mono font-bold text-slate-900 tabular-nums">
                {selectedCustomer.totalInteractions}
              </span>
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-white border border-slate-200 p-4 space-y-2">
            <div className="text-[10px] font-mono uppercase text-slate-500">Preferences</div>
            <ul className="space-y-1 text-slate-700">
              {selectedCustomer.preferences.map((p, idx) => (
                <li key={idx} className="flex items-start gap-1.5">
                  <span className="text-blue-600 font-mono">·</span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Previous Issues & Solutions Summary */}
          <div className="bg-white border border-slate-200 p-4 space-y-3">
            <div className="text-[10px] font-mono uppercase text-slate-500">Previous Issues & Solutions</div>
            <div className="space-y-2">
              <div className="p-2.5 bg-slate-50 border border-slate-200">
                <div className="font-bold text-slate-900">UPI Payment Timeout</div>
                <div className="text-slate-600 text-[11px] mt-0.5">Solution: Switched to credit/debit card payment</div>
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-200">
                <div className="font-bold text-slate-900">Order Cancellation</div>
                <div className="text-slate-600 text-[11px] mt-0.5">Solution: Cancelled duplicate checkout request</div>
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-200">
                <div className="font-bold text-slate-900">Delivery Delay</div>
                <div className="text-slate-600 text-[11px] mt-0.5">Solution: Handled via BlueDart express line</div>
              </div>
            </div>
          </div>

          {/* Live Relevant Memory Cards */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase text-slate-500 font-bold">
                Retrieved Memory Cards
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                {activeRelevantMemories.length} records
              </span>
            </div>

            {activeRelevantMemories.map(mem => (
              <div
                key={mem.id}
                className="p-3.5 bg-white border border-slate-200 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 truncate pr-2">{mem.title}</span>
                  <span className="text-[10px] font-mono text-blue-700 bg-blue-50 px-1.5 py-0.2 border border-blue-200 shrink-0">
                    {mem.relevanceScore || 90}% Match
                  </span>
                </div>
                <p className="text-slate-600 text-[11px] leading-relaxed">{mem.summary}</p>
                <div className="p-2 bg-slate-50 border border-slate-200 text-[11px] text-slate-800">
                  <span className="font-semibold text-slate-900">Verified Fix: </span>
                  <span>{mem.solution}</span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1">
                  <span>{mem.dateDisplay}</span>
                  <span>Recalled: {mem.recalledCount}x</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Create Support Ticket Modal */}
      {showTicketModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-none flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-300 w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <span className="text-xs font-mono uppercase text-slate-500">Support Operations</span>
                <h3 className="text-base font-bold text-slate-900">
                  Generate Support Ticket (Auto-filled from Memory)
                </h3>
              </div>
              <button
                onClick={() => setShowTicketModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-mono font-bold"
              >
                [X]
              </button>
            </div>

            <form onSubmit={handleTicketCreateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Customer</label>
                <input
                  type="text"
                  disabled
                  value={`${selectedCustomer.name} (${selectedCustomer.id} · ${selectedCustomer.device})`}
                  className="w-full p-2 bg-slate-100 border border-slate-300 text-slate-800 font-mono"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Issue Summary</label>
                <input
                  type="text"
                  required
                  value={ticketIssue}
                  onChange={e => setTicketIssue(e.target.value)}
                  className="w-full p-2 border border-slate-300 bg-white text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Previous Occurrences</label>
                  <input
                    type="number"
                    min="1"
                    value={ticketOccurrences}
                    onChange={e => setTicketOccurrences(Number(e.target.value))}
                    className="w-full p-2 border border-slate-300 bg-white text-slate-900 font-mono tabular-nums"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Priority</label>
                  <select
                    value={ticketPriority}
                    onChange={e => setTicketPriority(e.target.value as any)}
                    className="w-full p-2 border border-slate-300 bg-white text-slate-900"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Known Pattern in Memory</label>
                <input
                  type="text"
                  value={ticketPattern}
                  onChange={e => setTicketPattern(e.target.value)}
                  className="w-full p-2 border border-slate-300 bg-white text-slate-900"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">Previous Successful Solution</label>
                <textarea
                  rows={2}
                  value={ticketSolution}
                  onChange={e => setTicketSolution(e.target.value)}
                  className="w-full p-2 border border-slate-300 bg-white text-slate-900"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowTicketModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-700 text-white font-bold hover:bg-blue-800"
                >
                  Confirm & Create Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
