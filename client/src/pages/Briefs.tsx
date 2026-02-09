import { useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useClients } from "@/hooks/use-clients";
import { useBriefs } from "@/hooks/use-briefs";
import { useToast } from "@/hooks/use-toast";
import { Calendar, FileText, Plus, Target, TrendingUp, Users, Search, Filter, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
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

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Pautas" 
        description="Gerencie e organize seus briefings de conteúdo."
      >
        <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Gerar Pauta
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
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
                <Label htmlFor="title">Título do Brief *</Label>
                <Input
                  id="title"
                  value={generateForm.title}
                  onChange={(e) => setGenerateForm({ ...generateForm, title: e.target.value })}
                  placeholder="Exemplo: Q2 Marketing Campaign Brief"
                  className="bg-card border-border/50"
                />
              <div className="space-y-2">
                <Label htmlFor="description">Descrição *</Label>
                <Textarea
                  id="description"
                  value={generateForm.description}
                  onChange={(e) => setGenerateForm({ ...generateForm, description: e.target.value })}
                  placeholder="Descreva o conteúdo do brief, objetivos e requisitos..."
                  rows={3}
                  className="bg-card border-border/50"
                />
              <div className="space-y-2">
                <Label htmlFor="targetAudience">Público-Alvo</Label>
                <Input
                  id="targetAudience"
                  value={generateForm.targetAudience}
                  onChange={(e) => setGenerateForm({ ...generateForm, targetAudience: e.target.value })}
                  placeholder="Exemplo: Marketing profissionais de 25-45 anos"
                  className="bg-card border-border/50"
                />
              <div className="space-y-2">
                <Label htmlFor="contentGoal">Objetivo do Conteúdo *</Label>
                <Textarea
                  id="contentGoal"
                  value={generateForm.contentGoal}
                  onChange={(e) => setGenerateForm({ ...generateForm, contentGoal: e.target.value })}
                  placeholder="O que você quer alcançar com este conteúdo?"
                  rows={2}
                  className="bg-card border-border/50"
                />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Gerar Pauta
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </PageHeader>

      {/* Client Selector */}
      <Card className="mb-6 bg-card border-border/50">
        <CardHeader>
          <CardTitle>Selecionar Cliente</CardTitle>
          <CardDescription>
            Selecione um cliente para ver seus briefings de conteúdo.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedClient} onValueChange={setSelectedClient}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um cliente para ver briefs" />
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

      {/* Filters and Search */}
      {selectedClient && (
        <Card className="mb-6 bg-card border-border/50">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search briefs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-card border-border/50"
                />
              </div>
              <div className="w-full md:w-48">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="ready">Ready</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </Card>

      {/* Briefs List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-display font-bold">
            Content Briefs {filteredBriefs && `(${filteredBriefs.length})`}
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
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Link href={`/briefs/${brief.id}`}>
                  <Card className="bg-card border-border/50 hover:border-border cursor-pointer h-full transition-colors">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
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
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground line-clamp-3">
                      {brief.description}
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground truncate">{brief.targetAudience}</span>
                      </div>
                      {brief.contentGoal && (
                        <div className="pt-2 border-t">
                          <p className="text-sm font-medium mb-2">Objetivo:</p>
                          <p className="text-xs text-muted-foreground">
                            {brief.contentGoal}
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
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
            <h3 className="text-lg font-medium mb-2">No briefs found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || filterStatus !== "all" ? "Try adjusting your search or filters to find what you're looking for."
              : "Briefs will appear here once content is collected and analyzed."}
            </p>
          </motion.div>
        )}
      </div>

      {!selectedClient && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.2 }}
          className="py-12 text-center bg-card border-border/50 rounded-xl"
        >
          <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Select a client</h3>
          <p className="text-muted-foreground">
            Escolha um cliente para ver seus briefings de conteúdo.
          </p>
        </motion.div>
      )}
    </div>
  );
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

  const handleGenerateBrief = () => {
    if (!selectedClient) {
      toast({ 
        title: "Error", 
        description: "Please select a client first",
        variant: "destructive" 
      });
      return;
    }

    if (!generateForm.title || !generateForm.description) {
      toast({ 
        title: "Error", 
        description: "Please fill in all required fields",
        variant: "destructive" 
      });
      return;
    }

    // TODO: Implement actual brief generation
    toast({ 
      title: "Feature Coming Soon", 
      description: "Brief generation will be available once Claude API is integrated" 
    });

    setGenerateForm({
      title: "",
      description: "",
      targetAudience: "",
      contentGoal: "",
    });
    setIsGenerateDialogOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-muted/20">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <PageHeader 
          title="Pautas de Conteúdo" 
          description="Gere e gerencie pautas de conteúdo com IA."
        >
          <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Gerar Pauta
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Gerar Nova Pauta de Conteúdo</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="client">Client</Label>
                  <Select value={selectedClient} onValueChange={setSelectedClient}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a client" />
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
                  <Label htmlFor="title">Brief Title *</Label>
                  <Input
                    id="title"
                    value={generateForm.title}
                    onChange={(e) => setGenerateForm({ ...generateForm, title: e.target.value })}
                    placeholder="Example: Q2 Marketing Campaign Brief"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={generateForm.description}
                    onChange={(e) => setGenerateForm({ ...generateForm, description: e.target.value })}
                    placeholder="Describe the content brief objectives and requirements..."
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="targetAudience">Target Audience</Label>
                  <Input
                    id="targetAudience"
                    value={generateForm.targetAudience}
                    onChange={(e) => setGenerateForm({ ...generateForm, targetAudience: e.target.value })}
                    placeholder="Example: Marketing professionals aged 25-45"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contentGoal">Content Goal</Label>
                  <Textarea
                    id="contentGoal"
                    value={generateForm.contentGoal}
                    onChange={(e) => setGenerateForm({ ...generateForm, contentGoal: e.target.value })}
                    placeholder="What do you want to achieve with this content?"
                    rows={2}
                  />
                </div>
                <Button onClick={handleGenerateBrief} className="w-full">
                  <Target className="w-4 h-4 mr-2" />
                  Generate Brief
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </PageHeader>

        {/* Client Selector */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Select Client</CardTitle>
            <CardDescription>
              Choose a client to view their content briefs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedClient} onValueChange={setSelectedClient}>
              <SelectTrigger>
                <SelectValue placeholder="Select a client to view briefs" />
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
                        placeholder="Search briefs..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="w-full md:w-48">
                    <Select value={filterStatus} onValueChange={setFilterStatus}>
                      <SelectTrigger>
                        <SelectValue placeholder="Filter by status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="ready">Ready</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Briefs List */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-display font-bold">
                  Content Briefs {filteredBriefs && `(${filteredBriefs.length})`}
                </h2>
              </div>

              {isLoading ? (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4 animate-pulse" />
                  <p className="text-muted-foreground">Loading briefs...</p>
                </div>
              ) : filteredBriefs && filteredBriefs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredBriefs.map((brief) => (
                    <Link key={brief.id} href={`/briefs/${brief.id}`}>
                      <Card className="card-hover cursor-pointer h-full border-border/50 hover:border-primary/50 transition-colors">
                        <CardHeader>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <Badge variant="outline" className={getStatusColor(brief.status)}>
                              {brief.status}
                            </Badge>
                            <Badge variant="outline" className={getPriorityColor(brief.priority)}>
                              {brief.priority}
                            </Badge>
                          </div>
                          <CardTitle className="text-lg line-clamp-2">{brief.title}</CardTitle>
                          <CardDescription className="line-clamp-3">
                            {brief.description}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            {brief.targetAudience && (
                              <div className="flex items-center gap-2 text-sm">
                                <Users className="w-4 h-4 text-muted-foreground" />
                                <span className="text-muted-foreground truncate">{brief.targetAudience}</span>
                              </div>
                            )}
                            {brief.contentGoal && (
                              <div className="flex items-center gap-2 text-sm">
                                <Target className="w-4 h-4 text-muted-foreground" />
                                <span className="text-muted-foreground line-clamp-2">{brief.contentGoal}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDistanceToNow(new Date(brief.createdAt), { addSuffix: true })}</span>
                            </div>
                            {brief.keyPoints && brief.keyPoints.length > 0 && (
                              <div className="pt-2 border-t">
                                <p className="text-sm font-medium mb-1">Key Points:</p>
                                <ul className="text-sm text-muted-foreground space-y-1">
                                  {brief.keyPoints.slice(0, 2).map((point, index) => (
                                    <li key={index} className="flex items-start gap-1">
                                      <span className="text-primary">•</span>
                                      <span className="line-clamp-1">{point}</span>
                                    </li>
                                  ))}
                                  {brief.keyPoints.length > 2 && (
                                    <li className="text-primary text-xs">...and {brief.keyPoints.length - 2} more</li>
                                  )}
                                </ul>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                <Card className="p-12 text-center">
                  <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">
                    {searchQuery || filterStatus !== "all" ? "No matching briefs" : "No briefs generated yet"}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery || filterStatus !== "all"
                      ? "Try adjusting your search or filters to find what you're looking for."
                      : "Generate your first content brief to get started with AI-powered content planning."}
                  </p>
                  <Button onClick={() => setIsGenerateDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Generate Your First Brief
                  </Button>
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
              Choose a client to view and generate their content briefs.
            </p>
          </Card>
        )}
      </main>
    </div>
  );
}