"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  LayoutDashboard, 
  Workflow, 
  Cpu, 
  Terminal, 
  Database, 
  Settings, 
  Plus, 
  Play, 
  Pause, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  TrendingUp, 
  Activity, 
  Search, 
  Bell, 
  User, 
  ChevronRight, 
  ExternalLink,
  Zap,
  HardDrive,
  RefreshCcw,
  Sliders,
  Layers,
  ArrowUpRight
} from 'lucide-react';

export default function N8nDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("overview");

  // Handler for creating a workflow and redirecting to the builder or workflow page
  const handleCreateWorkflow = () => {
    router.push("/workflows");
  };

  // Mock data for workflows
  const workflows = [
    { id: "wf-1", name: "AI Customer Support Router", trigger: "Webhook", status: "Active", executions: "1.4k", successRate: "99.2%", updated: "10m ago", category: "Neural" },
    { id: "wf-2", name: "Automated Data Scraping & Summarizer", trigger: "Schedule (Cron)", status: "Active", executions: "842", successRate: "95.8%", updated: "1h ago", category: "Extraction" },
    { id: "wf-3", name: "Lead Qualification & CRM Sync", trigger: "Webhook", status: "Paused", executions: "320", successRate: "88.4%", updated: "1d ago", category: "CRM" },
    { id: "wf-4", name: "GitHub PR Reviewer Agent", trigger: "GitHub Event", status: "Active", executions: "2,150", successRate: "99.9%", updated: "3h ago", category: "Development" },
    { id: "wf-5", name: "Invoice Extraction via OCR", trigger: "Email Trigger", status: "Error", executions: "45", successRate: "72.1%", updated: "5m ago", category: "Finance" },
  ];

  // Mock recent logs/executions
  const executionLogs = [
    { id: "exec-9921", workflow: "GitHub PR Reviewer Agent", status: "Success", duration: "1.2s", time: "Just now" },
    { id: "exec-9920", workflow: "AI Customer Support Router", status: "Success", duration: "840ms", time: "2m ago" },
    { id: "exec-9919", workflow: "Invoice Extraction via OCR", status: "Failed", duration: "3.4s", time: "5m ago" },
    { id: "exec-9918", workflow: "Automated Data Scraping & Summarizer", status: "Success", duration: "4.1s", time: "12m ago" },
  ];

  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden text-slate-800">
      
      {/* --- SIDEBAR (Hidden on mobile, visible on medium+ screens) --- */}
      <aside className="w-64 bg-white border-r border-slate-200 flex-col justify-between hidden md:flex z-20 shrink-0">
        <div>
          {/* Logo Brand */}
          <div className="flex items-center gap-2.5 px-6 py-5 border-b border-slate-100">
            <div className="w-9 h-9 bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-500 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/20">
              <Zap className="text-white fill-white" size={18} />
            </div>
            <div>
              <span className="text-base font-black tracking-tighter text-slate-900 uppercase block leading-tight">FlowAI Core</span>
              <span className="text-[9px] font-extrabold text-slate-400 tracking-widest uppercase">n8n Enterprise</span>
            </div>
          </div>

          {/* Nav Items */}
          <div className="px-4 py-6 space-y-1">
            <button 
              onClick={() => setActiveTab("overview")}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'overview' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <LayoutDashboard size={16} />
              <span>Dashboard Overview</span>
            </button>
            <button 
              onClick={() => {
                setActiveTab("workflows");
                router.push("/workflows");
              }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'workflows' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <Workflow size={16} />
              <span>Workflows</span>
            </button>
            <button 
              onClick={() => setActiveTab("nodes")}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'nodes' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <Cpu size={16} />
              <span>AI Worker Nodes</span>
            </button>
            <button 
              onClick={() => setActiveTab("executions")}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'executions' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <Terminal size={16} />
              <span>Execution Logs</span>
            </button>
            <button 
              onClick={() => setActiveTab("credentials")}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab === 'credentials' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              <Database size={16} />
              <span>Credentials & APIs</span>
            </button>
          </div>
        </div>

        {/* Sidebar Footer Storage & System Status */}
        <div className="p-4 border-t border-slate-100 m-4 bg-slate-50 rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Node Cluster</span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
            <HardDrive size={14} className="text-slate-400" />
            <span>Memory: 1.8GB / 8GB</span>
          </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 flex flex-col overflow-y-auto w-full">
        
        {/* Top Navbar */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 px-4 sm:px-8 py-4 bg-white border-b border-slate-200 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              {activeTab === 'overview' && 'Dashboard & Analytics'}
              {activeTab === 'workflows' && 'Workflow Automation Engine'}
              {activeTab === 'nodes' && 'Neural AI Node Manager'}
              {activeTab === 'executions' && 'Real-Time Execution Logs'}
              {activeTab === 'credentials' && 'API Keys & Secrets Vault'}
            </h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end">
            <button className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all cursor-pointer">
              <RefreshCcw size={13} />
              <span className="hidden xs:inline">Sync Nodes</span>
            </button>
            <button 
              onClick={handleCreateWorkflow}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 active:scale-95 transition-all cursor-pointer"
            >
              <Plus size={15} />
              <span>Create Workflow</span>
            </button>
          </div>
        </header>

        {/* Dynamic Panel Content */}
        <div className="p-4 sm:p-8 space-y-6 max-w-7xl w-full mx-auto">
          
          {/* STATS CARDS GRID */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 bg-white border border-slate-200/85 rounded-2xl shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[11px] font-black uppercase tracking-wider">Total Workflows</span>
                <Workflow size={18} className="text-blue-500" />
              </div>
              <div>
                <span className="text-2xl font-black text-slate-900 tracking-tight">28</span>
                <span className="text-xs font-bold text-emerald-500 ml-2">↑ 4 active today</span>
              </div>
            </div>

            <div className="p-5 bg-white border border-slate-200/85 rounded-2xl shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[11px] font-black uppercase tracking-wider">Executions (24h)</span>
                <Activity size={18} className="text-indigo-500" />
              </div>
              <div>
                <span className="text-2xl font-black text-slate-900 tracking-tight">14,892</span>
                <span className="text-xs font-bold text-emerald-500 ml-2">98.4% Success</span>
              </div>
            </div>

            <div className="p-5 bg-white border border-slate-200/85 rounded-2xl shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[11px] font-black uppercase tracking-wider">AI Agent Nodes</span>
                <Cpu size={18} className="text-amber-500" />
              </div>
              <div>
                <span className="text-2xl font-black text-slate-900 tracking-tight">6 Active</span>
                <span className="text-xs font-bold text-slate-400 ml-2">Master Core Online</span>
              </div>
            </div>

            <div className="p-5 bg-white border border-slate-200/85 rounded-2xl shadow-xs flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-[11px] font-black uppercase tracking-wider">Avg Latency</span>
                <Clock size={18} className="text-emerald-500" />
              </div>
              <div>
                <span className="text-2xl font-black text-slate-900 tracking-tight">412ms</span>
                <span className="text-xs font-bold text-emerald-500 ml-2">Optimal</span>
              </div>
            </div>
          </div>

          {/* SECTION: WORKFLOWS TABLE & LIVE LOGS */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Workflows List Table (2 Columns wide) */}
            <div className="lg:col-span-2 bg-white border border-slate-200/85 rounded-2xl shadow-xs p-4 sm:p-6 overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider">Active Automation Pipelines</h3>
                <Link href="/workflows" className="text-xs font-bold text-blue-600 hover:underline cursor-pointer">View All</Link>
              </div>

              <div className="overflow-x-auto w-full">
                <table className="w-full text-left text-xs min-w-[500px]">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-black uppercase tracking-wider">
                      <th className="pb-3">Workflow Name</th>
                      <th className="pb-3">Trigger</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3">Executions</th>
                      <th className="pb-3">Last Updated</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {workflows.map((wf) => (
                      <tr key={wf.id} onClick={() => router.push("/workflows")} className="hover:bg-slate-50/80 transition-colors cursor-pointer">
                        <td className="py-3 font-bold text-slate-800 flex items-center gap-2 max-w-[180px] sm:max-w-xs truncate">
                          <Layers size={14} className="text-blue-500 shrink-0" />
                          <span className="truncate">{wf.name}</span>
                        </td>
                        <td className="py-3 font-medium text-slate-500">{wf.trigger}</td>
                        <td className="py-3">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                            wf.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' :
                            wf.status === 'Paused' ? 'bg-amber-50 text-amber-600 border border-amber-200' :
                            'bg-rose-50 text-rose-600 border border-rose-200'
                          }`}>
                            {wf.status}
                          </span>
                        </td>
                        <td className="py-3 font-semibold text-slate-700">{wf.executions}</td>
                        <td className="py-3 text-slate-400">{wf.updated}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Live Execution Stream (1 Column wide) */}
            <div className="bg-white border border-slate-200/85 rounded-2xl shadow-xs p-4 sm:p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider">Live Execution Stream</h3>
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                </div>

                <div className="space-y-3">
                  {executionLogs.map((log) => (
                    <div key={log.id} className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between gap-2">
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-bold text-slate-800 truncate">{log.workflow}</span>
                        <span className="text-[10px] font-semibold text-slate-400">{log.time} • {log.duration}</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase shrink-0 ${
                        log.status === 'Success' ? 'text-emerald-600 bg-emerald-100/50' : 'text-rose-600 bg-rose-100/50'
                      }`}>
                        {log.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <button className="mt-4 w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer">
                Open Full Terminal Log
              </button>
            </div>

          </div>

          {/* BOTTOM QUICK ACTIONS BANNER */}
          <div className="p-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 rounded-2xl shadow-lg text-white flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
            <div>
              <h3 className="text-sm sm:text-base font-black tracking-tight mb-1">Need to build custom n8n nodes or webhooks?</h3>
              <p className="text-xs text-blue-100 font-medium">Connect external APIs, deploy autonomous workers, and manage state seamlessly.</p>
            </div>
            <button 
              onClick={handleCreateWorkflow}
              className="px-5 py-2.5 bg-white text-blue-600 hover:bg-blue-50 rounded-xl text-xs font-black shadow-md transition-all active:scale-95 whitespace-nowrap cursor-pointer"
            >
              Get Started with Workflows
            </button>
          </div>

        </div>
      </main>
    </div>
  );
}