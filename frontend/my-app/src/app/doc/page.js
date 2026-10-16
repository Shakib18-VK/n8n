'use client'

import React, { useState, useMemo, useEffect } from 'react';
import {
  Zap,
  Search,
  Code2,
  Terminal,
  Cpu,
  Layers,
  Server,
  ShieldCheck,
  Copy,
  Check,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  BookOpen,
  Filter,
  Sparkles,
  AlertTriangle,
  Database,
  Workflow,
  RefreshCw,
  Clock,
  Key,
  Globe,
  Radio,
  FileCode,
  Sliders,
  CheckCircle2,
  HelpCircle,
  Hash,
  Brackets
} from 'lucide-react';

const EXPRESSION_ITEMS = [
  {
    id: 'exp-json-field',
    title: 'Access Current Node JSON Field',
    category: 'Basic Data',
    expression: '{{ $json.fieldName }}',
    description: 'Retrieves the value of fieldName from the input item passing through the current node.',
    exampleInput: '{ "user": { "name": "Alex", "id": 101 } }',
    exampleOutput: '{{ $json.user.name }} => "Alex"'
  },
  {
    id: 'exp-specific-node',
    title: 'Access Data from Specific Previous Node',
    category: 'Cross-Node Reference',
    expression: '{{ $("Node Name").item.json.fieldName }}',
    description: 'Accesses data from an upstream node by its exact name. Highly robust even when topology changes.',
    exampleInput: 'Node "Webhook": { "body": { "email": "alex@example.com" } }',
    exampleOutput: '{{ $("Webhook").item.json.body.email }} => "alex@example.com"'
  },
  {
    id: 'exp-first-all-items',
    title: 'Access First or All Items',
    category: 'Item References',
    expression: '{{ $input.first().json.id }}  // First item\n{{ $input.all() }}             // All items array',
    description: '$input.first() grabs the first incoming item regardless of execution iteration. $input.all() returns the full array of incoming items.',
    exampleInput: '[{ "id": 1 }, { "id": 2 }, { "id": 3 }]',
    exampleOutput: '{{ $input.first().json.id }} => 1'
  },
  {
    id: 'exp-ternary',
    title: 'Conditional Logic (Ternary Operator)',
    category: 'Logic & Formatting',
    expression: '{{ $json.status === "active" ? "User is Active" : "User Inactive" }}',
    description: 'Executes inline conditional logic inside expressions without needing a separate Switch node.',
    exampleInput: '{ "status": "active" }',
    exampleOutput: '"User is Active"'
  },
  {
    id: 'exp-date-now',
    title: 'Current Date & Time (Luxon / Day.js)',
    category: 'DateTime',
    expression: '{{ $now.format("YYYY-MM-DD HH:mm:ss") }}\n{{ $today.plus({ days: 7 }).toISODate() }}',
    description: 'n8n built-in Luxon DateTime helper ($now, $today). Allows easy formatting, adding, or subtracting time.',
    exampleInput: 'Current timestamp',
    exampleOutput: '"2026-03-31 14:30:00"'
  },
  {
    id: 'exp-env-var',
    title: 'Access Environment Variables',
    category: 'System & Metadata',
    expression: '{{ $env.CUSTOM_API_KEY }}',
    description: 'Reads environment variables defined on the n8n host server.',
    exampleInput: 'ENV CUSTOM_API_KEY=sk_test_998877',
    exampleOutput: '"sk_test_998877"'
  },
  {
    id: 'exp-exec-meta',
    title: 'Execution & Workflow Metadata',
    category: 'System & Metadata',
    expression: 'Workflow ID: {{ $workflow.id }}\nExecution ID: {{ $execution.id }}\nMode: {{ $execution.mode }}',
    description: 'Returns metadata regarding the running execution (useful for error triggers and auditing).',
    exampleInput: 'System Context',
    exampleOutput: 'Workflow ID: "wF892x0a", Execution ID: "9042"'
  }
];

