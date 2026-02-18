import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useClients } from "@/hooks/use-clients";
import { useBriefs } from "@/hooks/use-briefs";
import { useToast } from "@/hooks/use-toast";
import { Calendar, FileText, Plus, Target, TrendingUp, Users, Search, Filter, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Link } from "wouter";
import { motion } from "framer-motion";

export default function Briefs() {
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [generateForm, setGenerateForm] = useState({
    title: "",
    description: "",
    targetAudience: "",
    contentGoal: "",
  });

  const { data: clients } = useClients();
  const { data: briefs, isLoading } = useBriefs(selectedClient);
  const { toast } = useToast();

  const filteredBriefs = briefs?.filter(brief => {
    const matchesSearch = brief.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          brief.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = filterStatus === "all" || brief.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
      case "ready":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "in_progress":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "completed":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "medium":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "low":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 border-gray-500/20";
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Pautas"
        description="Gere e gerencie pautas de conteudo."
      >
        <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Gerar Pauta
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Gerar Nova Pauta</DialogTitle>
            </DialogHeader>
            <form className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="client">Cliente</Label>
                <Select value={selectedClient} onValueChange={setSelectedClient}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente" />
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
              <div className="space-y-2">
                <Label htmlFor="title">Titulo *</Label>
                <Input
                  id="title"
                  value={generateForm.title}
                  onChange={(e) => setGenerateForm({ ...generateForm, title: e.target.value })}
                  placeholder="Exemplo: Campanha de Marketing Q2"
                  className="bg-card border-border/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descricao *</Label>
                <Textarea
                  id="description"
                  value={generateForm.description}
                  onChange={(e) => setGenerateForm({ ...generateForm, description: e.target.value })}
                  placeholder="Descreva o conteúdo da pauta, objetivos e requisitos..."
                  rows={3}
                  className="bg-card border-border/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetAudience">Publico-Alvo</Label>
                <Input
                  id="targetAudience"
                  value={generateForm.targetAudience}
                  onChange={(e) => setGenerateForm({ ...generateForm, targetAudience: e.target.value })}
                  placeholder="Exemplo: Profissionais de marketing de 25-45 anos"
                  className="bg-card border-border/50"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contentGoal">Objetivo do Conteudo *</Label>
                <Textarea
                  id="contentGoal"
                  value={generateForm.contentGoal}
                  onChange={(e) => setGenerateForm({ ...generateForm, contentGoal: e.target.value })}
                  placeholder="O que você quer alcançar com este conteúdo?"
                  rows={2}
                  className="bg-card border-border/50"
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Gerar Pauta
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </PageHeader>

      <Card className="mb-6 bg-card border-border/50">
        <CardHeader>
          <CardTitle>Selecionar Cliente</CardTitle>
          <CardDescription>
            Escolha um cliente para visualizar e gerenciar suas pautas de conteudo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedClient} onValueChange={setSelectedClient}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um cliente para ver pautas" />
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
          <Card className="mb-6 bg-card border-border/50">
            <CardContent className="p-4 md:p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    placeholder="Buscar pautas..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-card border-border/50"
                  />
                </div>
                <div className="w-full sm:w-48">
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filtrar por status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os Status</SelectItem>
                      <SelectItem value="draft">Rascunho</SelectItem>
                      <SelectItem value="ready">Pronto</SelectItem>
                      <SelectItem value="in_progress">Em Progresso</SelectItem>
                      <SelectItem value="completed">Concluído</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-display font-bold">
                Pautas de Conteúdo {filteredBriefs && `(${filteredBriefs.length})`}
              </h2>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : filteredBriefs && filteredBriefs.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {filteredBriefs.map((brief, index) => (
                  <motion.div
                    key={brief.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, ease: "easeOut", delay: index * 0.05 }}
                    whileHover={{ scale: 1.02, y: -4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Link href={`/briefs/${brief.id}`}>
                      <Card className="bg-card border-border/50 hover:border-primary/50 cursor-pointer h-full transition-colors">
                        <CardHeader className="mb-3">
                          <div className="flex justify-between items-start gap-2">
                            <Badge variant="outline" className={getStatusColor(brief.status)}>
                              {brief.status}
                            </Badge>
                            <Badge variant="outline" className={getPriorityColor(brief.priority)}>
                              {brief.priority}
                            </Badge>
                          </div>
                          <CardTitle className="text-lg line-clamp-2">{brief.title}</CardTitle>
                          <div className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(brief.createdAt), { addSuffix: true })}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground line-clamp-3 mb-3">
                            {brief.description}
                          </p>
                          {brief.targetAudience && (
                            <div className="flex items-center gap-2 text-sm">
                              <Users className="w-4 h-4 text-muted-foreground" />
                              <span className="text-muted-foreground truncate">{brief.targetAudience}</span>
                            </div>
                          )}
                          {brief.contentGoal && (
                            <p className="text-sm font-medium mt-2">
                              Objetivo: {brief.contentGoal}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                className="col-span-full py-12 text-center bg-card border-border/50 rounded-xl"
              >
                <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  {searchQuery || filterStatus !== "all" ? "Nenhuma pauta encontrada" : "Nenhuma pauta ainda"}
                </h3>
                <p className="text-muted-foreground mb-4">
                    {searchQuery || filterStatus !== "all"
                    ? "Tente ajustar sua busca ou filtros para encontrar o que procura."
                    : "Pautas aparecerão aqui assim que você gerar seus primeiros briefings de conteúdo."
                }
                </p>
              </motion.div>
            )}
          </div>
        </>
      )}

      {!selectedClient && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="py-12 text-center bg-card border-border/50 rounded-xl"
        >
          <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Selecione um cliente</h3>
          <p className="text-muted-foreground">
            Escolha um cliente para visualizar e gerenciar suas pautas de conteudo.
          </p>
        </motion.div>
      )}
    </div>
  );
}
