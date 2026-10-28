import React, { useState } from 'react';
import { 
  Sparkles, 
  Globe, 
  ShieldCheck, 
  ChevronRight,
  CheckCircle,
  Copy,
  ExternalLink
} from 'lucide-react';
import type { AxioTab, SearchApiResponse } from './types';

interface AxioWebEngineProps {
  tab: AxioTab;
  onNavigateUrl: (url: string) => void;
  onOpenCopilot: () => void;
}

export const AxioWebEngine: React.FC<AxioWebEngineProps> = ({
  tab,
  onNavigateUrl,
  onOpenCopilot,
}) => {
  const [copiedUrl, setCopiedUrl] = useState(false);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(tab.url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  if (tab.mode === 'search' || tab.searchData) {
    const data: SearchApiResponse = tab.searchData;
    const aiOverview = data?.aiOverview;
    const results = data?.results || [];
    const knowledgePanel = data?.knowledgePanel;

    return (
      <div 
        className="flex-1 overflow-y-auto px-4 sm:px-12 py-8 select-none font-serif text-ivory"
        style={{
          backgroundImage: 'url("/src/assets/images/mahogany_wood_texture_1792941904763.jpg")',
          backgroundSize: 'cover',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="absolute inset-0 bg-mahogany-950/75 pointer-events-none z-0" />

        <div className="max-w-5xl mx-auto space-y-8 relative z-10">
          {/* Top Search Bar reflection */}
          <div className="flex items-center justify-between pb-4 border-b border-gold-accent/25">
            <div className="flex items-center gap-3">
              <div className="text-sm font-medium text-ivory/70 font-mono">
                Search Results for: <span className="text-gold-accent font-bold">"{data?.query || tab.title}"</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenCopilot}
                className="px-3.5 py-1.5 rounded-xl bg-gold-accent text-mahogany-950 font-black text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-lg hover:scale-105 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Copilot Analysis</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left/Main Column: AI Overview & Search Results */}
            <div className="lg:col-span-2 space-y-6">
              {/* AI Overview Box on Mahogany Panel with Brass Bezel */}
              {aiOverview && (
                <div className="bg-mahogany-900/95 border-2 border-gold-accent/40 rounded-2xl p-6 shadow-2xl brass-border relative overflow-hidden">
                  <div className="flex items-center justify-between mb-3 pb-3 border-b border-gold-accent/20">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-gold-accent text-mahogany-950 flex items-center justify-center font-black">
                        <Sparkles className="w-4 h-4 animate-pulse" />
                      </div>
                      <h3 className="text-xs font-black uppercase tracking-widest text-gold-accent font-mono">
                        AXIO Gemini AI Neural Synthesis
                      </h3>
                    </div>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-gold-accent/20 text-gold-accent font-mono border border-gold-accent/30">
                      Confidence: {aiOverview.confidenceScore}%
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-ivory leading-relaxed mb-4 font-serif">
                    {aiOverview.summary}
                  </p>

                  {aiOverview.keyTakeaways && aiOverview.keyTakeaways.length > 0 && (
                    <div className="space-y-2 pt-3 border-t border-gold-accent/15">
                      <span className="text-[11px] font-bold text-gold-accent uppercase tracking-wider font-mono">Core Takeaways</span>
                      <ul className="space-y-1.5">
                        {aiOverview.keyTakeaways.map((takeaway, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-xs text-ivory/90 font-serif">
                            <CheckCircle className="w-3.5 h-3.5 text-gold-accent shrink-0 mt-0.5" />
                            <span>{takeaway}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Standard Web Search Results on Carved Wood Cards */}
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-gold-accent font-mono">
                  Indexed Knowledge Nodes
                </h3>
                {results.map((item, idx) => (
                  <div 
                    key={idx}
                    onClick={() => onNavigateUrl(item.url)}
                    className="group p-5 rounded-2xl bg-mahogany-900/90 hover:bg-mahogany-800/95 border border-gold-accent/30 hover:border-gold-accent transition-all cursor-pointer shadow-xl space-y-1.5 brass-border-sm"
                  >
                    <div className="flex items-center gap-2 text-[11px] text-ivory/50 font-mono">
                      <span className="text-gold-accent">{item.domain}</span>
                      <span>·</span>
                      <span className="truncate">{item.url}</span>
                    </div>
                    <h4 className="text-sm sm:text-base font-bold text-gold-accent group-hover:underline font-serif">
                      {item.title}
                    </h4>
                    <p className="text-xs text-ivory/80 leading-relaxed line-clamp-2 font-serif">
                      {item.snippet}
                    </p>
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex items-center gap-1.5 pt-1">
                        {item.tags.map((tag, tIdx) => (
                          <span key={tIdx} className="text-[9px] px-2 py-0.5 rounded bg-mahogany-950 text-gold-accent/80 font-mono border border-gold-accent/20">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Knowledge Panel & Related Queries */}
            <div className="space-y-6">
              {knowledgePanel && knowledgePanel.title && (
                <div className="bg-mahogany-900/95 border border-gold-accent/35 rounded-2xl p-5 shadow-2xl space-y-4 brass-border">
                  <div>
                    <h3 className="text-lg font-bold text-gold-accent font-serif">{knowledgePanel.title}</h3>
                    {knowledgePanel.subtitle && (
                      <p className="text-xs text-ivory/70 font-serif italic">{knowledgePanel.subtitle}</p>
                    )}
                  </div>

                  <p className="text-xs text-ivory/85 leading-relaxed font-serif">
                    {knowledgePanel.description}
                  </p>

                  {knowledgePanel.attributes && Object.keys(knowledgePanel.attributes).length > 0 && (
                    <div className="space-y-2 pt-3 border-t border-gold-accent/15 text-xs">
                      {Object.entries(knowledgePanel.attributes).map(([key, val], idx) => (
                        <div key={idx} className="flex justify-between py-1 border-b border-gold-accent/10">
                          <span className="text-ivory/60 font-mono">{key}:</span>
                          <span className="text-gold-accent font-medium font-serif">{val}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {knowledgePanel.source && (
                    <div className="text-[10px] text-ivory/40 pt-1 font-mono">
                      Source: {knowledgePanel.source}
                    </div>
                  )}
                </div>
              )}

              {/* People Also Ask */}
              {data.peopleAlsoAsk && data.peopleAlsoAsk.length > 0 && (
                <div className="bg-mahogany-900/90 border border-gold-accent/30 rounded-2xl p-5 shadow-xl space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-widest text-gold-accent font-mono">
                    Related Inquiries
                  </h3>
                  <div className="space-y-2">
                    {data.peopleAlsoAsk.map((item, idx) => (
                      <details key={idx} className="group p-2.5 rounded-xl bg-mahogany-950/80 border border-gold-accent/20 cursor-pointer">
                        <summary className="text-xs font-semibold text-ivory flex justify-between items-center font-serif">
                          <span>{item.question}</span>
                          <ChevronRight className="w-3.5 h-3.5 text-gold-accent group-open:rotate-90 transition-transform" />
                        </summary>
                        <p className="text-[11px] text-ivory/70 mt-2 pt-2 border-t border-gold-accent/10 leading-relaxed font-serif">
                          {item.answer}
                        </p>
                      </details>
                    ))}
                  </div>
                </div>
              )}

              {/* Related Queries */}
              {data.relatedQueries && data.relatedQueries.length > 0 && (
                <div className="bg-mahogany-900/90 border border-gold-accent/30 rounded-2xl p-5 shadow-xl space-y-3">
                  <h3 className="text-xs font-black uppercase tracking-widest text-gold-accent font-mono">
                    Interlinked Nodes
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {data.relatedQueries.map((rq, idx) => (
                      <button
                        key={idx}
                        onClick={() => onNavigateUrl(rq)}
                        className="text-xs px-3 py-1.5 rounded-xl bg-mahogany-950 hover:bg-gold-accent hover:text-mahogany-950 text-ivory/80 border border-gold-accent/25 transition-all text-left cursor-pointer"
                      >
                        {rq}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Live Web Engine Viewport connected via AXIO Secure Proxy
  return (
    <div className="flex-1 flex flex-col min-h-0 bg-neutral-900 overflow-hidden relative select-none">
      {/* Top Chrome Engine Navigation Bar */}
      <div className="h-10 bg-mahogany-950/95 border-b border-gold-accent/25 px-4 flex items-center justify-between text-xs text-ivory shrink-0 z-10 shadow-md">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-emerald-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="font-bold text-gold-accent">SECURE</span>
          </div>
          <span className="text-gold-accent/30">|</span>
          <div className="flex items-center gap-1.5 min-w-0 text-[11px] font-mono text-ivory/80 truncate">
            <Globe className="w-3.5 h-3.5 text-gold-accent/70 shrink-0" />
            <span className="truncate">{tab.url}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleCopyUrl}
            title="Copy Page URL"
            className="px-2.5 py-1 rounded-lg bg-mahogany-900 hover:bg-gold-accent/20 border border-gold-accent/20 text-gold-accent text-[11px] font-mono flex items-center gap-1 transition-all cursor-pointer"
          >
            <Copy className="w-3 h-3" />
            <span>{copiedUrl ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={onOpenCopilot}
            title="Analyze Page with AXIO Copilot"
            className="px-3 py-1 rounded-lg bg-gold-accent text-mahogany-950 font-black text-[10px] uppercase tracking-wider flex items-center gap-1.5 transition-all shadow hover:scale-105 cursor-pointer"
          >
            <Sparkles className="w-3 h-3" />
            <span>AI Copilot</span>
          </button>

          <a
            href={tab.url}
            target="_blank"
            rel="noopener noreferrer"
            title="Open directly in Google Chrome"
            className="px-3 py-1 rounded-lg bg-mahogany-900 hover:bg-mahogany-800 border border-gold-accent/40 text-gold-accent font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5 transition-all shadow hover:border-gold-accent cursor-pointer"
          >
            <ExternalLink className="w-3 h-3" />
            <span>Chrome Tab</span>
          </a>
        </div>
      </div>

      {/* Live Web Iframe Container */}
      <div className="flex-1 w-full h-full relative bg-white">
        <iframe
          key={tab.url}
          src={`/api/axio/proxy?url=${encodeURIComponent(tab.url)}`}
          title={tab.title || 'AXIO Web Engine'}
          className="w-full h-full border-0 absolute inset-0 bg-white"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals"
          loading="eager"
        />
      </div>
    </div>
  );
};