const CODE_SNIPPETS = [
  {
    id: 'code-array-map',
    title: 'Iterate & Transform Items (Array.map)',
    category: 'Data Transformation',
    language: 'javascript',
    description: 'Standard pattern for processing all incoming n8n items and returning modified JSON structures.',
    code: `// Iterate over all input items
return $input.all().map(item => {
  const rawUser = item.json;
  
  return {
    json: {
      userId: rawUser.id,
      fullName: \`\${rawUser.firstName} \${rawUser.lastName}\`.trim(),
      emailNormalized: rawUser.email ? rawUser.email.toLowerCase() : null,
      processedAt: new Date().toISOString()
    }
  };
});`
  },
  {
    id: 'code-filter-array',
    title: 'Filter Items Based on Conditions',
    category: 'Filtering & Logic',
    language: 'javascript',
    description: 'Remove unwanted items before passing them to the next node.',
    code: `// Keep only active users with verified email
const filteredItems = $input.all().filter(item => {
  const user = item.json;
  return user.isActive === true && user.emailVerified === true;
});

// Always return an array of objects with a 'json' key
return filteredItems;`
  },
  {
    id: 'code-cross-node-lookup',
    title: 'Cross-Node Data Lookup & Join',
    category: 'Cross-Node Operations',
    language: 'javascript',
    description: 'Combine data from an earlier node (e.g. database query) with current input items.',
    code: `// Fetch all items from a previous node named "Fetch Users"
const usersNodeData = $("Fetch Users").all();

// Create a fast lookup map by User ID
const userMap = new Map();
usersNodeData.forEach(item => {
  userMap.set(item.json.id, item.json);
});

// Enrich current incoming orders with user details
return $input.all().map(orderItem => {
  const order = orderItem.json;
  const matchedUser = userMap.get(order.userId) || { name: 'Unknown' };

  return {
    json: {
      orderId: order.id,
      amount: order.total,
      customerName: matchedUser.name,
      customerEmail: matchedUser.email
    }
  };
});`
  },
  {
    id: 'code-error-handling',
    title: 'Robust Try/Catch & Error Flags',
    category: 'Error Handling',
    language: 'javascript',
    description: 'Safely parse complex payloads and tag items with error status without stopping the workflow.',
    code: `return $input.all().map(item => {
  try {
    const rawData = item.json.payload;
    const parsed = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;
    
    return {
      json: {
        success: true,
        data: parsed,
        error: null
      }
    };
  } catch (err) {
    // Return error information gracefully
    return {
      json: {
        success: false,
        data: null,
        error: err.message,
        rawPayload: item.json.payload
      }
    };
  }
});`
  },
  {
    id: 'code-binary-base64',
    title: 'Working with Binary & Base64 Data',
    category: 'Binary & Files',
    language: 'javascript',
    description: 'Read or generate binary files directly inside the Code node.',
    code: `// Access binary data property (e.g., 'data' or 'attachment')
const item = $input.first();

if (item.binary && item.binary.data) {
  const base64String = item.binary.data.data;
  const fileName = item.binary.data.fileName;
  const mimeType = item.binary.data.mimeType;

  // Convert Base64 back to Buffer for JS manipulation
  const fileBuffer = Buffer.from(base64String, 'base64');
  
  return [{
    json: {
      fileName,
      mimeType,
      fileSizeByte: fileBuffer.length,
      previewText: fileBuffer.toString('utf8').substring(0, 100)
    }
  }];
}

return [{ json: { error: 'No binary data found' } }];`
  },
  {
    id: 'code-datetime-luxon',
    title: 'Advanced Date Manipulation (Luxon)',
    category: 'Data Transformation',
    language: 'javascript',
    description: 'Use the DateTime object available inside JS code environment for timezones and calculations.',
    code: `// n8n exposes Luxon's DateTime object globally or via require
const { DateTime } = require('luxon');

const nowInTokyo = DateTime.now().setZone('Asia/Tokyo');
const nextWeek = nowInTokyo.plus({ days: 7 }).endOf('day');

return [{
  json: {
    tokyoTime: nowInTokyo.toFormat('yyyy-MM-dd HH:mm:ss ZZZZ'),
    deadlineISO: nextWeek.toISOString(),
    isWeekend: nowInTokyo.isWeekend
  }
}];`
  }
];

