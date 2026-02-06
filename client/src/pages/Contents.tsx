import { Sidebar } from "@/components/Sidebar";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useClients } from "@/hooks/use-clients";
import { useContents } from "@/hooks/use-contents";
import { Calendar, ExternalLink, FileText, Search, Filter } from "lucide-react";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";

export default function Contents() {
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  
  const { data: clients } = useClients();
  const { data: contents, isLoading } = useContents(selectedClient);

  // Filter contents based on search and type
  const filteredContents = contents?.filter(content => {
    const matchesSearch = content.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         content.summary?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || content.sourceType === filterType;
    return matchesSearch && matchesType;
  });

  const getSourceColor = (type: string) => {
    switch (type) {
      case "RSS":
        return "bg-orange-500/10 text-orange-500 border-orange-500/20";
      case "BLOG":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "NEWS":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  return (
    <div className="flex min-h-screen bg-muted/20">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <PageHeader 
          title="Biblioteca de Conteúdo" 
          description="Navegue e gerencie conteúdo coletado de suas fontes."
        />

        {/* Client Selector */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Selecionar Cliente</CardTitle>
            <CardDescription>
              Escolha um cliente para ver seu conteúdo coletado.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedClient} onValueChange={setSelectedClient}>
              <SelectTrigger>
                <SelectValue placeholder="Select a client to view content" />
              </SelectTrigger>
              <SelectContent>
                {clients?.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {selectedClient && (
          <>
            {/* Filters and Search */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                      <Input
                        placeholder="Pesquisar conteúdo..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="w-full md:w-48">
                    <Select value={filterType} onValueChange={setFilterType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Filtrar por tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="RSS">RSS</SelectItem>
                        <SelectItem value="BLOG">Blog</SelectItem>
                        <SelectItem value="NEWS">News</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Content List */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-display font-bold">
                  Conteúdo Coletado {filteredContents && `(${filteredContents.length})`}
                </h2>
              </div>

              {isLoading ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4 animate-pulse" />
                  <p className="text-muted-foreground">Loading content...</p>
                </div>
              ) : filteredContents && filteredContents.length > 0 ? (
                <div className="space-y-4">
                  {filteredContents.map((content) => (
                    <Card key={content.id} className="hover:border-primary/50 transition-colors">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <CardTitle className="text-lg line-clamp-2 mb-2">
                              <a
                                href={content.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-primary transition-colors"
                              >
                                {content.title}
                              </a>
                            </CardTitle>
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant="outline" className={getSourceColor(content.sourceType)}>
                                {content.sourceType}
                              </Badge>
                              <Badge variant="secondary">
                                {content.sourceName}
                              </Badge>
                              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                <Calendar className="w-3 h-3" />
                                {formatDistanceToNow(new Date(content.publishedAt), { addSuffix: true })}
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                          >
                            <a
                              href={content.url}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground line-clamp-3 mb-3">
                          {content.summary}
                        </p>
                        {content.keyPoints && content.keyPoints.length > 0 && (
                          <div className="space-y-2">
                            <h4 className="font-medium text-sm">Key Points:</h4>
                            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                              {content.keyPoints.slice(0, 3).map((point, index) => (
                                <li key={index}>{point}</li>
                              ))}
                              {content.keyPoints.length > 3 && (
                                <li className="text-primary">...and {content.keyPoints.length - 3} more</li>
                              )}
                            </ul>
                          </div>
                        )}
                        {content.analysis && (
                          <div className="mt-3 pt-3 border-t">
                            <p className="text-sm">
                              <span className="font-medium">Relevance:</span> {content.analysis.relevanceScore}/10
                            </p>
                            {content.analysis.topics && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {content.analysis.topics.map((topic, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {topic}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="p-12 text-center">
                  <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    {searchQuery || filterType !== "all" ? "No matching content" : "No content collected yet"}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery || filterType !== "all"
                      ? "Try adjusting your search or filters to find what you're looking for."
                      : "Content will appear here once sources are scraped and analyzed."}
                  </p>
                </Card>
              )}
            </div>
          </>
        )}

        {!selectedClient && (
          <Card className="p-12 text-center">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Select a client</h3>
            <p className="text-muted-foreground">
              Choose a client to view their collected content library.
            </p>
          </Card>
        )}
      </main>
    </div>
  );
}