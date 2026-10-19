"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import ReactFlow, {
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  Background,
  Controls,
  Handle,
  Position,
  Panel,
  useStore,
} from "reactflow";
import "reactflow/dist/style.css";
import axios from "axios";
import { Save, Send, Terminal, Cpu, Zap, Play, Plus, Menu, Activity, Loader2, X, MessageSquare, Link2, CheckCircle2, AlertCircle } from "lucide-react";
import { Code, Stethoscope, Sprout, ChefHat, Video, Settings, Newspaper, Briefcase, CloudRain, Box, Trophy, FileText, Scale, Network, Bot, Sparkles, Search } from "lucide-react";

const NODE_TYPES_CONFIG = [
  { id: "coding", label: "Coding Assistant", color: "bg-blue-600", icon: Code },
  { id: "doctor", label: "Medical AI", color: "bg-rose-600", icon: Stethoscope },
  { id: "farmer", label: "Agri Expert", color: "bg-emerald-600", icon: Sprout },
  { id: "advice", label: "Legal Advice", color: "bg-amber-600", icon: Scale },
  { id: "classifier", label: "Classifier / Router", color: "bg-orange-600", icon: Network },
  { id: "general", label: "General AI", color: "bg-slate-600", icon: Bot },
  { id: "train", label: "Train AI", color: "bg-purple-600 border border-purple-400/30", icon: Sparkles },
  { id: "web", label: "Real time", color: "bg-cyan-600 border border-cyan-400/30", icon: Search },
  { id: "job", label: "Job Assistant", color: "bg-indigo-600", icon: Briefcase },
  { id: "youtube", label: "Summerize Video", color: "bg-red-700", icon: FileText },
  { id: "travel_node", label: "Travel AI", color: "bg-teal-600", icon: Box },
  { id: "sports", label: "Sports AI", color: "bg-yellow-600", icon: Trophy },
  { id: "weather_decision", label: "Weather AI", color: "bg-sky-600", icon: CloudRain },
  { id: "restaurant_node", label: "Restaurant AI", color: "bg-pink-600", icon: ChefHat },
  { id: "places_node", label: "Place AI", color: "bg-red-700", icon: Settings },
  { id: "news_node", label: "News AI", color: "bg-orange-600", icon: Newspaper },
  { id: "youtube_node", label: "Youtube Search AI", color: "bg-cyan-600 border border-cyan-400/30", icon: Video },
];

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/v1`;

// true on phones (viewport < 768px). Used so the touch-friendly connecting only affects mobile.
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return isMobile;
}

// true while the viewport matches the given media query
function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const update = () => setMatches(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [query]);
  return matches;
}

// --- CUSTOM NODE WITH EXECUTION STATES & ICON SUPPORT ---
const CustomNodeUI = ({ data, selected }) => {
  const isMobile = useIsMobile();
  // Handles are scaled by the canvas zoom, so on phones (zoomed out) they get tiny.
  // Divide by zoom so the dots always stay about 28px on screen.
  const zoom = useStore((s) => s.transform[2]);
  const hs = Math.min(Math.max(28 / zoom, 16), 44);
  const handleStyle = isMobile ? { width: hs, height: hs } : undefined;
  const isMaster = data.label.includes("Master");
  const isExecuting = data.status === "executing";

  // Resolve Icon Component safely
  const IconComponent = data.icon || (isMaster ? Zap : Cpu);

  return (
    <div className={`relative px-4 py-4 rounded-2xl border-2 transition-all duration-500 shadow-2xl 
      w-[240px] h-auto min-h-[90px] flex flex-col justify-center
      ${selected ? 'border-blue-500 ring-4 ring-blue-500/10' : 'border-slate-200'} 
      ${isExecuting ? 'border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.4)] scale-105' : ''}
      ${data.connectSource ? '!border-orange-400 ring-4 ring-orange-400/40' : ''}
      ${isMaster ? 'bg-slate-900 text-white' : 'bg-white text-slate-800'}`}>

      <Handle
        type="target"
        position={Position.Left}
        id="main-in"
        className={`!bg-blue-500 border-2 border-white ${isMobile ? '' : '!w-3 !h-3'}`}
        style={isMobile ? { ...handleStyle, left: -hs } : undefined}
      />

      <div className="flex items-start gap-3 w-full overflow-hidden">
        <div className={`p-2.5 rounded-xl shrink-0 ${isMaster ? 'bg-blue-600 shadow-lg' : 'bg-slate-100'}`}>
          {isExecuting ? (
            <Loader2 size={18} className="animate-spin text-yellow-500" />
          ) : (
            <IconComponent size={18} className={isMaster ? "text-white" : "text-slate-600"} />
          )}
        </div>

        <div className="flex flex-col min-w-0 flex-1 overflow-hidden">
          <p className="text-[9px] font-black uppercase tracking-widest opacity-40 mb-1 flex justify-between">
            {isMaster ? 'System Core' : 'Module'}
            {isExecuting && <span className="text-yellow-500 animate-pulse font-black">RUNNING...</span>}
          </p>
          <p className="text-[13px] font-bold leading-snug break-words whitespace-normal">
            {data.label}
          </p>
        </div>
      </div>

      {isMaster && (
        <div className="absolute -bottom-5 left-0 right-0 flex justify-between px-6 pointer-events-none">
          <Handle type="source" position={Position.Bottom} id="model" isConnectable={!isMobile} className="!bg-purple-500 !static !translate-x-0" />
          <Handle type="source" position={Position.Bottom} id="memory" isConnectable={!isMobile} className="!bg-emerald-500 !static !translate-x-0" />
          <Handle type="source" position={Position.Bottom} id="tool" isConnectable={!isMobile} className="!bg-orange-500 !static !translate-x-0" />
        </div>
      )}

      <Handle
        type="source"
        position={Position.Right}
        id="main-out"
        className={`!bg-blue-500 border-2 border-white ${isMobile ? '' : '!w-3 !h-3'}`}
        style={isMobile ? { ...handleStyle, right: -hs } : undefined}
      />
    </div>
  );
};

const nodeTypes = { default: CustomNodeUI };

export default function BuilderPage() {
  const [nodes, setNodes] = useState([
    {
      id: "master",
      type: "default",
      data: { label: "🤖 AI Agent (Master)", status: "idle", icon: Zap },
      position: { x: 450, y: 200 }
    }
  ]);
  const [edges, setEdges] = useState([]);
  const [workflowId, setWorkflowId] = useState(null);
  const [chatInput, setChatInput] = useState("");
  const [logs, setLogs] = useState([]);
  const [chatHistory, setChatHistory] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // node palette
  const [isChatOpen, setIsChatOpen] = useState(false);       // chat panel (bottom sheet below lg)
  const isMobile = useIsMobile();
  const [toast, setToast] = useState(null);       // in-app notification (replaces browser alert())
  const [deploying, setDeploying] = useState(false);
  const toastTimer = useRef(null);
  const isSheet = useMediaQuery("(max-width: 1023px)"); // chat is a bottom sheet below lg
  const [sheetVh, setSheetVh] = useState(52);            // bottom-sheet height in % of the screen (user can resize)
  const [connectMode, setConnectMode] = useState(false);   // mobile "tap two nodes to connect" mode
  const [connectSource, setConnectSource] = useState(null); // first node picked in connect mode

  // Palette starts open on tablets/desktops, closed on phones
  useEffect(() => {
    if (window.innerWidth >= 768) setIsSidebarOpen(true);
  }, []);

  const onNodesChange = useCallback((chs) => setNodes((nds) => applyNodeChanges(chs, nds)), []);
  const onEdgesChange = useCallback((chs) => setEdges((eds) => applyEdgeChanges(chs, eds)), []);

  const onConnect = useCallback((params) => {
    setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#cbd5e1', strokeWidth: 2 } }, eds));
  }, []);

  // ---------- IN-APP NOTIFICATIONS (instead of alert()) ----------
  const showToast = (type, text) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ id: Date.now(), type, text });
    toastTimer.current = setTimeout(() => setToast(null), 4000);
  };

  const handleDeploy = async () => {
    const token = localStorage.getItem("accessToken") || localStorage.getItem("accesstoken");
    setDeploying(true);
    try {
      const res = await axios.post(`${API_URL}/workflow`, { name: "Live_Flow", nodes, edges, isActive: true }, { headers: { Authorization: `Bearer ${token}` } });
      setWorkflowId(res.data._id);
      showToast("success", "System deployed! You can run your workflow now.");
      // on phones close the palette so the canvas and the message are visible
      if (window.innerWidth < 768) setIsSidebarOpen(false);
    } catch (err) {
      console.error("Deploy error:", err);
      showToast("error", err.response?.data?.message || "Deploy failed. Please check your connection and try again.");
    } finally {
      setDeploying(false);
    }
  };

  // ---------- MOBILE: RESIZE THE CHAT BOTTOM SHEET BY DRAGGING ITS TOP BAR ----------
  const MIN_SHEET_VH = 25;
  const onGripDown = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onGripMove = (e) => {
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
    const h = window.innerHeight;
    const maxVh = Math.min(92, ((h - 64) / h) * 100); // never go under the navbar
    const vh = ((h - e.clientY) / h) * 100;            // sheet top edge follows the finger
    setSheetVh(Math.max(MIN_SHEET_VH, Math.min(maxVh, vh)));
  };
  const onGripUp = (e) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
  };
  // double-tap the bar: toggle between small and large
  const onGripDoubleClick = () => setSheetVh((v) => (v < 70 ? 85 : 52));

  // ---------- MOBILE: TAP-TO-CONNECT MODE ----------
  // Dragging a line from a tiny dot with a finger is unreliable (the browser can treat it as a scroll/pan),
  // so on phones you can press "Connect", tap the FIRST node, then tap the SECOND node.
  const clearConnectSource = () => {
    setConnectSource(null);
    setNodes((nds) => nds.map((n) => (n.data.connectSource ? { ...n, data: { ...n.data, connectSource: false } } : n)));
  };

  const toggleConnectMode = () => {
    if (connectMode) clearConnectSource();
    setConnectMode((m) => !m);
  };

  const handleNodeClick = (_event, node) => {
    if (!connectMode) return;

    // 1st tap: choose the source node
    if (!connectSource) {
      setConnectSource(node.id);
      setNodes((nds) => nds.map((n) => (n.id === node.id ? { ...n, data: { ...n.data, connectSource: true } } : n)));
      return;
    }

    // tapping the same node again cancels
    if (connectSource === node.id) {
      clearConnectSource();
      return;
    }

    // 2nd tap: create the connection source -> this node
    setEdges((eds) =>
      addEdge(
        {
          source: connectSource,
          sourceHandle: "main-out",
          target: node.id,
          targetHandle: "main-in",
          animated: true,
          style: { stroke: '#cbd5e1', strokeWidth: 2 },
        },
        eds
      )
    );
    clearConnectSource();
  };

  // Pass configuration object to preserve icon component
  const addNode = (nodeConfig) => {
    const offset = (nodes.length % 6) * 40; // stop new nodes from stacking exactly on top of each other
    const newNode = {
      id: `node-${Date.now()}`,
      type: "default",
      position: { x: 100 + offset, y: 400 + offset },
      data: { label: nodeConfig.label, status: "idle", icon: nodeConfig.icon }
    };
    setNodes((nds) => [...nds, newNode]);
    // On phones close the drawer so the new node is visible on the canvas
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  const runWorkflow = async () => {
    const token = localStorage.getItem("accessToken") || localStorage.getItem("accesstoken");
    if (!workflowId) return showToast("error", "Deploy your workflow first (Deploy & Active).");

    // Below lg the chat is a bottom sheet: open it so the user sees the result
    if (window.innerWidth < 1024) setIsChatOpen(true);

    setLogs(p => [...p, `[INIT]: Kernel Start...`]);
    setChatHistory(p => [...p, { role: "user", text: chatInput }]);

    setNodes(nds => nds.map(n => n.id === "master" ? { ...n, data: { ...n.data, status: "executing" } } : n));

    try {
      const res = await axios.post(`${API_URL}/execution`, { workflowId, input: { query: chatInput } }, { headers: { Authorization: `Bearer ${token}` } });

      const route = res.data.output?.route || res.data.route;
      const aiResult = res.data.output?.result || res.data.output;

      const routeMap = {
        "is_coding_question": "Coding Assistant",
        "coding": "Coding Assistant",
        "doctor": "Medical AI",
        "farmer": "Agri Expert",
        "advice": "Legal Advice",
        "job": "Job Assistant",
        "realtime-search": "Real-Time Search",
        "general": "General AI",
        "youtube": "Summerize Video",
        "travel_node": "Travel AI",
        "sports": "Sports AI",
        "weather_decision": "Weather AI",
        "restaurant_node": "Restaurant AI",
        "places_node": "Place AI",
        "news_node": "News AI",
        "youtube_node": "Youtube Search AI"
      };
      const targetLabel = routeMap[route];

      setEdges(eds => eds.map(e => {
        const targetNode = nodes.find(n => n.id === e.target);
        if (targetNode?.data?.label === targetLabel) {
          return { ...e, animated: true, style: { stroke: '#2563eb', strokeWidth: 5, filter: 'drop-shadow(0 0 8px rgba(37,99,235,0.6))' } };
        }
        return { ...e, animated: false, style: { stroke: '#e2e8f0', strokeWidth: 1 } };
      }));

      setNodes(nds => nds.map(n => {
        if (n.data.label === targetLabel) return { ...n, data: { ...n.data, status: "executing" } };
        return { ...n, data: { ...n.data, status: "idle" } };
      }));

      setLogs(p => [...p, `[ROUTING]: ${route} -> Active Node: ${targetLabel}`]);
      setChatHistory(p => [...p, { role: "ai", text: aiResult }]);

      setTimeout(() => {
        setNodes(nds => nds.map(n => ({ ...n, data: { ...n.data, status: "idle" } })));
      }, 3000);

    } catch (e) {
      setLogs(p => [...p, `[CRITICAL]: Execution Error`]);
      showToast("error", e.response?.data?.message || "Execution failed. Please try again.");
      setNodes(nds => nds.map(n => ({ ...n, data: { ...n.data, status: "idle" } })));
    }
    setChatInput("");
  };

  return (
    // h-dvh = real visible height on mobile browsers (h-screen gets cut by the address bar)
    <div className="flex h-[calc(100dvh-3.5rem)] w-full bg-[#f8fafc] overflow-hidden relative">

      {/* Overlays (mobile only) */}
      {isSidebarOpen && (
        <div className="fixed inset-x-0 top-14 bottom-0 bg-black/50 z-30 md:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}
      {isChatOpen && (
        <div className="fixed inset-x-0 top-14 bottom-0 bg-black/50 z-30 lg:hidden" onClick={() => setIsChatOpen(false)} />
      )}

      {/* --- LEFT: NODE PALETTE (drawer on phones, collapsible column on md+) --- */}
      <aside
        className={`fixed top-14 bottom-0 left-0 z-40 w-72 max-w-[85vw] bg-white border-r flex flex-col shadow-2xl overflow-hidden
          transform transition-transform duration-300
          md:static md:max-w-none md:z-20 md:transition-all md:duration-500
          ${isSidebarOpen ? 'translate-x-0 md:w-72' : '-translate-x-full md:translate-x-0 md:w-0 md:border-r-0'}`}
      >
        <div className="p-4 sm:p-6 border-b border-slate-50 flex items-center justify-between bg-slate-900 text-white shrink-0">
          <h1 className="font-black text-xl italic flex items-center gap-2"><Activity size={20} className="text-blue-400" /> ENGINE</h1>
          <button onClick={() => setIsSidebarOpen(false)} className="p-1.5 rounded-lg hover:bg-white/10" aria-label="Close palette">
            <span className="md:hidden"><X size={18} /></span>
            <span className="hidden md:block"><Menu size={18} /></span>
          </button>
        </div>
        <div className="p-4 sm:p-6 space-y-3 flex-grow overflow-y-auto bg-slate-50/50 w-72 max-w-[85vw] md:max-w-none">
          {NODE_TYPES_CONFIG.map((node) => {
            const IconComp = node.icon;
            return (
              <button
                key={node.id}
                onClick={() => addNode(node)}
                className="w-full flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-2xl hover:border-blue-500 hover:shadow-lg transition-all active:scale-95 group text-left"
              >
                <div className={`p-2 rounded-lg ${node.color} text-white flex items-center justify-center shrink-0`}>
                  <IconComp size={16} />
                </div>
                <span className="text-xs font-black text-slate-700">{node.label}</span>
                <Plus size={14} className="ml-auto md:opacity-0 group-hover:opacity-100 text-blue-500" />
              </button>
            );
          })}
        </div>
        <div className="p-4 sm:p-6 border-t bg-white shrink-0 w-72 max-w-[85vw] md:max-w-none">
          <button onClick={handleDeploy} disabled={deploying} className="w-full bg-slate-900 text-white p-4 rounded-xl font-black text-xs disabled:opacity-70 disabled:cursor-not-allowed hover:bg-blue-600 transition-all shadow-xl flex items-center justify-center gap-2 uppercase tracking-widest">
            {deploying ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} {deploying ? "Deploying..." : "Deploy & Active"}
          </button>
        </div>
      </aside>

      {/* --- CENTER: CANVAS --- */}
      <main className="flex-grow min-w-0 relative bg-[#F1F5F9]">
        {!isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="absolute top-3 left-3 sm:top-6 sm:left-6 z-30 bg-white p-3 rounded-2xl shadow-xl border border-slate-200 hover:scale-110 transition-all"
            aria-label="Open node palette"
          >
            <Menu size={20} />
          </button>
        )}
        <ReactFlow nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect} nodeTypes={nodeTypes} onNodeClick={handleNodeClick} fitView connectionRadius={isMobile ? 70 : 20} connectOnClick connectionLineStyle={{ stroke: '#2563eb', strokeWidth: 3 }}>
          <Background variant="dots" gap={30} color="#cbd5e1" size={1} />
          <Controls className="!bg-white !shadow-2xl !border-none !rounded-2xl" />
          <Panel position="bottom-center" className="md:hidden !mb-3 pointer-events-none">
            <p className={`max-w-[60vw] text-center text-[9px] font-bold px-2.5 py-1 rounded-full border shadow backdrop-blur ${
              connectMode ? "bg-blue-600 text-white border-blue-500" : "bg-white/80 text-slate-500 border-slate-200"
            }`}>
              {!connectMode && "To connect nodes: press Connect"}
              {connectMode && !connectSource && "Tap the FIRST node"}
              {connectMode && connectSource && "Now tap the SECOND node"}
            </p>
          </Panel>
          <Panel position="top-right" className="!m-2 sm:!m-4">
            <div className="bg-white/80 backdrop-blur-md p-1.5 sm:p-2 rounded-2xl border border-white shadow-2xl flex items-center gap-1.5 sm:gap-2">
              <div className="hidden sm:flex items-center gap-2 px-4 border-r border-slate-200">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-[10px] font-black text-slate-500 uppercase whitespace-nowrap">System Ready</span>
              </div>
              <div className="sm:hidden flex items-center pl-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              </div>
              {/* Connect mode (phones only) */}
              <button
                onClick={toggleConnectMode}
                className={`md:hidden flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-black transition-all uppercase tracking-widest ${
                  connectMode ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                <Link2 size={13} /> <span>{connectMode ? "Done" : "Connect"}</span>
              </button>
              {/* Chat toggle (below lg the chat panel is a bottom sheet) */}
              <button
                onClick={() => setIsChatOpen(true)}
                className="lg:hidden flex items-center gap-1.5 px-3 py-2 bg-slate-100 text-slate-700 rounded-xl text-[10px] font-black hover:bg-slate-200 transition-all uppercase tracking-widest"
                aria-label="Open chat"
              >
                <MessageSquare size={13} /> <span className="hidden sm:inline">Chat</span>
              </button>
              <button onClick={runWorkflow} className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-6 py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black hover:bg-blue-600 transition-all uppercase tracking-widest">
                <Play size={12} fill="currentColor" /> Execute
              </button>
            </div>
          </Panel>
        </ReactFlow>
      </main>

      {/* --- RIGHT: LIVE EXECUTION (bottom sheet below lg, side panel on lg+) --- */}
      <section
        className={`fixed inset-x-0 bottom-0 z-40 h-[52dvh] rounded-t-2xl overflow-hidden bg-[#0f172a] flex flex-col shadow-2xl border-t border-slate-800
          transform transition-transform duration-300
          lg:static lg:h-auto lg:w-80 lg:shrink-0 lg:rounded-none lg:border-t-0 lg:border-l lg:z-20 lg:translate-y-0
          ${isChatOpen ? 'translate-y-0' : 'translate-y-full'}`}
        style={isSheet ? { height: `${sheetVh}dvh` } : undefined}
      >
        {/* Drag this bar up/down to make the box bigger or smaller (phones/tablets only) */}
        <div
          className="lg:hidden shrink-0 h-7 flex items-center justify-center cursor-row-resize select-none"
          style={{ touchAction: "none" }}
          onPointerDown={onGripDown}
          onPointerMove={onGripMove}
          onPointerUp={onGripUp}
          onPointerCancel={onGripUp}
          onDoubleClick={onGripDoubleClick}
          role="separator"
          aria-label="Drag to resize chat"
        >
          <span className="w-12 h-1.5 rounded-full bg-slate-600" />
        </div>
        <div className="p-3 lg:p-6 border-b border-slate-800 flex items-center justify-between gap-2 bg-slate-900/50 shrink-0">
          <div className="flex items-center gap-2">
            <Terminal size={18} className="text-blue-400" />
            <h2 className="font-black text-xs uppercase tracking-widest text-white">Live Execution</h2>
          </div>
          <button onClick={() => setIsChatOpen(false)} className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:bg-white/10" aria-label="Close chat">
            <X size={18} />
          </button>
        </div>
        <div className="flex-grow overflow-y-auto p-3 lg:p-6 space-y-3 lg:space-y-4">
          {chatHistory.length === 0 && (
            <p className="text-[11px] text-slate-500 text-center pt-6">Deploy your workflow, type a prompt and press Execute.</p>
          )}
          {chatHistory.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[90%] p-3 lg:p-4 rounded-2xl text-[12px] font-bold break-words whitespace-pre-wrap ${
                msg.role === "user" ? "bg-blue-600 text-white rounded-br-none shadow-lg shadow-blue-500/20" : "bg-slate-800 text-slate-200 rounded-bl-none border border-slate-700"
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
        </div>
        <div className="p-3 lg:p-6 bg-slate-900/80 border-t border-slate-800 shrink-0">
          <div className="flex items-center gap-2 bg-slate-800 p-2 rounded-2xl border border-slate-700 focus-within:border-blue-500 transition-all mb-2 lg:mb-4">
            {/* text-base on phones stops iOS from zooming in when the input is focused */}
            <input
              className="flex-grow min-w-0 bg-transparent border-none outline-none p-2 text-base sm:text-xs font-bold text-white"
              placeholder="Type prompt..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && runWorkflow()}
            />
            <button onClick={runWorkflow} className="bg-blue-600 text-white p-2.5 rounded-xl hover:scale-105 transition-all shrink-0" aria-label="Send">
              <Send size={16} />
            </button>
          </div>
          <div className="bg-black/40 rounded-xl p-2.5 lg:p-4 h-14 sm:h-20 lg:h-32 overflow-y-auto font-mono text-[9px] text-emerald-400 border border-slate-800">
            {logs.map((log, i) => (
              <div key={i} className="mb-1.5 opacity-80 leading-relaxed font-medium tracking-tight whitespace-pre-wrap flex gap-2">
                <span className="text-slate-600 shrink-0">{i + 1}</span>
                <span className="break-words min-w-0">{log}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Toast notification (success / error), shown just below the navbar */}
      {toast && (
        <div
          key={toast.id}
          role="status"
          aria-live="polite"
          className={`toast-in fixed top-16 left-1/2 -translate-x-1/2 z-[60] w-[92vw] max-w-sm flex items-start gap-2.5 px-4 py-3 rounded-2xl border shadow-2xl backdrop-blur text-sm font-bold ${
            toast.type === "success"
              ? "bg-emerald-50/95 border-emerald-200 text-emerald-800"
              : toast.type === "error"
              ? "bg-red-50/95 border-red-200 text-red-700"
              : "bg-white/95 border-slate-200 text-slate-700"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 size={18} className="shrink-0 mt-0.5 text-emerald-600" />
          ) : (
            <AlertCircle size={18} className="shrink-0 mt-0.5" />
          )}
          <span className="flex-1 min-w-0 break-words">{toast.text}</span>
          <button onClick={() => setToast(null)} aria-label="Dismiss" className="shrink-0 p-0.5 opacity-60 hover:opacity-100">
            <X size={16} />
          </button>
        </div>
      )}

      <style jsx global>{`
        @keyframes toast-in { from { opacity: 0; } to { opacity: 1; } }
        .toast-in { animation: toast-in 0.2s ease-out; }
        /* A finger drag that starts on a connection dot must not be taken over by the browser (scroll / pan) */
        .react-flow__handle { touch-action: none; }
      `}</style>
    </div>
  );
}