const CORE_NODES = [
  {
    id: 'node-webhook',
    name: 'Webhook Node',
    type: 'Trigger',
    icon: Globe,
    color: 'from-amber-500 to-orange-600',
    summary: 'Triggers a workflow when an external system sends an HTTP request (GET, POST, PUT, DELETE).',
    keyFeatures: [
      'Test vs Production URL: Test URL listens only when "Test step" is clicked. Production URL requires Workflow to be Active.',
      'Response Modes: "On Received" (instant 200 OK) vs "When Last Node Finishes" (custom response payload).',
      'Body Parsing: Automatically parses JSON, Form-Data, and Raw Text.'
    ],
    configSnippet: `// To return custom JSON response from Webhook:
// Set Response Mode -> "When Last Node Finishes"
// In final node, return object:
{
  "status": "success",
  "message": "Processed successfully"
}`
  },
  {
    id: 'node-http-request',
    name: 'HTTP Request Node',
    type: 'Action / Data Source',
    icon: Radio,
    color: 'from-blue-500 to-cyan-500',
    summary: 'Calls any REST / GraphQL API with full control over Headers, Query Params, Body, and Auth.',
    keyFeatures: [
      'Built-in Auth: OAuth2, Bearer Token, Basic Auth, API Key, Custom Headers.',
      'Pagination: Supports Cursor-based, Offset/Limit, and Next-Page Link header pagination automatically.',
      'Error Handling: Option to "Continue on Fail" or automatically retry on 429 / 5xx responses.'
    ],
    configSnippet: `// Handling Pagination in HTTP Request Node:
Pagination Mode: "Response Contains Next Page URL"
Next Page URL Expression: {{ $json.meta.next_cursor }}`
  },
  {
    id: 'node-edit-fields',
    name: 'Edit Fields (Set)',
    type: 'Data Transformation',
    icon: Sliders,
    color: 'from-purple-500 to-pink-500',
    summary: 'Creates, renames, deletes, or type-casts variables and properties passing through the workflow.',
    keyFeatures: [
      'Keep Only Set Fields: Option to strip all existing input fields and keep only newly defined ones.',
      'Type Casting: Cast strings to Numbers, Booleans, or JSON Objects explicitly.',
      'Expression evaluation enabled for dynamic value construction.'
    ],
    configSnippet: `Assignments:
- customer_id (Number): {{ Number($json.raw_id) }}
- is_vip (Boolean): {{ $json.spend > 1000 }}
- full_name (String): {{ $json.first_name + ' ' + $json.last_name }}`
  },
  {
    id: 'node-switch-if',
    name: 'Switch & If Nodes',
    type: 'Control Flow',
    icon: Workflow,
    color: 'from-emerald-500 to-teal-600',
    summary: 'Branch your workflow based on conditions. If offers 2 paths (True/False); Switch supports N paths or Routing rules.',
    keyFeatures: [
      'Switch Rules: Match by Rules, Value mapping, or String patterns.',
      'Data Types: String comparison, Numeric (> < =), Regex matching, Array inclusion.',
      'Fallback Path: Handles default cases when no conditions match.'
    ],
    configSnippet: `Switch Rule Example:
Mode: Rules
- Branch 1: {{ $json.event }} Equal "user.created"
- Branch 2: {{ $json.event }} Equal "user.deleted"
- Fallback: Output 3`
  },
  {
    id: 'node-loop-batches',
    name: 'Loop Over Items (Split in Batches)',
    type: 'Utility / Control',
    icon: RefreshCw,
    color: 'from-indigo-500 to-blue-600',
    summary: 'Processes large datasets in smaller controlled chunks to respect third-party API rate limits.',
    keyFeatures: [
      'Batch Size setting (e.g. process 10 items at a time).',
      'Loop connection: Re-connect the last node back to the Loop node to iterate through all batches.',
      'Done Output: Fires once all items across all batches have finished processing.'
    ],
    configSnippet: `Loop Configuration:
Batch Size: 50
// Loop Output 'loop' -> API Request Node -> Loop Node (Input)
// Loop Output 'done' -> Final Summary Email Node`
  },
  {
    id: 'node-merge',
    name: 'Merge Node',
    type: 'Data Utility',
    icon: Layers,
    color: 'from-rose-500 to-red-600',
    summary: 'Combines multiple incoming data branches into a unified stream.',
    keyFeatures: [
      'Modes: Append (concat lists), Choose Branch (wait for one), Merge By Key (SQL-like JOIN).',
      'Merge By Key: Perform Inner Join, Outer Join, or Left Join using unique matching properties (e.g., email or ID).'
    ],
    configSnippet: `Merge Mode: "Merge By Key"
Property Input 1: {{ $json.userId }}
Property Input 2: {{ $json.id }}
Output Type: "Enrich Input 1 with Input 2"`
  },
  {
    id: 'node-sub-workflow',
    name: 'Execute Workflow (Sub-Workflow)',
    type: 'Modularization',
    icon: Cpu,
    color: 'from-violet-500 to-purple-700',
    summary: 'Calls another n8n workflow as a sub-routine, passing inputs and receiving return results.',
    keyFeatures: [
      'Modular Architecture: Keep individual workflows clean and reusable.',
      'Execute Once vs For Each Item mode.',
      'Sub-workflow must start with an "Execute Workflow Trigger" node.'
    ],
    configSnippet: `Sub-Workflow Setup:
1. Target Workflow starts with "Execute Workflow Trigger"
2. Target Workflow ends with "Respond to Webhook" or returns last items
3. Master Workflow uses "Execute Workflow" node referencing Target ID`
  }
];

