import React, { useState } from 'react';
import { Customer } from '../types/index.js';
import {
  IconSettings,
  IconCpu,
  IconDatabase,
  IconRefresh,
  IconShield,
  IconCheck,
} from './icons.js';

interface SettingsViewProps {
  onResetDemoData: () => Promise<void>;
  onSelectSampleCustomer: (customer: Customer) => void;
  customers: Customer[];
  memoryEnabled: boolean;
  onToggleMemory: () => void;
}

export function SettingsView({
  onResetDemoData,
  onSelectSampleCustomer,
  customers,
  memoryEnabled,
  onToggleMemory,
}: SettingsViewProps) {
  const [isResetting, setIsResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [showTOSModal, setShowTOSModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  const handleReset = async () => {
    setIsResetting(true);
    try {
      await onResetDemoData();
      setResetMessage('Demo memory bank, customer profiles, and tickets restored to initial state.');
      setTimeout(() => setResetMessage(null), 4000);
    } catch (err: any) {
      setResetMessage(`Reset failed: ${err.message}`);
    } finally {
      setIsResetting(false);
    }
  };

  const handleTestConnection = async () => {
    setTestResult('Testing Hindsight connection...');
    try {
      const res = await fetch('/api/hindsight/status');
      const data = await res.json();
      if (data.status) {
        setTestResult(
          `Connection verified: ${data.status.provider} is active. Response latency: ${data.status.latencyMs}ms. Namespaces indexed: ${data.status.totalNamespaces}.`
        );
      }
    } catch (err: any) {
      setTestResult(`Connection error: ${err.message}`);
    }
  };

  const rahul = customers.find(c => c.id === 'CUST-001') || customers[0];

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="bg-white border border-slate-200 p-6">
        <div className="text-xs font-mono uppercase text-slate-500 tracking-wider mb-1">
          System Configuration
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          SupportMind & Hindsight Settings
        </h1>
        <p className="text-xs text-slate-600 mt-1">
          Manage AI inference engines, Hindsight memory namespaces, and demo testing state.
        </p>
      </div>

      {resetMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
          <IconCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{resetMessage}</span>
        </div>
      )}

      {/* AI Inference Configuration */}
      <div className="bg-white border border-slate-200 p-6 space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
          <IconCpu className="w-4 h-4 text-blue-700" />
          <h2 className="text-base font-bold text-slate-900">AI Intelligence Engine</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-slate-50 border border-slate-200">
            <div className="text-[10px] font-mono text-slate-500 uppercase">Provider</div>
            <div className="font-bold text-slate-900 text-sm mt-0.5">Google Gemini API</div>
            <div className="text-[11px] text-slate-500 mt-1">Server-side @google/genai SDK</div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200">
            <div className="text-[10px] font-mono text-slate-500 uppercase">Model</div>
            <div className="font-mono font-bold text-blue-700 text-sm mt-0.5">gemini-3.8-flash</div>
            <div className="text-[11px] text-slate-500 mt-1">Low-latency reasoning engine</div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200">
            <div className="text-[10px] font-mono text-slate-500 uppercase">Status</div>
            <div className="font-bold text-emerald-700 text-sm mt-0.5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              <span>Active</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">Fallback engine standby</div>
          </div>
        </div>
      </div>

      {/* Hindsight Persistent Memory Configuration */}
      <div className="bg-white border border-slate-200 p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <IconDatabase className="w-4 h-4 text-blue-700" />
            <h2 className="text-base font-bold text-slate-900">Hindsight Persistent Memory Layer</h2>
          </div>
          <button
            onClick={handleTestConnection}
            className="px-3 py-1.5 bg-slate-100 border border-slate-300 text-slate-800 text-xs font-semibold hover:bg-slate-200 transition-colors"
          >
            Test Connection
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-slate-50 border border-slate-200">
            <div className="text-[10px] font-mono text-slate-500 uppercase">Connection Mode</div>
            <div className="font-bold text-slate-900 text-sm mt-0.5">Hindsight Persistent</div>
            <div className="text-[11px] text-slate-500 mt-1">Isolated customer namespaces</div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200">
            <div className="text-[10px] font-mono text-slate-500 uppercase">Namespaces Active</div>
            <div className="font-mono font-bold text-blue-700 text-sm mt-0.5 tabular-nums">
              {customers.length} Partitioned
            </div>
            <div className="text-[11px] text-slate-500 mt-1">customer_CUST_* schema</div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200">
            <div className="text-[10px] font-mono text-slate-500 uppercase">Relevance Scoring</div>
            <div className="font-bold text-slate-900 text-sm mt-0.5">Semantic Heuristics</div>
            <div className="text-[11px] text-slate-500 mt-1">Top-3 recall threshold (35%)</div>
          </div>
        </div>

        {testResult && (
          <div className="p-3 bg-blue-50 border border-blue-200 text-xs text-blue-900 font-mono">
            {testResult}
          </div>
        )}
      </div>

      {/* Hackathon Demo Controls */}
      <div className="bg-white border border-slate-200 p-6 space-y-4">
        <div className="border-b border-slate-200 pb-3">
          <span className="text-xs font-mono uppercase text-slate-500">Evaluation Controls</span>
          <h2 className="text-base font-bold text-slate-900">Hackathon Demo & Testing</h2>
        </div>

        <div className="space-y-3 text-xs">
          <div className="p-4 border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="font-bold text-slate-900">Load Featured Hero Scenario (Rahul Sharma)</div>
              <div className="text-slate-600 mt-0.5">
                Switches active customer to Rahul Sharma (iPhone 15) with preset UPI payment timeout history.
              </div>
            </div>
            <button
              onClick={() => onSelectSampleCustomer(rahul)}
              className="px-3.5 py-2 bg-blue-700 text-white font-bold hover:bg-blue-800 transition-colors whitespace-nowrap"
            >
              Select Rahul Sharma
            </button>
          </div>

          <div className="p-4 border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="font-bold text-slate-900">Default Memory State Toggle</div>
              <div className="text-slate-600 mt-0.5">
                Current default setting for new support agent conversations.
              </div>
            </div>
            <button
              onClick={onToggleMemory}
              className={`px-3.5 py-2 font-bold transition-colors whitespace-nowrap border ${
                memoryEnabled
                  ? 'bg-blue-700 text-white border-blue-700'
                  : 'bg-white text-slate-700 border-slate-300'
              }`}
            >
              {memoryEnabled ? 'Memory: Active' : 'Memory: Disabled'}
            </button>
          </div>

          <div className="p-4 border border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="font-bold text-slate-900">Reset Demo Data to Seed State</div>
              <div className="text-slate-600 mt-0.5">
                Clears newly added memories, reverts customer tickets, and restores the pristine demo dataset.
              </div>
            </div>
            <button
              onClick={handleReset}
              disabled={isResetting}
              className="px-3.5 py-2 border border-rose-300 text-rose-800 hover:bg-rose-50 font-bold transition-colors disabled:opacity-50 whitespace-nowrap flex items-center gap-1.5"
            >
              <IconRefresh className="w-3.5 h-3.5" />
              <span>{isResetting ? 'Resetting...' : 'Reset Demo State'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Compliance: Terms of Service & Privacy Policy */}
      <div className="bg-white border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
        <div className="space-y-1">
          <div className="font-bold text-slate-900">Platform Compliance & Data Governance</div>
          <div className="text-slate-500">
            TechKart customer memory encryption standards and Hindsight namespace retention policy.
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowTOSModal(true)}
            className="text-blue-700 hover:underline font-semibold"
          >
            Terms of Service
          </button>
          <span className="text-slate-300">·</span>
          <button
            onClick={() => setShowPrivacyModal(true)}
            className="text-blue-700 hover:underline font-semibold"
          >
            Privacy Policy
          </button>
        </div>
      </div>

      {/* Terms of Service Modal */}
      {showTOSModal && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-300 w-full max-w-lg p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">SupportMind Terms of Service</h3>
              <button
                onClick={() => setShowTOSModal(false)}
                className="text-slate-400 hover:text-slate-600 font-mono font-bold"
              >
                [X]
              </button>
            </div>
            <div className="space-y-3 text-slate-700 max-h-80 overflow-y-auto pr-2 leading-relaxed">
              <p>
                <strong>1. Acceptance of Terms:</strong> By deploying and operating SupportMind for TechKart electronics customer service, support personnel agree to abide by automated memory handling protocols.
              </p>
              <p>
                <strong>2. Hindsight Memory Isolation:</strong> All customer data is partitioned by unique customer identifier namespaces (`customer_CUST_*`). Cross-customer memory leaking is strictly prohibited by architectural isolation.
              </p>
              <p>
                <strong>3. Synthetic Evaluation Data:</strong> All demo customers, phone numbers, and transaction IDs displayed within this hackathon build are synthetic fixtures generated for demonstration purposes.
              </p>
              <p>
                <strong>4. Responsible AI Usage:</strong> SupportMind utilizes retrieval-augmented context. The agent must never invent historical events or attribute false customer commitments.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setShowTOSModal(false)}
                className="px-4 py-2 bg-slate-900 text-white font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Policy Modal */}
      {showPrivacyModal && (
        <div className="fixed inset-0 bg-slate-900/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-300 w-full max-w-lg p-6 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-base font-bold text-slate-900">SupportMind Privacy Policy</h3>
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="text-slate-400 hover:text-slate-600 font-mono font-bold"
              >
                [X]
              </button>
            </div>
            <div className="space-y-3 text-slate-700 max-h-80 overflow-y-auto pr-2 leading-relaxed">
              <p>
                <strong>1. Data Minimization:</strong> Hindsight stores only support resolution vectors, hardware compatibility profiles, customer contact preferences, and verified troubleshooting outcomes.
              </p>
              <p>
                <strong>2. Financial Security:</strong> TechKart does not store credit/debit card numbers, CVVs, or UPI PINs within persistent memory. Only gateway outcome flags (e.g. timeout on UPI, success on card) are preserved.
              </p>
              <p>
                <strong>3. Right to Erasure:</strong> Customers may request full memory namespace purge at any time via the Reset Demo Data utility.
              </p>
              <p>
                <strong>4. Model Privacy:</strong> Model inferences do not train public weights on customer conversations.
              </p>
            </div>
            <div className="pt-3 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="px-4 py-2 bg-slate-900 text-white font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
