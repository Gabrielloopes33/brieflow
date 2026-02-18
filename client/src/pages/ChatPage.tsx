import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { ChatInterface } from "@/components/chat/ChatInterface";
import { useClients } from "@/hooks/use-clients";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
    Globe,
    Search,
    Bot,
    Map,
    Layers,
    Loader2,
    ExternalLink,
    ChevronRight,
    User,
} from "lucide-react";

type ToolTab = "scrape" | "search" | "agent" | "map" | "crawl";

interface ScrapeResult {
    url: string;
    markdown?: string;
    html?: string;
    links?: string[];
}

interface SearchResult {
    title: string;
    url: string;
    description: string;
}

export function ChatPage() {
    const [activeTab, setActiveTab] = useState<ToolTab>("scrape");
    const [selectedClient, setSelectedClient] = useState<string>("");
    const { data: clients } = useClients();

    // Scrape state
    const [scrapeUrl, setScrapeUrl] = useState("");
    const [scrapeFormat, setScrapeFormat] = useState<"markdown" | "html" | "links">("markdown");
    const [scrapeResult, setScrapeResult] = useState<ScrapeResult | null>(null);
    const [scrapeLoading, setScrapeLoading] = useState(false);

    // Search state
    const [searchQuery, setSearchQuery] = useState("");
    const [searchNumResults, setSearchNumResults] = useState("5");
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [searchLoading, setSearchLoading] = useState(false);

    // Agent state
    const [agentPrompt, setAgentPrompt] = useState("");
    const [agentResult, setAgentResult] = useState("");
    const [agentLoading, setAgentLoading] = useState(false);

    // Map state
    const [mapUrl, setMapUrl] = useState("");
    const [mapResult, setMapResult] = useState<string[]>([]);
    const [mapLoading, setMapLoading] = useState(false);

    // Crawl state
    const [crawlUrl, setCrawlUrl] = useState("");
    const [crawlMaxPages, setCrawlMaxPages] = useState("10");
    const [crawlResult, setCrawlResult] = useState<string[]>([]);
    const [crawlLoading, setCrawlLoading] = useState(false);

    const handleScrape = async () => {
        if (!scrapeUrl.trim()) return;
        setScrapeLoading(true);
        setScrapeResult(null);
        try {
            const res = await fetch("/api/scraper/scrape", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: scrapeUrl, formats: [scrapeFormat] }),
            });
            const data = await res.json();
            setScrapeResult(data);
        } catch {
            setScrapeResult({ url: scrapeUrl, markdown: "Erro ao fazer scraping. Verifique a URL e tente novamente." });
        } finally {
            setScrapeLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        setSearchLoading(true);
        setSearchResults([]);
        try {
            const res = await fetch("/api/scraper/search", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ query: searchQuery, numResults: parseInt(searchNumResults) }),
            });
            const data = await res.json();
            setSearchResults(data.results || []);
        } catch {
            setSearchResults([]);
        } finally {
            setSearchLoading(false);
        }
    };

    const handleAgent = async () => {
        if (!agentPrompt.trim()) return;
        setAgentLoading(true);
        setAgentResult("");
        try {
            const res = await fetch("/api/scraper/agent", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt: agentPrompt }),
            });
            const data = await res.json();
            setAgentResult(data.result || JSON.stringify(data, null, 2));
        } catch {
            setAgentResult("Erro ao executar o agente.");
        } finally {
            setAgentLoading(false);
        }
    };

    const handleMap = async () => {
        if (!mapUrl.trim()) return;
        setMapLoading(true);
        setMapResult([]);
        try {
            const res = await fetch("/api/scraper/map", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: mapUrl }),
            });
            const data = await res.json();
            setMapResult(data.links || data.urls || []);
        } catch {
            setMapResult([]);
        } finally {
            setMapLoading(false);
        }
    };

    const handleCrawl = async () => {
        if (!crawlUrl.trim()) return;
        setCrawlLoading(true);
        setCrawlResult([]);
        try {
            const res = await fetch("/api/scraper/crawl", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url: crawlUrl, maxPages: parseInt(crawlMaxPages) }),
            });
            const data = await res.json();
            setCrawlResult(data.pages || data.urls || []);
        } catch {
            setCrawlResult([]);
        } finally {
            setCrawlLoading(false);
        }
    };

    const tabs: { id: ToolTab; label: string; icon: React.ReactNode }[] = [
        { id: "scrape", label: "Scrape", icon: <Globe size={14} /> },
        { id: "search", label: "Search", icon: <Search size={14} /> },
        { id: "agent", label: "Agent", icon: <Bot size={14} /> },
        { id: "map", label: "Map", icon: <Map size={14} /> },
        { id: "crawl", label: "Crawl", icon: <Layers size={14} /> },
    ];

    return (
        <AppShell>
            <div className="flex h-full gap-0 min-h-0">

                {/* Chat Area (Left / Center) */}
                <div className="flex-1 flex flex-col min-h-0 min-w-0">
                    <ChatInterface />
                </div>

                {/* Tool Panel (Right) */}
                <div className="hidden md:flex w-[340px] shrink-0 flex-col border-l border-border/50 bg-background/50 backdrop-blur-sm overflow-hidden">

                    {/* Client Selector */}
                    <div className="p-4 border-b border-border/50">
                        <div className="flex items-center gap-2 mb-2">
                            <User size={14} className="text-muted-foreground" />
                            <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Cliente</span>
                        </div>
                        <Select value={selectedClient} onValueChange={setSelectedClient}>
                            <SelectTrigger className="bg-secondary/30 border-border/50 text-sm h-9">
                                <SelectValue placeholder="Selecione um cliente..." />
                            </SelectTrigger>
                            <SelectContent>
                                {clients?.map((client) => (
                                    <SelectItem key={client.id} value={client.id}>
                                        {client.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Tool Tabs */}
                    <div className="border-b border-border/50 px-3 pt-3">
                        <div className="flex gap-1 overflow-x-auto pb-0 scrollbar-none">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t-lg text-xs font-medium whitespace-nowrap transition-all border-b-2 ${activeTab === tab.id
                                            ? "text-primary border-primary bg-primary/5"
                                            : "text-muted-foreground border-transparent hover:text-foreground hover:bg-secondary/30"
                                        }`}
                                >
                                    {tab.icon}
                                    {tab.label}
                                    {tab.id === "agent" && (
                                        <Badge className="text-[9px] px-1 py-0 h-3.5 bg-primary/20 text-primary border-0 ml-0.5">New</Badge>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tab Content */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">

                        {/* SCRAPE TAB */}
                        {activeTab === "scrape" && (
                            <div className="space-y-3">
                                <div>
                                    <label className="text-xs text-muted-foreground mb-1.5 block">URL para extrair</label>
                                    <Input
                                        placeholder="https://exemplo.com"
                                        value={scrapeUrl}
                                        onChange={(e) => setScrapeUrl(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && handleScrape()}
                                        className="bg-secondary/30 border-border/50 text-sm h-9"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-muted-foreground mb-1.5 block">Formato</label>
                                    <div className="flex gap-2">
                                        {(["markdown", "html", "links"] as const).map((fmt) => (
                                            <button
                                                key={fmt}
                                                onClick={() => setScrapeFormat(fmt)}
                                                className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all border ${scrapeFormat === fmt
                                                        ? "bg-primary text-primary-foreground border-primary"
                                                        : "bg-secondary/30 text-muted-foreground border-border/50 hover:border-border"
                                                    }`}
                                            >
                                                {fmt}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <Button
                                    onClick={handleScrape}
                                    disabled={scrapeLoading || !scrapeUrl.trim()}
                                    className="w-full h-9 text-sm"
                                >
                                    {scrapeLoading ? <Loader2 size={14} className="animate-spin mr-2" /> : <Globe size={14} className="mr-2" />}
                                    {scrapeLoading ? "Extraindo..." : "Scrape"}
                                </Button>

                                {scrapeResult && (
                                    <div className="mt-2 p-3 rounded-lg bg-secondary/20 border border-border/50 text-xs font-mono text-muted-foreground max-h-64 overflow-y-auto whitespace-pre-wrap break-all">
                                        {scrapeFormat === "links" && Array.isArray(scrapeResult.links)
                                            ? scrapeResult.links.map((l, i) => (
                                                <a key={i} href={l} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-primary hover:underline mb-1">
                                                    <ExternalLink size={10} /> {l}
                                                </a>
                                            ))
                                            : scrapeResult.markdown || scrapeResult.html || JSON.stringify(scrapeResult, null, 2)}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* SEARCH TAB */}
                        {activeTab === "search" && (
                            <div className="space-y-3">
                                <div>
                                    <label className="text-xs text-muted-foreground mb-1.5 block">Consulta de pesquisa</label>
                                    <Input
                                        placeholder="Ex: marketing digital 2025"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                                        className="bg-secondary/30 border-border/50 text-sm h-9"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-muted-foreground mb-1.5 block">Número de resultados</label>
                                    <Select value={searchNumResults} onValueChange={setSearchNumResults}>
                                        <SelectTrigger className="bg-secondary/30 border-border/50 text-sm h-9">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {["3", "5", "10", "20"].map((n) => (
                                                <SelectItem key={n} value={n}>{n} resultados</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button
                                    onClick={handleSearch}
                                    disabled={searchLoading || !searchQuery.trim()}
                                    className="w-full h-9 text-sm"
                                >
                                    {searchLoading ? <Loader2 size={14} className="animate-spin mr-2" /> : <Search size={14} className="mr-2" />}
                                    {searchLoading ? "Pesquisando..." : "Search"}
                                </Button>

                                {searchResults.length > 0 && (
                                    <div className="space-y-2 mt-2">
                                        {searchResults.map((r, i) => (
                                            <div key={i} className="p-3 rounded-lg bg-secondary/20 border border-border/50 hover:border-primary/30 transition-colors">
                                                <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-primary hover:underline flex items-center gap-1 mb-1">
                                                    <ExternalLink size={10} /> {r.title}
                                                </a>
                                                <p className="text-xs text-muted-foreground line-clamp-2">{r.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* AGENT TAB */}
                        {activeTab === "agent" && (
                            <div className="space-y-3">
                                <div>
                                    <label className="text-xs text-muted-foreground mb-1.5 block">Instruções para o agente</label>
                                    <Textarea
                                        placeholder="Ex: Pesquise sobre tendências de marketing digital e extraia os 5 principais insights..."
                                        value={agentPrompt}
                                        onChange={(e) => setAgentPrompt(e.target.value)}
                                        className="bg-secondary/30 border-border/50 text-sm min-h-[100px] resize-none"
                                    />
                                </div>
                                <Button
                                    onClick={handleAgent}
                                    disabled={agentLoading || !agentPrompt.trim()}
                                    className="w-full h-9 text-sm"
                                >
                                    {agentLoading ? <Loader2 size={14} className="animate-spin mr-2" /> : <Bot size={14} className="mr-2" />}
                                    {agentLoading ? "Executando..." : "Run Agent"}
                                </Button>

                                {agentResult && (
                                    <div className="mt-2 p-3 rounded-lg bg-secondary/20 border border-border/50 text-xs text-muted-foreground max-h-64 overflow-y-auto whitespace-pre-wrap">
                                        {agentResult}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* MAP TAB */}
                        {activeTab === "map" && (
                            <div className="space-y-3">
                                <div>
                                    <label className="text-xs text-muted-foreground mb-1.5 block">URL do site</label>
                                    <Input
                                        placeholder="https://exemplo.com"
                                        value={mapUrl}
                                        onChange={(e) => setMapUrl(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && handleMap()}
                                        className="bg-secondary/30 border-border/50 text-sm h-9"
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground">Mapeia toda a estrutura de URLs do site.</p>
                                <Button
                                    onClick={handleMap}
                                    disabled={mapLoading || !mapUrl.trim()}
                                    className="w-full h-9 text-sm"
                                >
                                    {mapLoading ? <Loader2 size={14} className="animate-spin mr-2" /> : <Map size={14} className="mr-2" />}
                                    {mapLoading ? "Mapeando..." : "Map Site"}
                                </Button>

                                {mapResult.length > 0 && (
                                    <div className="mt-2 space-y-1 max-h-64 overflow-y-auto">
                                        {mapResult.map((url, i) => (
                                            <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                                                className="flex items-center gap-1.5 text-xs text-primary hover:underline py-1 px-2 rounded hover:bg-primary/5 transition-colors">
                                                <ChevronRight size={10} className="shrink-0" />
                                                <span className="truncate">{url}</span>
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* CRAWL TAB */}
                        {activeTab === "crawl" && (
                            <div className="space-y-3">
                                <div>
                                    <label className="text-xs text-muted-foreground mb-1.5 block">URL inicial</label>
                                    <Input
                                        placeholder="https://exemplo.com"
                                        value={crawlUrl}
                                        onChange={(e) => setCrawlUrl(e.target.value)}
                                        className="bg-secondary/30 border-border/50 text-sm h-9"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-muted-foreground mb-1.5 block">Máximo de páginas</label>
                                    <Select value={crawlMaxPages} onValueChange={setCrawlMaxPages}>
                                        <SelectTrigger className="bg-secondary/30 border-border/50 text-sm h-9">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {["5", "10", "25", "50", "100"].map((n) => (
                                                <SelectItem key={n} value={n}>{n} páginas</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <Button
                                    onClick={handleCrawl}
                                    disabled={crawlLoading || !crawlUrl.trim()}
                                    className="w-full h-9 text-sm"
                                >
                                    {crawlLoading ? <Loader2 size={14} className="animate-spin mr-2" /> : <Layers size={14} className="mr-2" />}
                                    {crawlLoading ? "Crawling..." : "Start Crawl"}
                                </Button>

                                {crawlResult.length > 0 && (
                                    <div className="mt-2 space-y-1 max-h-64 overflow-y-auto">
                                        <p className="text-xs text-muted-foreground mb-2">{crawlResult.length} páginas encontradas</p>
                                        {crawlResult.map((url, i) => (
                                            <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                                                className="flex items-center gap-1.5 text-xs text-primary hover:underline py-1 px-2 rounded hover:bg-primary/5 transition-colors">
                                                <ExternalLink size={10} className="shrink-0" />
                                                <span className="truncate">{url}</span>
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                    </div>
                </div>

            </div>
        </AppShell>
    );
}