const PROD_GUIDES = [
  {
    id: 'prod-pruning',
    title: 'Execution Data Memory Management & Pruning',
    category: 'Performance',
    icon: Database,
    description: 'Without database pruning, n8n databases (PostgreSQL/SQLite) will quickly grow to tens of gigabytes, causing severe slowdowns.',
    configSnippet: `# docker-compose.env or environment variables

# Enable pruning old execution logs
EXECUTIONS_DATA_PRUNE=true

# Max age of stored execution data in hours (e.g. 168 hours = 7 days)
EXECUTIONS_DATA_MAX_AGE=168

# Maximum number of executions to keep in DB
EXECUTIONS_DATA_PRUNE_MAX_COUNT=50000

# Save execution data ONLY on errors to conserve DB disk I/O
EXECUTIONS_DATA_SAVE_ON_ERROR=all
EXECUTIONS_DATA_SAVE_ON_SUCCESS=none
EXECUTIONS_DATA_SAVE_MANUAL_EXECUTIONS=false`
  },
  {
    id: 'prod-docker-compose',
    title: 'Production Docker Compose Setup (PostgreSQL + NGINX)',
    category: 'Deployment',
    icon: Server,
    description: 'Standard enterprise deployment using Docker Compose with external PostgreSQL database.',
    configSnippet: `version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    restart: always
    environment:
      - POSTGRES_USER=n8n_user
      - POSTGRES_PASSWORD=SecurePassword123!
      - POSTGRES_DB=n8n_db
    volumes:
      - postgres_data:/var/lib/postgresql/data

  n8n:
    image: docker.n8n.io/n8nio/n8n:latest
    restart: always
    ports:
      - "5678:5678"
    environment:
      - N8N_HOST=n8n.yourdomain.com
      - N8N_PORT=5678
      - N8N_PROTOCOL=https
      - NODE_ENV=production
      - WEBHOOK_URL=https://n8n.yourdomain.com/
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_HOST=postgres
      - DB_POSTGRESDB_PORT=5432
      - DB_POSTGRESDB_DATABASE=n8n_db
      - DB_POSTGRESDB_USER=n8n_user
      - DB_POSTGRESDB_PASSWORD=SecurePassword123!
      - EXECUTIONS_DATA_PRUNE=true
      - EXECUTIONS_DATA_MAX_AGE=168
      - N8N_ENCRYPTION_KEY=your_secret_32_character_key_here!
    links:
      - postgres
    volumes:
      - n8n_data:/home/node/.n8n

volumes:
  postgres_data:
  n8n_data:`
  },
  {
    id: 'prod-security',
    title: 'Webhook Security & Secret Verification',
    category: 'Security',
    icon: ShieldCheck,
    description: 'Protect public Webhook endpoints from unauthorized access using HMAC verification or Header Secret Tokens.',
    configSnippet: `// JS Code Node following Webhook Node to verify HMAC signature
const crypto = require('crypto');

const secret = $env.WEBHOOK_SECRET;
const headers = $("Webhook").item.json.headers;
const rawBody = JSON.stringify($("Webhook").item.json.body);

// Signature sent by third-party service (e.g. GitHub, Stripe, Shopify)
const signature = headers['x-hub-signature-256'] || headers['x-signature'];

const expectedSignature = 'sha256=' + crypto
  .createHmac('sha256', secret)
  .update(rawBody)
  .digest('hex');

if (signature !== expectedSignature) {
  throw new Error('Unauthorized: Invalid HMAC Webhook Signature');
}

return $input.all();`
  },
  {
    id: 'prod-queue-mode',
    title: 'Queue Mode Architecture (Redis Scaling)',
    category: 'Scaling',
    icon: Zap,
    description: 'For high-throughput workloads (thousands of executions/min), scale n8n into a main instance + worker cluster backed by Redis.',
    configSnippet: `# Main Instance Environment
EXECUTIONS_MODE=queue
QUEUE_BULL_REDIS_HOST=redis
QUEUE_BULL_REDIS_PORT=6379

# Worker Instance Command
# Run container with command:
n8n worker

# Webhook Instance Command (Dedicated webhook handlers)
n8n webhook`
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('expressions'); // 'overview', 'expressions', 'code', 'nodes', 'prod'
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [expandedNodes, setExpandedNodes] = useState({});

  // Toast feedback timeout
  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2200);
  };

  const toggleNodeExpand = (nodeId) => {
    setExpandedNodes(prev => ({ ...prev, [nodeId]: !prev[nodeId] }));
  };

  const filteredExpressions = useMemo(() => {
    return EXPRESSION_ITEMS.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            item.expression.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [searchQuery, selectedCategory]);

  const filteredCodeSnippets = useMemo(() => {
    return CODE_SNIPPETS.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            item.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat = selectedCategory === 'All' || item.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [searchQuery, selectedCategory]);

  const filteredCoreNodes = useMemo(() => {
    return CORE_NODES.filter(node => {
      return node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
             node.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
             node.type.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [searchQuery]);

  const filteredProdGuides = useMemo(() => {
    return PROD_GUIDES.filter(guide => {
      return guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
             guide.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
             guide.category.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [searchQuery]);

  // Reset category filter on tab switch
  useEffect(() => {
    setSelectedCategory('All');
  }, [activeTab]);

  return (
    <div className="flex h-screen w-full bg-[#0B0F19] text-slate-100 font-sans overflow-hidden">
      
      {}
      <aside className="w-72 bg-[#111827] border-r border-slate-800 flex flex-col shrink-0 select-none">
        
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#FF6D5A] to-[#E04B38] flex items-center justify-center shadow-lg shadow-[#FF6D5A]/20">
              <Zap size={20} className="text-white fill-white" />
            </div>
            <div>
              <h1 className="font-bold text-base tracking-wide text-white flex items-center gap-1.5">
                n8n <span className="text-[#FF6D5A] font-extrabold">HUB</span>
              </h1>
              <p className="text-[10px] text-slate-400 font-mono tracking-wider">DOCS & REFERENCE</p>
            </div>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#FF6D5A]/10 text-[#FF6D5A] border border-[#FF6D5A]/30">
            v1.0
          </span>
        </div>

        {/* Navigation Menu */}
        <nav className="p-3 space-y-1.5 flex-grow overflow-y-auto">
          <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Documentation</p>

          <button
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all ${
              activeTab === 'overview'
                ? 'bg-[#FF6D5A]/15 text-[#FF6D5A] border border-[#FF6D5A]/30 font-semibold'
                : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
            }`}
          >
            <BookOpen size={16} /> Architecture & Data Model
          </button>

          <button
            onClick={() => setActiveTab('expressions')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all ${
              activeTab === 'expressions'
                ? 'bg-[#FF6D5A]/15 text-[#FF6D5A] border border-[#FF6D5A]/30 font-semibold'
                : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
            }`}
          >
            <Brackets size={16} /> Expressions Cheatsheet
          </button>

          <button
            onClick={() => setActiveTab('code')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all ${
              activeTab === 'code'
                ? 'bg-[#FF6D5A]/15 text-[#FF6D5A] border border-[#FF6D5A]/30 font-semibold'
                : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
            }`}
          >
            <Code2 size={16} /> Code Node Snippets (JS)
          </button>

          <button
            onClick={() => setActiveTab('nodes')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all ${
              activeTab === 'nodes'
                ? 'bg-[#FF6D5A]/15 text-[#FF6D5A] border border-[#FF6D5A]/30 font-semibold'
                : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
            }`}
          >
            <Cpu size={16} /> Top Core Nodes Guide
          </button>

          <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-6 mb-2">Production</p>

          <button
            onClick={() => setActiveTab('prod')}
            className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-xs transition-all ${
              activeTab === 'prod'
                ? 'bg-[#FF6D5A]/15 text-[#FF6D5A] border border-[#FF6D5A]/30 font-semibold'
                : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
            }`}
          >
            <Server size={16} /> Self-Hosting & Best Practices
          </button>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-[#0d1322]/50 text-xs">
          <div className="flex items-center gap-2 text-slate-400 mb-1">
            <CheckCircle2 size={14} className="text-emerald-500" />
            <span className="font-semibold text-slate-300">n8n Engine Compatible</span>
          </div>
          <p className="text-[11px] text-slate-500">Includes Luxon, Jexl, Buffer & Node.js features.</p>
        </div>
      </aside>

      {}
      <main className="flex-grow flex flex-col min-w-0 bg-[#0B0F19] overflow-hidden">
        
        {/* Top Bar with Search & Quick Filter */}
        <header className="h-16 border-b border-slate-800/80 bg-[#111827]/60 backdrop-blur-md px-6 flex items-center justify-between gap-4 shrink-0">
          
          {/* Live Search Bar */}
          <div className="relative flex-grow max-w-lg">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search expressions, JS methods, nodes, or configs..."
              className="w-full bg-[#0B0F19] border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#FF6D5A] transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-300"
              >
                Clear
              </button>
            )}
          </div>

          {/* Quick Header Badges */}
          <div className="flex items-center gap-3">
            <a
              href="https://docs.n8n.io"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-[#FF6D5A] bg-slate-800/60 hover:bg-slate-800 px-3 py-1.5 rounded-lg transition-all border border-slate-700/50"
            >
              <span>Official Docs</span>
              <ExternalLink size={12} />
            </a>
          </div>
        </header>

        {/* Scrollable Content Body */}
        <div className="flex-grow overflow-y-auto p-6 md:p-8 space-y-8 custom-scrollbar">

          {}
          {activeTab === 'overview' && (
            <div className="space-y-8 max-w-5xl">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Workflow className="text-[#FF6D5A]" size={24} /> n8n Architecture & Core Data Model
                </h2>
                <p className="text-slate-400 text-xs mt-1">
                  Understanding how data flows between nodes is fundamental to building reliable n8n automations.
                </p>
              </div>

              {/* Data Structure Card */}
              <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
                <h3 className="text-sm font-bold text-[#FF6D5A] uppercase tracking-wider flex items-center gap-2">
                  <Database size={16} /> The Array-Of-Objects Rule (n8n JSON Contract)
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  In n8n, <strong>every node receives and outputs an array of items</strong>. Each item must be a JSON object containing a top-level <code className="text-cyan-400 font-mono bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">json</code> key (and optionally a <code className="text-emerald-400 font-mono bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">binary</code> key).
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="bg-[#0B0F19] p-4 rounded-xl border border-slate-800">
                    <p className="text-xs font-mono text-emerald-400 mb-2">// Valid n8n Internal Data Output</p>
                    <pre className="text-[11px] font-mono text-slate-300 leading-relaxed overflow-x-auto">
{`[
  {
    "json": {
      "id": 101,
      "email": "user@example.com",
      "status": "ACTIVE"
    }
  },
  {
    "json": {
      "id": 102,
      "email": "alex@domain.com",
      "status": "PENDING"
    }
  }
]`}
                    </pre>
                  </div>

                  <div className="bg-[#0B0F19] p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
                    <div>
                      <p className="text-xs font-mono text-[#FF6D5A] mb-2">// Key Concept: Item Iteration</p>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        When an n8n Action node (e.g. Slack, Send Email) receives an array of 5 items, <strong>it automatically executes 5 times</strong> (once for each item) unless configured otherwise.
                      </p>
                    </div>
                    <div className="mt-4 p-3 bg-slate-900/80 rounded-lg border border-slate-800">
                      <p className="text-[11px] text-amber-400 font-semibold flex items-center gap-1.5">
                        <AlertTriangle size={14} /> Common Pitfall
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Returning a raw array like <code className="text-slate-200">[&#123; id: 1 &#125;]</code> inside a Code node without wrapping it in <code className="text-slate-200">&#123; json: ... &#125;</code> will cause execution failure.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Node Types Architecture */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/30 flex items-center justify-center">
                    <Radio size={20} />
                  </div>
                  <h4 className="text-sm font-bold text-slate-100">1. Trigger Nodes</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Kick off workflow executions. Can be event-driven (Webhooks, Email Received, Polling) or time-driven (Cron Schedule, Interval).
                  </p>
                </div>

                <div className="bg-[#111827] border border-slate-800 rounded-2xl p-6 space-y-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-500 border border-cyan-500/30 flex items-center justify-center">
                    <Cpu size={20} />
                  </div>
                  <h4 className="text-sm font-bold text-slate-100">2. Action & Utility Nodes</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Process, enrich, format, route, or push data to external integrations (Databases, APIs, AI Models, Spreadsheets).
                  </p>
                </div>
              </div>
            </div>
          )}

          {}
          {activeTab === 'expressions' && (
            <div className="space-y-6 max-w-5xl">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Brackets className="text-cyan-400" size={24} /> n8n Expression Syntax Reference
                </h2>
                <p className="text-slate-400 text-xs mt-1">
                  Use double curly braces <code className="text-cyan-400 font-mono">&#123;&#123; $json.property &#125;&#125;</code> inside any node parameter field to evaluate dynamic data.
                </p>
              </div>

              {/* Filter Tabs for Expressions */}
              <div className="flex flex-wrap items-center gap-2 pb-2">
                {['All', 'Basic Data', 'Cross-Node Reference', 'Item References', 'Logic & Formatting', 'DateTime', 'System & Metadata'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      selectedCategory === cat
                        ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 font-semibold'
                        : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Expression Cards List */}
              <div className="space-y-4">
                {filteredExpressions.map(item => (
                  <div key={item.id} className="bg-[#111827] border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all shadow-lg space-y-3">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                          {item.category}
                        </span>
                        <h3 className="text-sm font-bold text-slate-100">{item.title}</h3>
                      </div>
                      
                      <button
                        onClick={() => handleCopy(item.expression, item.id)}
                        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all border border-slate-700/50 shrink-0"
                      >
                        {copiedId === item.id ? (
                          <>
                            <Check size={14} className="text-emerald-400" />
                            <span className="text-emerald-400">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy size={14} />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>

                    <p className="text-xs text-slate-400 leading-relaxed">{item.description}</p>

                    {/* Code Display */}
                    <div className="bg-[#0B0F19] rounded-xl p-3 border border-slate-800 font-mono text-xs text-cyan-300 overflow-x-auto">
                      <pre>{item.expression}</pre>
                    </div>

                    {/* Example Box */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                      <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
                        <span className="text-slate-500 block font-mono text-[10px] uppercase">Input Data Context:</span>
                        <span className="text-slate-300 font-mono">{item.exampleInput}</span>
                      </div>
                      <div className="bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
                        <span className="text-slate-500 block font-mono text-[10px] uppercase">Evaluated Result:</span>
                        <span className="text-emerald-400 font-mono">{item.exampleOutput}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {}
          {activeTab === 'code' && (
            <div className="space-y-6 max-w-5xl">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Code2 className="text-[#FF6D5A]" size={24} /> Code Node Snippets (JavaScript)
                </h2>
                <p className="text-slate-400 text-xs mt-1">
                  The Code Node allows raw JavaScript execution. Return arrays of items using standard <code className="text-[#FF6D5A] font-mono">$input.all()</code> and helper methods.
                </p>
              </div>

              {/* Code Snippets List */}
              <div className="space-y-6">
                {filteredCodeSnippets.map(snippet => (
                  <div key={snippet.id} className="bg-[#111827] border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-all shadow-xl space-y-4">
                    <div className="flex items-center justify-between gap-4 border-b border-slate-800/80 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#FF6D5A]/10 text-[#FF6D5A] border border-[#FF6D5A]/20">
                            {snippet.category}
                          </span>
                          <h3 className="text-sm font-bold text-slate-100">{snippet.title}</h3>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{snippet.description}</p>
                      </div>

                      <button
                        onClick={() => handleCopy(snippet.code, snippet.id)}
                        className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl bg-[#FF6D5A] hover:bg-[#FF6D5A]/90 text-white transition-all shadow-lg shadow-[#FF6D5A]/20 shrink-0"
                      >
                        {copiedId === snippet.id ? (
                          <>
                            <Check size={14} />
                            <span>Copied Code!</span>
                          </>
                        ) : (
                          <>
                            <Copy size={14} />
                            <span>Copy JS Code</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Syntax Highlighted Code Box */}
                    <div className="bg-[#0B0F19] rounded-xl p-4 border border-slate-800/90 font-mono text-xs text-slate-200 overflow-x-auto leading-relaxed">
                      <pre className="text-cyan-300">{snippet.code}</pre>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {}
          {activeTab === 'nodes' && (
            <div className="space-y-6 max-w-5xl">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Cpu className="text-purple-400" size={24} /> Top Must-Know Core Nodes
                </h2>
                <p className="text-slate-400 text-xs mt-1">
                  In-depth reference for n8n's foundational workflow control nodes.
                </p>
              </div>

              {/* Accordion Node Cards */}
              <div className="space-y-4">
                {filteredCoreNodes.map(node => {
                  const NodeIcon = node.icon;
                  const isExpanded = expandedNodes[node.id] ?? true;

                  return (
                    <div key={node.id} className="bg-[#111827] border border-slate-800 rounded-2xl overflow-hidden shadow-xl transition-all">
                      
                      {/* Node Header */}
                      <div
                        onClick={() => toggleNodeExpand(node.id)}
                        className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-800/40 transition-all select-none"
                      >
                        <div className="flex items-center gap-3.5">
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${node.color} flex items-center justify-center text-white shadow-md`}>
                            <NodeIcon size={20} />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-slate-100">{node.name}</h3>
                            <p className="text-xs text-slate-400 mt-0.5">{node.summary}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-mono font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                            {node.type}
                          </span>
                          {isExpanded ? <ChevronDown size={18} className="text-slate-400" /> : <ChevronRight size={18} className="text-slate-400" />}
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {isExpanded && (
                        <div className="p-5 pt-0 border-t border-slate-800/60 bg-[#0d1322]/40 space-y-4">
                          <div>
                            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 pt-3">Key Features & Patterns</h4>
                            <ul className="space-y-1.5">
                              {node.keyFeatures.map((feat, idx) => (
                                <li key={idx} className="text-xs text-slate-400 flex items-start gap-2">
                                  <span className="text-purple-400 mt-1">•</span>
                                  <span>{feat}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <h4 className="text-[11px] font-mono text-purple-400 font-semibold">Configuration Example</h4>
                              <button
                                onClick={() => handleCopy(node.configSnippet, node.id)}
                                className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1"
                              >
                                {copiedId === node.id ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                                <span>Copy Config</span>
                              </button>
                            </div>
                            <pre className="bg-[#0B0F19] p-3 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto">
                              {node.configSnippet}
                            </pre>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {}
          {activeTab === 'prod' && (
            <div className="space-y-6 max-w-5xl">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Server className="text-emerald-400" size={24} /> Self-Hosting & Production Best Practices
                </h2>
                <p className="text-slate-400 text-xs mt-1">
                  Ensure 99.9% uptime, avoid database ballooning, and harden webhook security for mission-critical workflows.
                </p>
              </div>

              <div className="space-y-6">
                {filteredProdGuides.map(guide => {
                  const GuideIcon = guide.icon;
                  return (
                    <div key={guide.id} className="bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                      <div className="flex items-center justify-between gap-4 border-b border-slate-800/80 pb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <GuideIcon size={20} />
                          </div>
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              {guide.category}
                            </span>
                            <h3 className="text-sm font-bold text-slate-100 mt-1">{guide.title}</h3>
                          </div>
                        </div>

                        <button
                          onClick={() => handleCopy(guide.configSnippet, guide.id)}
                          className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all border border-slate-700/60 shrink-0"
                        >
                          {copiedId === guide.id ? (
                            <>
                              <Check size={14} className="text-emerald-400" />
                              <span className="text-emerald-400">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy size={14} />
                              <span>Copy Config</span>
                            </>
                          )}
                        </button>
                      </div>

                      <p className="text-xs text-slate-400 leading-relaxed">{guide.description}</p>

                      <pre className="bg-[#0B0F19] p-4 rounded-xl border border-slate-800 font-mono text-xs text-emerald-300 overflow-x-auto leading-relaxed">
                        {guide.configSnippet}
                      </pre>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}