import { useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { useClients, useCreateClient } from "@/hooks/use-clients";
import { useKnowledgeItems, useDeleteKnowledgeItem } from "@/hooks/use-knowledge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
    Users, 
    BookOpen, 
    Trash2, 
    ExternalLink, 
    X,
    Database,
    Globe,
    Search,
    Bot,
    Map,
    Layers,
    Plus,
    Loader2,
} from "lucide-react";

interface Client {
    id: string;
    name: string;
    description?: string;
    niche?: string;
    target_audience?: string;
    created_at: string;
}

interface KnowledgeItem {
    id: string;
    client_id: string;
    title: string;
    content: string;
    type: "scrape" | "search" | "agent" | "map" | "crawl";
    source_url?: string;
    created_at: string;
}

const typeIcons = {
    scrape: Globe,
    search: Search,
    agent: Bot,
    map: Map,
    crawl: Layers,
};

const typeLabels = {
    scrape: "Scrape",
    search: "Search",
    agent: "Agent",
    map: "Map",
    crawl: "Crawl",
};

export function ClientsPage() {
    const { data: clients, isLoading: clientsLoading } = useClients();
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const { data: knowledgeItems, isLoading: knowledgeLoading } = useKnowledgeItems(selectedClient?.id || "");
    const deleteKnowledgeItem = useDeleteKnowledgeItem();

    const handleDelete = async (itemId: string) => {
        if (confirm("Tem certeza que deseja excluir este item?")) {
            await deleteKnowledgeItem.mutateAsync(itemId);
        }
    };

    return (
        <AppShell>
            <div className="flex h-full gap-6">
                {/* Client List */}
                <div className="flex-1">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-display font-bold text-gradient mb-2">Clientes</h1>
                            <p className="text-muted-foreground text-sm">Gerencie seus clientes e suas bases de conhecimento</p>
                        </div>
                        <CreateClientDialog />
                    </div>

                    {clientsLoading ? (
                        <div className="text-center py-12 text-muted-foreground">
                            Carregando clientes...
                        </div>
                    ) : clients?.length === 0 ? (
                        <div className="text-center py-12">
                            <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                            <p className="text-muted-foreground mb-4">Nenhum cliente cadastrado</p>
                            <CreateClientDialog />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {clients?.map((client: Client) => (
                                <Card 
                                    key={client.id} 
                                    className="feature-card cursor-pointer group"
                                    onClick={() => setSelectedClient(client)}
                                >
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-lg font-display">{client.name}</CardTitle>
                                        {client.niche && (
                                            <Badge variant="secondary" className="w-fit">
                                                {client.niche}
                                            </Badge>
                                        )}
                                    </CardHeader>
                                    <CardContent>
                                        {client.description && (
                                            <CardDescription className="mb-4 line-clamp-2">
                                                {client.description}
                                            </CardDescription>
                                        )}
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Database size={14} />
                                                <span>Base de conhecimento</span>
                                            </div>
                                            <Button 
                                                variant="ghost" 
                                                size="sm"
                                                className="text-primary hover:text-primary hover:bg-primary/10"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedClient(client);
                                                }}
                                            >
                                                Ver Base
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

                {/* Knowledge Base Drawer */}
                {selectedClient && (
                    <div className="w-[400px] border-l border-border/50 bg-card flex flex-col">
                        <div className="p-4 border-b border-border/50 flex items-center justify-between">
                            <div>
                                <h2 className="font-display font-bold text-lg">Base de Conhecimento</h2>
                                <p className="text-sm text-muted-foreground">{selectedClient.name}</p>
                            </div>
                            <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => setSelectedClient(null)}
                            >
                                <X size={18} />
                            </Button>
                        </div>

                        <ScrollArea className="flex-1 p-4">
                            {knowledgeLoading ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    Carregando...
                                </div>
                            ) : knowledgeItems?.length === 0 ? (
                                <div className="text-center py-12">
                                    <BookOpen className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                                    <p className="text-sm text-muted-foreground">Nenhum item salvo</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Use as ferramentas no /chat para adicionar itens
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {knowledgeItems?.map((item: KnowledgeItem) => {
                                        const Icon = typeIcons[item.type];
                                        return (
                                            <Card key={item.id} className="bg-secondary/30 border-border/50">
                                                <CardContent className="p-3">
                                                    <div className="flex items-start gap-3">
                                                        <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                                                            <Icon size={14} className="text-primary" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="text-xs font-medium text-muted-foreground">
                                                                    {typeLabels[item.type]}
                                                                </span>
                                                                <span className="text-xs text-muted-foreground">
                                                                    {new Date(item.created_at).toLocaleDateString('pt-BR')}
                                                                </span>
                                                            </div>
                                                            <h3 className="font-medium text-sm mb-1 truncate">
                                                                {item.title}
                                                            </h3>
                                                            <p className="text-xs text-muted-foreground line-clamp-2">
                                                                {item.content.slice(0, 150)}
                                                                {item.content.length > 150 ? "..." : ""}
                                                            </p>
                                                            {item.source_url && (
                                                                <a 
                                                                    href={item.source_url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-2"
                                                                >
                                                                    <ExternalLink size={10} />
                                                                    Ver fonte
                                                                </a>
                                                            )}
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="shrink-0 h-8 w-8 text-muted-foreground hover:text-destructive"
                                                            onClick={() => handleDelete(item.id)}
                                                            disabled={deleteKnowledgeItem.isPending}
                                                        >
                                                            <Trash2 size={14} />
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </div>
                            )}
                        </ScrollArea>
                    </div>
                )}
            </div>
        </AppShell>
    );
}

// Schema de validação
const clientSchema = z.object({
    name: z.string().min(1, "Nome é obrigatório"),
    niche: z.string().optional(),
    description: z.string().optional(),
    target_audience: z.string().optional(),
});

type ClientFormData = z.infer<typeof clientSchema>;

function CreateClientDialog() {
    const [open, setOpen] = useState(false);
    const { mutate, isPending } = useCreateClient();
    
    const form = useForm<ClientFormData>({
        resolver: zodResolver(clientSchema),
        defaultValues: {
            name: "",
            niche: "",
            description: "",
            target_audience: "",
        },
    });

    const onSubmit = (data: ClientFormData) => {
        mutate(data, {
            onSuccess: () => {
                setOpen(false);
                form.reset();
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-primary hover:bg-primary/90">
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Cliente
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Adicionar Novo Cliente</DialogTitle>
                    <DialogDescription>
                        Crie uma área de trabalho para um novo cliente.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nome do Cliente *</FormLabel>
                                    <FormControl>
                                        <Input 
                                            placeholder="Ex: Acme Corp" 
                                            {...field} 
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="niche"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Nicho / Setor</FormLabel>
                                    <FormControl>
                                        <Input 
                                            placeholder="Ex: SaaS, E-commerce, etc." 
                                            {...field} 
                                            value={field.value || ""}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Descrição</FormLabel>
                                    <FormControl>
                                        <Textarea 
                                            placeholder="Descreva brevemente o cliente..."
                                            {...field}
                                            value={field.value || ""}
                                            rows={3}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="target_audience"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Público-Alvo</FormLabel>
                                    <FormControl>
                                        <Textarea 
                                            placeholder="Descreva o público-alvo deste cliente..."
                                            {...field}
                                            value={field.value || ""}
                                            rows={2}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex gap-3 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1"
                                onClick={() => setOpen(false)}
                            >
                                Cancelar
                            </Button>
                            <Button 
                                type="submit" 
                                className="flex-1"
                                disabled={isPending}
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Criando...
                                    </>
                                ) : (
                                    "Criar Cliente"
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
