import React from 'react';
import { AnalyticsData } from '../types/index.js';
import { IconAnalytics, IconDatabase, IconClock, IconCheck } from './icons.js';

interface AnalyticsViewProps {
  analytics: AnalyticsData;
}

export function AnalyticsView({ analytics }: AnalyticsViewProps) {
  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="bg-white border border-slate-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono uppercase text-slate-500 tracking-wider mb-1">
            Executive Telemetry
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Support Intelligence & Memory Analytics
          </h1>
          <p className="text-xs text-slate-600 mt-1">
            Real-time evaluation of resolution times, memory utilization, and recurring incident patterns across TechKart.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 border border-blue-200 text-xs text-blue-900 font-mono">
            Memory Utilization Rate: <strong className="font-bold text-blue-700">{analytics.memoryUtilizationRate}%</strong>
          </div>
        </div>
      </div>

      {/* 6-Metric Stat Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white border border-slate-200 p-4">
          <div className="text-[10px] font-mono uppercase text-slate-500 font-semibold">Customers</div>
          <div className="text-xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
            {analytics.totalCustomers.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Active profiles</div>
        </div>

        <div className="bg-white border border-slate-200 p-4">
          <div className="text-[10px] font-mono uppercase text-slate-500 font-semibold">Conversations</div>
          <div className="text-xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
            {analytics.totalConversations.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Total sessions</div>
        </div>

        <div className="bg-white border border-slate-200 p-4">
          <div className="text-[10px] font-mono uppercase text-slate-500 font-semibold">Memories Stored</div>
          <div className="text-xl font-bold font-mono text-blue-700 mt-1 tabular-nums">
            {analytics.memoriesStored.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Hindsight records</div>
        </div>

        <div className="bg-white border border-slate-200 p-4">
          <div className="text-[10px] font-mono uppercase text-slate-500 font-semibold">Resolved</div>
          <div className="text-xl font-bold font-mono text-emerald-700 mt-1 tabular-nums">
            {analytics.problemsResolved.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Verified fixes</div>
        </div>

        <div className="bg-white border border-slate-200 p-4">
          <div className="text-[10px] font-mono uppercase text-slate-500 font-semibold">Patterns Caught</div>
          <div className="text-xl font-bold font-mono text-amber-700 mt-1 tabular-nums">
            {analytics.repeatedIssuesDetected.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Recurring issues</div>
        </div>

        <div className="bg-white border border-slate-200 p-4">
          <div className="text-[10px] font-mono uppercase text-slate-500 font-semibold">Avg Resolution</div>
          <div className="text-xl font-bold font-mono text-slate-900 mt-1 tabular-nums">
            {analytics.avgResolutionTimeMinutes} min
          </div>
          <div className="text-[10px] text-emerald-700 mt-0.5">-76% vs baseline</div>
        </div>
      </div>

      {/* Main Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white border border-slate-200 p-6 space-y-4">
          <div className="border-b border-slate-200 pb-3">
            <span className="text-xs font-mono uppercase text-slate-500">Incident Distribution</span>
            <h2 className="text-base font-bold text-slate-900">Issues by Category</h2>
          </div>

          <div className="space-y-3.5 pt-1 text-xs">
            {analytics.issuesByCategory.map(item => (
              <div key={item.category} className="space-y-1">
                <div className="flex items-center justify-between text-slate-800">
                  <span className="font-semibold">{item.category}</span>
                  <span className="font-mono text-slate-500 tabular-nums">
                    {item.count} tickets ({item.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2 overflow-hidden border border-slate-200">
                  <div
                    className="bg-blue-700 h-full"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500">
            Payment gateway failures and courier delivery routing represent 57% of recurring incidents.
          </div>
        </div>

        {/* Resolution Trend: Generic AI vs SupportMind with Memory */}
        <div className="bg-white border border-slate-200 p-6 space-y-4">
          <div className="border-b border-slate-200 pb-3">
            <span className="text-xs font-mono uppercase text-slate-500">Longitudinal Impact</span>
            <h2 className="text-base font-bold text-slate-900">Average Resolution Time Trend</h2>
          </div>

          <div className="space-y-3 text-xs pt-1">
            <div className="flex items-center gap-4 text-[11px] font-mono text-slate-600 mb-2">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-slate-300 border border-slate-400" />
                <span>Standard Generic Chatbot</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 bg-blue-700 border border-blue-800" />
                <span>SupportMind with Hindsight</span>
              </div>
            </div>

            <div className="space-y-2.5">
              {analytics.resolutionTrend.map(row => (
                <div key={row.month} className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span className="font-bold text-slate-900">{row.month} 2026</span>
                    <span className="text-slate-500">
                      Standard: {row.genericAvgMin}m · SupportMind: <strong className="text-blue-700">{row.memoryAvgMin}m</strong>
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 h-3">
                    <div className="bg-slate-100 border border-slate-200 h-full overflow-hidden">
                      <div
                        className="bg-slate-300 h-full"
                        style={{ width: `${(row.genericAvgMin / 16) * 100}%` }}
                      />
                    </div>
                    <div className="bg-slate-100 border border-slate-200 h-full overflow-hidden">
                      <div
                        className="bg-blue-700 h-full"
                        style={{ width: `${(row.memoryAvgMin / 16) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-[11px] text-emerald-800 font-medium">
            Resolution time dropped from 14.5 minutes to 3.2 minutes as customer memories accumulated in Hindsight.
          </div>
        </div>
      </div>

      {/* Memory Utilization & Pattern Table */}
      <div className="bg-white border border-slate-200 p-6 space-y-4">
        <div className="border-b border-slate-200 pb-3">
          <span className="text-xs font-mono uppercase text-slate-500">Pattern Recognition Intelligence</span>
          <h2 className="text-base font-bold text-slate-900">Top Recurring Patterns Mitigated by Memory</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-200">
            <thead className="bg-slate-50 border-b border-slate-200 font-mono text-slate-600 text-[11px]">
              <tr>
                <th className="p-3">Pattern Description</th>
                <th className="p-3">Target Hardware</th>
                <th className="p-3">Occurrences</th>
                <th className="p-3">Hindsight Automated Solution</th>
                <th className="p-3">Resolution Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="p-3 font-semibold text-slate-900">UPI Payment Gateway Timeout</td>
                <td className="p-3 text-slate-600">Smartphones (iOS/Android)</td>
                <td className="p-3 font-mono tabular-nums text-slate-900">412</td>
                <td className="p-3 text-slate-700">Immediate card payment route suggestion</td>
                <td className="p-3 font-mono text-emerald-700 font-bold">98.2%</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-900">Morning Gate Delivery Routing</td>
                <td className="p-3 text-slate-600">All Shipments</td>
                <td className="p-3 font-mono tabular-nums text-slate-900">289</td>
                <td className="p-3 text-slate-700">Auto-inject guard clearance notes in manifest</td>
                <td className="p-3 font-mono text-emerald-700 font-bold">96.5%</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-900">True Wireless Channel Desync</td>
                <td className="p-3 text-slate-600">SonicBuds Pro Audio</td>
                <td className="p-3 font-mono tabular-nums text-slate-900">144</td>
                <td className="p-3 text-slate-700">Factory hard reset & firmware upgrade v2.1</td>
                <td className="p-3 font-mono text-emerald-700 font-bold">94.0%</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-900">Multiport Dock Video Flickering</td>
                <td className="p-3 text-slate-600">ThunderDock 10-in-1</td>
                <td className="p-3 font-mono tabular-nums text-slate-900">92</td>
                <td className="p-3 text-slate-700">Direct advance hardware replacement</td>
                <td className="p-3 font-mono text-emerald-700 font-bold">100.0%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
