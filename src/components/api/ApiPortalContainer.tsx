import React, { useState, useEffect, useMemo } from 'react';
import { 
  Key, 
  Terminal, 
  Copy, 
  Check, 
  Trash2, 
  AlertTriangle, 
  ShieldCheck, 
  Play, 
  ExternalLink, 
  Code2, 
  Cpu, 
  RefreshCw,
  Plus,
  Eye,
  EyeOff,
  BookOpen,
  Library,
  ArrowRight
} from 'lucide-react';
import type { AxiometicApiKey, ApiEndpointSpec } from './types';
import { auth } from '../../firebase';
import { motion, AnimatePresence } from 'framer-motion';

interface ApiPortalContainerProps {
  onOpenCanvas?: () => void;
  onOpenWri?: () => void;
  onOpenSocio?: () => void;
}

const ENDPOINTS: ApiEndpointSpec[] = [
  {
    id: 'status',
    method: 'GET',
    path: '/api/v1/status',
    title: 'System Health & Key Validation',
    description: 'Verify your API key status, permissions, and network node connectivity.'
  },
  {
    id: 'get-canvas',
    method: 'GET',
    path: '/api/v1/canvas',
    title: 'Retrieve Living Canvas Artifacts',
    description: 'Query all live published blocks, text manuscripts, and buttons currently on the canvas.'
  },
  {
    id: 'publish-canvas',
    method: 'POST',
    path: '/api/v1/canvas',
    title: 'Publish Block to Canvas',
    description: 'Programmatically inject a new block into the AXIOMETIC Living Canvas in real time.',
    sampleBody: {
      title: 'Dispatched from External Custom App',
      type: 'text',
      content: 'This block was deployed via the AXIOMETIC REST API using a custom API key.',
      buttonLabel: 'Learn More',
      buttonAction: 'link',
      buttonTargetUrl: 'https://axiometic.ai'
    }
  },
  {
    id: 'get-books',
    method: 'GET',
    path: '/api/v1/wri/books',
    title: 'Query WRI Library Manuscripts',
    description: 'Retrieve published 3D books, chapters, and cover designs from the scriptorium.'
  },
  {
    id: 'get-socio',
    method: 'GET',
    path: '/api/v1/socio/posts',
    title: 'Query Socio/X Dispatches',
    description: 'Read authentic public dispatches and book recommendations from Socio/X.'
  }
];

