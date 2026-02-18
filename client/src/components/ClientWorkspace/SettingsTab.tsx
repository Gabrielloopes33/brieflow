import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useClient } from "@/hooks/use-clients";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { useState } from "react";

interface SettingsTabProps {
  clientId: string;
}

export function SettingsTab({ clientId }: SettingsTabProps) {
  const { data: client, isLoading } = useClient(clientId);
  const [isScrapingEnabled, setIsScrapingEnabled] = useState(true);
  const [autoGenerateBriefs, setAutoGenerateBriefs] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configurações do Cliente</CardTitle>
          <CardDescription>
            Ajuste as preferências e configurações para este cliente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="client-name">Nome do Cliente</Label>
              <Input
                id="client-name"
                defaultValue={client?.name}
                placeholder="Acme Corp"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="client-niche">Nicho / Setor</Label>
              <Input
                id="client-niche"
                defaultValue={client?.niche || ""}
                placeholder="SaaS, E-commerce, etc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="client-audience">Público-Alvo</Label>
              <Textarea
                id="client-audience"
                defaultValue={client?.targetAudience || ""}
                placeholder="Descreva seu público-alvo..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="client-description">Descrição</Label>
              <Textarea
                id="client-description"
                defaultValue={client?.description || ""}
                placeholder="Descrição breve..."
                rows={2}
              />
            </div>
          </div>

          <Button className="w-full">
            Salvar Alterações
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Automações</CardTitle>
          <CardDescription>
            Configure tarefas automáticas para este cliente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="font-medium">Scraping Automático</Label>
              <p className="text-sm text-muted-foreground">
                Coletar conteúdo automaticamente das fontes configuradas
              </p>
            </div>
            <Switch
              checked={isScrapingEnabled}
              onCheckedChange={setIsScrapingEnabled}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="font-medium">Gerar Pautas com IA</Label>
              <p className="text-sm text-muted-foreground">
                Criar sugestões de pautas automaticamente baseadas em novos conteúdos
              </p>
            </div>
            <Switch
              checked={autoGenerateBriefs}
              onCheckedChange={setAutoGenerateBriefs}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Base de Conhecimento</CardTitle>
          <CardDescription>
            Gerencie os documentos e dados que a IA usa para este cliente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
            <div>
              <p className="text-sm font-medium">Documentos Indexados</p>
              <p className="text-xs text-muted-foreground">
                Quantos documentos estão na base de conhecimento
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">0</div>
            </div>
          </div>

          <Button variant="outline" className="w-full">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Limpar Base de Conhecimento
          </Button>
        </CardContent>
      </Card>

      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Zona de Perigo</CardTitle>
          <CardDescription>
            Ações irreversíveis para este cliente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            className="w-full"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Excluir Cliente e Todos os Dados
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
