import React from 'react';
import { Customer, MemoryItem, ViewTab } from '../types/index.js';
import {
  IconChat,
  IconMemory,
  IconPlay,
  IconClock,
  IconCheck,
  IconAlert,
  IconDatabase,
} from './icons.js';

interface DashboardViewProps {
  onNavigate: (tab: ViewTab) => void;
  onLaunchHeroDemo: () => void;
  customers: Customer[];
  memories: MemoryItem[];
  analytics: {
    totalCustomers: number;
    memoriesStored: number;
    problemsResolved: number;
    avgResolutionTimeMinutes: number;
    repeatedIssuesDetected: number;
  };
}

export function DashboardView({
  onNavigate,
  onLaunchHeroDemo,
  customers,
  memories,
  analytics,
}: DashboardViewProps) {
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Hero Section */}
      <div className="bg-white border border-slate-200 p-8">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-mono font-medium text-blue-700 uppercase tracking-wider mb-2">
            <span>TechKart Support Intelligence</span>
            <span>·</span>
            <span>Persistent Memory Layer</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 mb-2">
            SupportMind: Customer support that remembers.
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed mb-6">
            AI-powered support that learns from every interaction and uses customer history to deliver
            personalized assistance. Built on Hindsight persistent memory to eliminate repetitive customer friction.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('chat')}
              className="px-4 py-2 bg-blue-700 text-white text-xs font-semibold hover:bg-blue-800 transition-colors flex items-center gap-2"
            >
              <IconChat className="w-4 h-4" />
              <span>Open Support Agent</span>
            </button>

            <button
              onClick={() => onNavigate('memory')}
              className="px-4 py-2 bg-slate-100 border border-slate-300 text-slate-800 text-xs font-semibold hover:bg-slate-200 transition-colors flex items-center gap-2"
            >
              <IconMemory className="w-4 h-4" />
              <span>View Memory Timeline</span>
            </button>

            <button
              onClick={onLaunchHeroDemo}
              className="px-4 py-2 bg-amber-50 border border-amber-300 text-amber-900 text-xs font-semibold hover:bg-amber-100 transition-colors flex items-center gap-2"
            >
              <IconPlay className="w-3.5 h-3.5 text-amber-700" />
              <span>Launch 60-Second Hackathon Demo</span>
            </button>
          </div>
        </div>
      </div>

      {/* Prominent Demo Mode Banner */}
      <div className="border border-blue-200 bg-blue-50/60 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase bg-blue-700 text-white px-2 py-0.5 font-bold">
                Featured Hero Scenario
              </span>
              <span className="text-xs font-semibold text-slate-900">
                Customer: Rahul Sharma (iPhone 15)
              </span>
            </div>
            <p className="text-xs text-slate-700">
              Previous history: UPI transaction timed out during purchase; switching to card payment succeeded.
              Simulate Rahul returning with message: <strong>"My payment isn't working again."</strong> Watch SupportMind
              recall the exact UPI pattern and suggest card payment instantly.
            </p>
          </div>
          <button
            onClick={onLaunchHeroDemo}
            className="px-4 py-2.5 bg-blue-700 text-white text-xs font-bold hover:bg-blue-800 transition-colors whitespace-nowrap shrink-0 flex items-center justify-center gap-2"
          >
            <IconPlay className="w-3.5 h-3.5" />
            <span>Simulate Returning Customer</span>
          </button>
        </div>
      </div>

      {/* 4-Stat Metric Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-5">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">Total Customers</div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
            {analytics.totalCustomers.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Active TechKart customer profiles</div>
        </div>

        <div className="bg-white border border-slate-200 p-5">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">Memories Stored</div>
          <div className="text-2xl font-bold font-mono text-blue-700 mt-1 tabular-nums">
            {analytics.memoriesStored.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Hindsight persistent records</div>
        </div>

        <div className="bg-white border border-slate-200 p-5">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">Problems Resolved</div>
          <div className="text-2xl font-bold font-mono text-emerald-700 mt-1 tabular-nums">
            {analytics.problemsResolved.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">Verified resolutions documented</div>
        </div>

        <div className="bg-white border border-slate-200 p-5">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">Avg Resolution Time</div>
          <div className="text-2xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
            {analytics.avgResolutionTimeMinutes} min
          </div>
          <div className="text-[11px] text-emerald-700 mt-1">Reduced from 14.5 min baseline</div>
        </div>
      </div>

      {/* Before vs After Demo Showcase */}
      <div className="bg-white border border-slate-200 p-6 space-y-4">
        <div className="border-b border-slate-200 pb-3">
          <div className="text-xs font-mono text-slate-500 uppercase tracking-wider">Product Value Demonstration</div>
          <h2 className="text-lg font-bold text-slate-900">Before vs After: The Power of Persistent Memory</h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Compare ordinary transactional chatbots against SupportMind powered by Hindsight.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Without Memory */}
          <div className="border border-slate-200 bg-slate-50 p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Generic Chatbot</span>
              <span className="text-[11px] font-mono text-rose-700 bg-rose-50 px-2 py-0.5 border border-rose-200">
                Memory Disabled
              </span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="p-3 bg-white border border-slate-200">
                <span className="font-semibold text-slate-900 block mb-1">Customer (Rahul Sharma):</span>
                <span className="text-slate-700">"My payment isn't working again."</span>
              </div>
              <div className="p-3 bg-white border border-slate-200">
                <span className="font-semibold text-slate-900 block mb-1">Generic AI Agent:</span>
                <span className="text-slate-700 leading-relaxed">
                  "Hello Rahul. Please provide your Order ID, the exact payment method you are attempting to use, and any
                  error message displayed on your screen. Once I have those details, we can initiate troubleshooting."
                </span>
              </div>
            </div>
            <div className="text-[11px] text-rose-800 pt-1 border-t border-slate-200">
              Frustration: Customer must re-explain the whole context from scratch.
            </div>
          </div>

          {/* With Hindsight */}
          <div className="border border-blue-200 bg-blue-50/40 p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-blue-200 pb-2">
              <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">SupportMind AI</span>
              <span className="text-[11px] font-mono text-blue-800 bg-blue-100 px-2 py-0.5 border border-blue-300">
                Hindsight Memory Active
              </span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="p-3 bg-white border border-blue-200">
                <span className="font-semibold text-slate-900 block mb-1">Customer (Rahul Sharma):</span>
                <span className="text-slate-700">"My payment isn't working again."</span>
              </div>
              <div className="p-3 bg-white border border-blue-200">
                <span className="font-semibold text-blue-900 block mb-1">SupportMind Agent:</span>
                <span className="text-slate-800 leading-relaxed">
                  "I remember you experienced a similar payment issue earlier, where the UPI transaction timed out.
                  Switching to card payment resolved it last time. Are you currently trying UPI again?"
                </span>
              </div>
            </div>
            <div className="text-[11px] text-blue-900 pt-1 border-t border-blue-200">
              Advantage: Immediate recall of specific failure mode and previously verified solution.
            </div>
          </div>
        </div>
      </div>

      {/* How SupportMind Learns Over Time */}
      <div className="bg-white border border-slate-200 p-6 space-y-5">
        <div className="border-b border-slate-200 pb-3">
          <div className="text-xs font-mono text-slate-500 uppercase tracking-wider">Continuous Learning Architecture</div>
          <h2 className="text-lg font-bold text-slate-900">How SupportMind Learns</h2>
          <p className="text-xs text-slate-600 mt-0.5">
            Hindsight transforms every conversation into permanent, searchable organizational memory.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="border border-slate-200 p-4 bg-slate-50">
            <div className="text-xs font-mono text-slate-500 font-semibold mb-1">Interaction 1</div>
            <div className="text-sm font-bold text-slate-900 mb-1">Generic Baseline</div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Standard troubleshooting. Resolves initial questions and records interaction into customer namespace.
            </p>
          </div>

          <div className="border border-slate-200 p-4 bg-slate-50">
            <div className="text-xs font-mono text-slate-500 font-semibold mb-1">Interaction 5</div>
            <div className="text-sm font-bold text-slate-900 mb-1">Preferences Known</div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Recalls communication channels, notification timing, preferred invoice formats, and hardware models.
            </p>
          </div>

          <div className="border border-slate-200 p-4 bg-slate-50">
            <div className="text-xs font-mono text-slate-500 font-semibold mb-1">Interaction 10</div>
            <div className="text-sm font-bold text-slate-900 mb-1">Pattern Recognition</div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Detects repeated issues like recurring gateway timeouts or specific firmware conflicts across devices.
            </p>
          </div>

          <div className="border border-blue-200 p-4 bg-blue-50/50">
            <div className="text-xs font-mono text-blue-700 font-semibold mb-1">Interaction 20+</div>
            <div className="text-sm font-bold text-blue-900 mb-1">Anticipatory Support</div>
            <p className="text-xs text-slate-700 leading-relaxed">
              Delivers hyper-personalized solutions instantly, cutting resolution time by more than 75%.
            </p>
          </div>
        </div>
      </div>

      {/* Recent Memory Highlights */}
      <div className="bg-white border border-slate-200 p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <div className="text-xs font-mono text-slate-500 uppercase tracking-wider">Hindsight Live Stream</div>
            <h2 className="text-base font-bold text-slate-900">Recent Customer Memories in Hindsight</h2>
          </div>
          <button
            onClick={() => onNavigate('memory')}
            className="text-xs font-semibold text-blue-700 hover:text-blue-900 transition-colors"
          >
            Explore all memories →
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {memories.slice(0, 4).map(mem => (
            <div key={mem.id} className="py-3 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-slate-500">{mem.id}</span>
                  <span className="font-semibold text-slate-900">{mem.title}</span>
                  <span className="text-slate-400">·</span>
                  <span className="text-slate-500 font-mono">{mem.namespace}</span>
                </div>
                <div className="text-slate-600">{mem.summary}</div>
              </div>
              <div className="flex items-center gap-4 text-slate-500 font-mono text-[11px] shrink-0">
                <span>{mem.dateDisplay}</span>
                <span className="bg-slate-100 px-2 py-0.5 text-slate-700 border border-slate-200">
                  Recalled: {mem.recalledCount}x
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
