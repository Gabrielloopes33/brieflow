import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useContents } from "@/hooks/use-contents";
import { Globe, Calendar, FileText, Loader2, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface ContentsTabProps {
  clientId: string;
}

export function ContentsTab({ clientId }: ContentsTabProps) {
  const [search, setSearch] = useState("");
  const { data: contents, isLoading } = useContents(clientId);

  const filteredContents = contents?.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.summary?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const getContentTypeColor = (content: any) => {
    if (content.topics && Array.isArray(content.topics)) {
      const topic = content.topics[0];
      switch (topic) {
        case 'tech':
          return 'bg-blue-500/10 text-blue-500';
        case 'business':
          return 'bg-green-500/10 text-green-500';
        case 'design':
          return 'bg-purple-500/10 text-purple-500';
        default:
          return 'bg-gray-500/10 text-gray-500';
      }
    }
    return 'bg-gray-500/10 text-gray-500';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar conteúdos..."
            className="pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="w-4 h-4" />
        </Button>
      </div>

      {filteredContents && filteredContents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredContents.map((content) => (
            <Card key={content.id} className="card-hover border-border/50">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-2 mb-2">
                      {content.title}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={getContentTypeColor(content)}>
                        {content.topics && Array.isArray(content.topics) ? content.topics[0] : 'Geral'}
                      </Badge>
                    </div>
                  </div>
                  <a
                    href={content.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Globe className="w-4 h-4" />
                  </a>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                  {content.summary || "Sem resumo disponível."}
                </p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {content.publishedAt
                      ? new Date(content.publishedAt).toLocaleDateString('pt-BR')
                      : new Date(content.scrapedAt).toLocaleDateString('pt-BR')
                    }
                  </div>
                  <div className="flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    {content.contentText?.length || 0} caracteres
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">
            {search ? 'Nenhum resultado encontrado' : 'Nenhum conteúdo ainda'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {search
              ? 'Tente uma busca diferente ou adicione novas fontes.'
              : 'Adicione fontes e faça scraping para coletar conteúdos.'
            }
          </p>
          {!search && (
            <Button onClick={() => window.location.href = `?tab=sources`}>
              Ir para Fontes
            </Button>
          )}
        </Card>
      )}
    </div>
  );
}