export const ApiPortalContainer: React.FC<ApiPortalContainerProps> = ({
  onOpenCanvas,
  onOpenWri,
  onOpenSocio
}) => {
  const user = auth.currentUser;
  const userEmail = user?.email || 'mugmaums@gmail.com';
  const rawHandle = userEmail.split('@')[0].toLowerCase().replace(/[^a-z0-9_.-]/g, '');
  const axiometicId = `${rawHandle || 'user'}@axiometic`;

  const [keys, setKeys] = useState<AxiometicApiKey[]>([]);
  const [loadingKeys, setLoadingKeys] = useState(true);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyEnv, setNewKeyEnv] = useState<'live' | 'test'>('live');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);
  const [revealedKeyIds, setRevealedKeyIds] = useState<Record<string, boolean>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Playground & Snippet States
  const [selectedLang, setSelectedLang] = useState<'curl' | 'typescript' | 'python'>('curl');
  const [selectedEndpointId, setSelectedEndpointId] = useState<string>('status');
  const [customRequestBody, setCustomRequestBody] = useState<string>('');
  const [selectedKeyForTest, setSelectedKeyForTest] = useState<string>('');
  const [testResponse, setTestResponse] = useState<any | null>(null);
  const [testResponseStatus, setTestResponseStatus] = useState<number | null>(null);
  const [testLatency, setTestLatency] = useState<number | null>(null);
  const [isSendingTest, setIsSendingTest] = useState(false);

  // Fetch keys from server or local storage
  const fetchKeys = async () => {
    setLoadingKeys(true);
    try {
      const res = await fetch('/api/v1/keys');
      const json = await res.json();
      if (json.success && Array.isArray(json.keys)) {
        setKeys(json.keys);
        localStorage.setItem('axiometic_api_keys', JSON.stringify(json.keys));
        if (json.keys.length > 0 && !selectedKeyForTest) {
          const activeKey = json.keys.find((k: AxiometicApiKey) => k.status === 'active');
          if (activeKey) setSelectedKeyForTest(activeKey.key);
        }
      }
    } catch {
      // Fallback to local storage
      const stored = localStorage.getItem('axiometic_api_keys');
      if (stored) {
        const parsed = JSON.parse(stored);
        setKeys(parsed);
        if (parsed.length > 0 && !selectedKeyForTest) {
          setSelectedKeyForTest(parsed[0].key);
        }
      }
    } finally {
      setLoadingKeys(false);
    }
  };

  useEffect(() => {
    fetchKeys();
  }, []);

  const selectedEndpoint = useMemo(() => {
    return ENDPOINTS.find(e => e.id === selectedEndpointId) || ENDPOINTS[0];
  }, [selectedEndpointId]);

  useEffect(() => {
    if (selectedEndpoint.sampleBody) {
      setCustomRequestBody(JSON.stringify(selectedEndpoint.sampleBody, null, 2));
    } else {
      setCustomRequestBody('');
    }
  }, [selectedEndpoint]);

  const activeKeyForSnippets = useMemo(() => {
    if (selectedKeyForTest) return selectedKeyForTest;
    const active = keys.find(k => k.status === 'active');
    return active ? active.key : 'axio_live_your_api_key_here';
  }, [selectedKeyForTest, keys]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim() || isGenerating) return;

    setIsGenerating(true);
    try {
      const res = await fetch('/api/v1/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newKeyName.trim(),
          environment: newKeyEnv,
          authorAxiometicId: axiometicId
        })
      });

      const json = await res.json();
      if (json.success && json.key) {
        setKeys(prev => [json.key, ...prev]);
        setSelectedKeyForTest(json.key.key);
        setNewKeyName('');
        showToast(`API Key "${json.key.name}" generated successfully!`);
      }
    } catch {
      // Offline fallback generation
      const prefix = `axio_${newKeyEnv}_`;
      const randomHex = Array.from(crypto.getRandomValues(new Uint8Array(16)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      const fullKey = `${prefix}${randomHex}`;
      const localKey: AxiometicApiKey = {
        id: `key_${Date.now()}`,
        name: newKeyName.trim(),
        key: fullKey,
        prefix,
        environment: newKeyEnv,
        scopes: ['full_access'],
        createdAt: new Date().toISOString(),
        status: 'active',
        authorAxiometicId: axiometicId
      };
      const updated = [localKey, ...keys];
      setKeys(updated);
      setSelectedKeyForTest(fullKey);
      localStorage.setItem('axiometic_api_keys', JSON.stringify(updated));
      setNewKeyName('');
      showToast(`API Key "${localKey.name}" generated locally!`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKeyId(id);
    showToast('Copied to clipboard');
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  const handleToggleReveal = (id: string) => {
    setRevealedKeyIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleRevokeKey = async (id: string) => {
    if (!confirm('Are you sure you want to revoke this API key? Custom applications using this key will immediately lose access.')) return;

    try {
      await fetch(`/api/v1/keys/${id}/revoke`, { method: 'PATCH' });
    } catch {}

    setKeys(prev => {
      const updated = prev.map(k => k.id === id ? { ...k, status: 'revoked' as const } : k);
      localStorage.setItem('axiometic_api_keys', JSON.stringify(updated));
      return updated;
    });

    showToast('API Key revoked.');
  };

  const handleDeleteKey = async (id: string) => {
    if (!confirm('Permanently delete this key record?')) return;

    try {
      await fetch(`/api/v1/keys/${id}`, { method: 'DELETE' });
    } catch {}

    setKeys(prev => {
      const updated = prev.filter(k => k.id !== id);
      localStorage.setItem('axiometic_api_keys', JSON.stringify(updated));
      return updated;
    });

    showToast('API Key record deleted.');
  };

  const handleExecuteTest = async () => {
    setIsSendingTest(true);
    setTestResponse(null);
    setTestResponseStatus(null);
    setTestLatency(null);

    const startTime = performance.now();
    try {
      const headers: Record<string, string> = {
        'Authorization': `Bearer ${activeKeyForSnippets}`
      };
      if (selectedEndpoint.method === 'POST') {
        headers['Content-Type'] = 'application/json';
      }

      const res = await fetch(selectedEndpoint.path, {
        method: selectedEndpoint.method,
        headers,
        body: selectedEndpoint.method === 'POST' ? customRequestBody : undefined
      });

      const elapsed = Math.round(performance.now() - startTime);
      setTestLatency(elapsed);
      setTestResponseStatus(res.status);

      const json = await res.json();
      setTestResponse(json);
    } catch (err: any) {
      const elapsed = Math.round(performance.now() - startTime);
      setTestLatency(elapsed);
      setTestResponseStatus(500);
      setTestResponse({ error: err.message || 'Network error executing request' });
    } finally {
      setIsSendingTest(false);
    }
  };

  // Generate dynamic code snippet
  const generatedCode = useMemo(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://axiometic.ai';
    const targetUrl = `${origin}${selectedEndpoint.path}`;

    if (selectedLang === 'curl') {
      if (selectedEndpoint.method === 'POST') {
        return `curl -X POST "${targetUrl}" \\
  -H "Authorization: Bearer ${activeKeyForSnippets}" \\
  -H "Content-Type: application/json" \\
  -d '${customRequestBody.replace(/\n/g, '').replace(/\s+/g, ' ')}'`;
      }
      return `curl -X GET "${targetUrl}" \\
  -H "Authorization: Bearer ${activeKeyForSnippets}"`;
    }

    if (selectedLang === 'typescript') {
      if (selectedEndpoint.method === 'POST') {
        return `// AXIOMETIC SDK / REST Client Integration
async function publishToAxiometicCanvas() {
  const response = await fetch('${targetUrl}', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ${activeKeyForSnippets}',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(${customRequestBody})
  });

  const data = await response.json();
  console.log('AXIOMETIC Response:', data);
  return data;
}

publishToAxiometicCanvas();`;
      }

      return `// AXIOMETIC SDK / REST Client Integration
async function queryAxiometic() {
  const response = await fetch('${targetUrl}', {
    method: 'GET',
    headers: {
      'Authorization': 'Bearer ${activeKeyForSnippets}',
      'Accept': 'application/json'
    }
  });

  const data = await response.json();
  console.log('AXIOMETIC Payload:', data);
  return data;
}

queryAxiometic();`;
    }

    if (selectedLang === 'python') {
      if (selectedEndpoint.method === 'POST') {
        return `import requests

url = "${targetUrl}"
headers = {
    "Authorization": "Bearer ${activeKeyForSnippets}",
    "Content-Type": "application/json"
}
payload = ${customRequestBody ? customRequestBody.replace(/"/g, "'") : "{}"}

response = requests.post(url, headers=headers, json=payload)
print("Status Code:", response.status_code)
print("Response JSON:", response.json())`;
      }

      return `import requests

url = "${targetUrl}"
headers = {
    "Authorization": "Bearer ${activeKeyForSnippets}"
}

response = requests.get(url, headers=headers)
print("Status Code:", response.status_code)
print("Response JSON:", response.json())`;
    }

    return '';
  }, [selectedLang, selectedEndpoint, activeKeyForSnippets, customRequestBody]);

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-mahogany-950 font-serif text-ivory">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-gold-accent text-mahogany-950 font-mono text-xs font-black px-6 py-2.5 rounded-full shadow-2xl flex items-center gap-2 border border-mahogany-900"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-950" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Banner & Header */}
      <div className="border-b border-gold-accent/25 bg-mahogany-900/90 backdrop-blur-md px-6 py-6 shadow-xl relative overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gold-accent via-amber-600 to-mahogany-900 p-0.5 shadow-xl flex items-center justify-center">
              <div className="w-full h-full bg-mahogany-950 rounded-2xl flex items-center justify-center">
                <Terminal className="w-7 h-7 text-gold-accent" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-black text-gold-accent uppercase tracking-tight">
                  AXIOMETIC API PORTAL
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-mono border border-emerald-500/30">
                  REST v1 ONLINE
                </span>
              </div>
              <p className="text-xs sm:text-sm text-ivory/70 font-serif italic mt-0.5">
                Generate production API keys and integrate AXIOMETIC Living Canvas, WRI manuscripts, and dispatches into your custom projects.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenCanvas && (
              <button
                onClick={onOpenCanvas}
                className="px-3.5 py-2 rounded-xl bg-mahogany-950/80 hover:bg-gold-accent/10 border border-gold-accent/30 text-xs text-gold-accent font-serif flex items-center gap-2 transition-colors cursor-pointer"
              >
                <Library className="w-4 h-4" />
                <span>Living Canvas</span>
              </button>
            )}
            {onOpenWri && (
              <button
                onClick={onOpenWri}
                className="px-3.5 py-2 rounded-xl bg-mahogany-950/80 hover:bg-gold-accent/10 border border-gold-accent/30 text-xs text-gold-accent font-serif flex items-center gap-2 transition-colors cursor-pointer"
              >
                <BookOpen className="w-4 h-4" />
                <span>WRI Studio</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Body */}
      <div className="max-w-7xl mx-auto px-4 py-8 w-full space-y-8 flex-1">
        {/* Top Grid: Key Generator + Security Info */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Key Generator Form */}
          <div className="lg:col-span-5 bg-mahogany-900/95 border border-gold-accent/30 rounded-2xl p-6 shadow-2xl brass-border flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-gold-accent/20 mb-4">
                <div className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-gold-accent" />
                  <h2 className="text-base font-bold text-gold-accent font-serif">Create AXIOMETIC API Key</h2>
                </div>
                <span className="text-[10px] font-mono text-gold-accent/60">Full Access</span>
              </div>

              <form onSubmit={handleCreateKey} className="space-y-4">
                <div>
                  <label className="text-xs font-mono text-gold-accent/80 block mb-1.5 font-bold uppercase tracking-wider">
                    Project / Application Name
                  </label>
                  <input
                    type="text"
                    required
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="e.g. Personal Portfolio, Mobile Client, Research Agent"
                    className="w-full bg-mahogany-950 border border-gold-accent/25 rounded-xl px-4 py-2.5 text-xs text-ivory placeholder-ivory/30 focus:outline-none focus:border-gold-accent font-serif transition-colors"
                  />
                </div>

                <div>
                  <label className="text-xs font-mono text-gold-accent/80 block mb-1.5 font-bold uppercase tracking-wider">
                    Environment Tier
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setNewKeyEnv('live')}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        newKeyEnv === 'live'
                          ? 'bg-gold-accent text-mahogany-950 border-gold-accent font-bold shadow-md'
                          : 'bg-mahogany-950 border-gold-accent/20 text-ivory/70 hover:border-gold-accent/50'
                      }`}
                    >
                      <span className="text-xs block font-mono font-black uppercase">Live Production</span>
                      <span className="text-[10px] opacity-80 font-serif">Prefix: axio_live_</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setNewKeyEnv('test')}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        newKeyEnv === 'test'
                          ? 'bg-gold-accent text-mahogany-950 border-gold-accent font-bold shadow-md'
                          : 'bg-mahogany-950 border-gold-accent/20 text-ivory/70 hover:border-gold-accent/50'
                      }`}
                    >
                      <span className="text-xs block font-mono font-black uppercase">Test Sandbox</span>
                      <span className="text-[10px] opacity-80 font-serif">Prefix: axio_test_</span>
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-mahogany-950 border border-gold-accent/20 space-y-1">
                  <span className="text-[10px] font-mono font-bold text-gold-accent uppercase tracking-wider block">
                    Granted Permissions
                  </span>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {['Canvas:Read', 'Canvas:Write', 'WRI:Read', 'Socio:Read', 'Vaelourix:Access'].map(scope => (
                      <span key={scope} className="text-[9px] px-2 py-0.5 rounded bg-mahogany-900 border border-gold-accent/30 text-ivory/80 font-mono">
                        {scope}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={!newKeyName.trim() || isGenerating}
                  className="w-full py-3 bg-gold-accent hover:bg-gold-accent/90 disabled:opacity-30 disabled:cursor-not-allowed text-mahogany-950 font-black rounded-xl text-xs uppercase tracking-widest shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>{isGenerating ? 'Generating Key...' : 'Generate AXIOMETIC Key'}</span>
                </button>
              </form>
            </div>

            <div className="pt-4 border-t border-gold-accent/15 mt-4 text-[11px] text-ivory/50 font-serif italic">
              Keys are cryptographically bound to your authenticated ID: <span className="text-gold-accent font-mono">{axiometicId}</span>
            </div>
          </div>

          {/* Active Keys Vault */}
          <div className="lg:col-span-7 bg-mahogany-900/95 border border-gold-accent/30 rounded-2xl p-6 shadow-2xl brass-border flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-gold-accent/20 mb-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <h2 className="text-base font-bold text-gold-accent font-serif">Active Key Vault</h2>
                </div>
                <span className="text-xs font-mono text-ivory/60">{keys.length} Keys Configured</span>
              </div>

              {loadingKeys ? (
                <div className="py-12 text-center text-ivory/40 font-serif italic">Loading vault...</div>
              ) : keys.length === 0 ? (
                <div className="py-12 text-center text-ivory/40 font-serif italic space-y-2">
                  <Key className="w-8 h-8 text-gold-accent/30 mx-auto" />
                  <p>No custom API keys registered yet. Generate your first key on the left to start integrating.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                  {keys.map((k) => {
                    const isRevealed = revealedKeyIds[k.id] || false;
                    const maskedKey = isRevealed 
                      ? k.key 
                      : `${k.key.slice(0, 14)}${'•'.repeat(18)}${k.key.slice(-4)}`;

                    return (
                      <div
                        key={k.id}
                        className={`p-4 rounded-xl border transition-all ${
                          k.status === 'revoked'
                            ? 'bg-mahogany-950/40 border-red-900/30 opacity-60'
                            : selectedKeyForTest === k.key
                            ? 'bg-mahogany-950 border-gold-accent shadow-lg'
                            : 'bg-mahogany-950/80 border-gold-accent/20 hover:border-gold-accent/40'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-ivory font-serif">{k.name}</span>
                            <span className={`text-[9px] px-2 py-0.5 rounded font-mono uppercase font-black ${
                              k.environment === 'live' 
                                ? 'bg-gold-accent/20 text-gold-accent border border-gold-accent/30' 
                                : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            }`}>
                              {k.environment}
                            </span>
                            <span className={`text-[9px] px-2 py-0.5 rounded font-mono uppercase ${
                              k.status === 'active' 
                                ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' 
                                : 'bg-red-500/15 text-red-400 border border-red-500/30'
                            }`}>
                              {k.status}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setSelectedKeyForTest(k.key)}
                              className={`text-[10px] font-mono px-2 py-1 rounded transition-colors ${
                                selectedKeyForTest === k.key
                                  ? 'bg-gold-accent text-mahogany-950 font-bold'
                                  : 'text-gold-accent/70 hover:bg-gold-accent/10'
                              }`}
                            >
                              {selectedKeyForTest === k.key ? 'Active In Console' : 'Use In Console'}
                            </button>
                          </div>
                        </div>

                        {/* Key Display Bar */}
                        <div className="flex items-center gap-2 bg-mahogany-900 border border-gold-accent/20 rounded-lg px-3 py-2 font-mono text-xs">
                          <span className="flex-1 truncate text-gold-accent tracking-wide">{maskedKey}</span>
                          
                          <button
                            onClick={() => handleToggleReveal(k.id)}
                            className="p-1 text-ivory/50 hover:text-ivory transition-colors cursor-pointer"
                            title={isRevealed ? "Hide Key" : "Reveal Key"}
                          >
                            {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>

                          <button
                            onClick={() => handleCopy(k.key, k.id)}
                            className="p-1 text-gold-accent hover:text-white transition-colors cursor-pointer flex items-center gap-1"
                            title="Copy API Key"
                          >
                            {copiedKeyId === k.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-ivory/50 mt-2 font-mono">
                          <span>Created: {new Date(k.createdAt).toLocaleDateString()}</span>
                          {k.lastUsedAt && <span>Last Used: {new Date(k.lastUsedAt).toLocaleTimeString()}</span>}

                          <div className="flex items-center gap-2">
                            {k.status === 'active' && (
                              <button
                                onClick={() => handleRevokeKey(k.id)}
                                className="text-amber-400 hover:text-amber-300 transition-colors cursor-pointer underline"
                              >
                                Revoke
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteKey(k.id)}
                              className="text-red-400/70 hover:text-red-300 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-gold-accent/15 flex items-center justify-between text-xs text-ivory/60 font-serif">
              <span>Header syntax: <code className="text-gold-accent font-mono">Authorization: Bearer axio_...</code></span>
              <button 
                onClick={fetchKeys}
                className="text-gold-accent hover:underline flex items-center gap-1 font-mono text-xs"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Sync Vault</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Section: Interactive Code Snippets + Sandbox Console */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Code Integration Generator */}
          <div className="lg:col-span-6 bg-mahogany-900/95 border border-gold-accent/30 rounded-2xl p-6 shadow-2xl brass-border flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-gold-accent/20 mb-4">
              <div className="flex items-center gap-2">
                <Code2 className="w-5 h-5 text-gold-accent" />
                <h3 className="text-base font-bold text-gold-accent font-serif">Integration Code Snippet</h3>
              </div>

              {/* Language Pills */}
              <div className="flex items-center gap-1 bg-mahogany-950 p-1 rounded-xl border border-gold-accent/20">
                {(['curl', 'typescript', 'python'] as const).map(lang => (
                  <button
                    key={lang}
                    onClick={() => setSelectedLang(lang)}
                    className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                      selectedLang === lang
                        ? 'bg-gold-accent text-mahogany-950 shadow-sm'
                        : 'text-ivory/60 hover:text-gold-accent'
                    }`}
                  >
                    {lang === 'typescript' ? 'TypeScript' : lang === 'curl' ? 'cURL' : 'Python'}
                  </button>
                ))}
              </div>
            </div>

            {/* Target Endpoint Selector */}
            <div className="mb-4">
              <label className="text-[11px] font-mono text-gold-accent/80 block mb-1 uppercase tracking-wider font-bold">
                Target Endpoint
              </label>
              <select
                value={selectedEndpointId}
                onChange={(e) => setSelectedEndpointId(e.target.value)}
                className="w-full bg-mahogany-950 border border-gold-accent/30 rounded-xl px-4 py-2.5 text-xs text-ivory font-mono focus:outline-none focus:border-gold-accent cursor-pointer"
              >
                {ENDPOINTS.map(ep => (
                  <option key={ep.id} value={ep.id} className="bg-mahogany-950 text-ivory">
                    {ep.method} {ep.path} — {ep.title}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-ivory/50 font-serif italic mt-1.5">{selectedEndpoint.description}</p>
            </div>

            {/* Code Box */}
            <div className="flex-1 relative rounded-xl bg-mahogany-950 border border-gold-accent/25 p-4 overflow-hidden flex flex-col">
              <div className="flex items-center justify-between pb-2 border-b border-gold-accent/15 mb-3">
                <span className="text-[10px] font-mono text-gold-accent/70">
                  {selectedLang === 'curl' ? 'Shell Terminal' : selectedLang === 'typescript' ? 'client.ts' : 'script.py'}
                </span>
                <button
                  onClick={() => handleCopy(generatedCode, 'snippet')}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gold-accent/15 hover:bg-gold-accent hover:text-mahogany-950 text-gold-accent text-xs font-mono font-bold transition-all cursor-pointer"
                >
                  {copiedKeyId === 'snippet' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKeyId === 'snippet' ? 'Copied' : 'Copy Snippet'}</span>
                </button>
              </div>

              <pre className="flex-1 font-mono text-xs text-ivory/90 overflow-x-auto whitespace-pre leading-relaxed select-all">
                <code>{generatedCode}</code>
              </pre>
            </div>
          </div>

          {/* Right Column: Live API Playground / Verification Console */}
          <div className="lg:col-span-6 bg-mahogany-900/95 border border-gold-accent/30 rounded-2xl p-6 shadow-2xl brass-border flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-gold-accent/20 mb-4">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-gold-accent" />
                <h3 className="text-base font-bold text-gold-accent font-serif">Live API Playground</h3>
              </div>
              <span className="text-xs font-mono text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Ready to Ping</span>
              </span>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1.5 rounded-lg bg-gold-accent text-mahogany-950 font-black text-xs font-mono shrink-0">
                  {selectedEndpoint.method}
                </span>
                <span className="flex-1 bg-mahogany-950 border border-gold-accent/25 rounded-xl px-3 py-1.5 text-xs font-mono text-gold-accent truncate">
                  {selectedEndpoint.path}
                </span>
                <button
                  onClick={handleExecuteTest}
                  disabled={isSendingTest}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{isSendingTest ? 'Sending...' : 'Send Request'}</span>
                </button>
              </div>

              {selectedEndpoint.method === 'POST' && (
                <div>
                  <label className="text-[10px] font-mono text-gold-accent/70 block mb-1 uppercase font-bold">
                    JSON Request Payload
                  </label>
                  <textarea
                    rows={4}
                    value={customRequestBody}
                    onChange={(e) => setCustomRequestBody(e.target.value)}
                    className="w-full bg-mahogany-950 border border-gold-accent/25 rounded-xl p-3 text-xs font-mono text-ivory focus:outline-none focus:border-gold-accent resize-none"
                  />
                </div>
              )}
            </div>

            {/* Response Console */}
            <div className="flex-1 rounded-xl bg-mahogany-950 border border-gold-accent/25 p-4 overflow-hidden flex flex-col">
              <div className="flex items-center justify-between pb-2 border-b border-gold-accent/15 mb-3 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="text-ivory/60 font-serif">Server Response</span>
                  {testResponseStatus && (
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                      testResponseStatus < 300 
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                        : 'bg-red-500/20 text-red-400 border border-red-500/40'
                    }`}>
                      HTTP {testResponseStatus}
                    </span>
                  )}
                </div>
                {testLatency !== null && (
                  <span className="text-gold-accent/70">{testLatency}ms</span>
                )}
              </div>

              {testResponse ? (
                <pre className="flex-1 font-mono text-xs text-emerald-300/90 overflow-y-auto max-h-56 whitespace-pre leading-relaxed select-all">
                  <code>{JSON.stringify(testResponse, null, 2)}</code>
                </pre>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-ivory/30 py-8 space-y-2">
                  <Terminal className="w-8 h-8 opacity-40" />
                  <p className="text-xs font-serif italic">Click "Send Request" to test endpoint response with active key.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
