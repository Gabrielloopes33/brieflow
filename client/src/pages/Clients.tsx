import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertClientSchema, type InsertClient } from "@shared/schema";
import { useClients, useCreateClient } from "@/hooks/use-clients";
import { Plus, Search, Loader2 } from "lucide-react";
import { Link } from "wouter";

export default function Clients() {
  const { data: clients, isLoading } = useClients();
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const filteredClients = clients?.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.niche?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-muted/20">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <PageHeader 
          title="Clientes" 
          description="Gerencie sua lista de clientes e suas configurações."
        >
          <CreateClientDialog open={open} onOpenChange={setOpen} />
        </PageHeader>

        {/* Search */}
        <div className="mb-8 max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Pesquisar clientes..." 
            className="pl-10 bg-card"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredClients?.map((client) => (
              <Link key={client.id} href={`/clients/${client.id}`}>
                <Card className="card-hover cursor-pointer h-full border-border/50">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-bold text-lg mb-3">
                        {client.name[0]}
                      </div>
                    </div>
                    <CardTitle className="text-xl">{client.name}</CardTitle>
                    <CardDescription className="line-clamp-2 min-h-[40px]">
                      {client.description || "Nenhuma descrição fornecida."}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {client.niche && (
                        <span className="bg-secondary px-2.5 py-1 rounded-md text-xs font-medium text-secondary-foreground">
                          {client.niche}
                        </span>
                      )}
                      <span className="bg-secondary px-2.5 py-1 rounded-md text-xs font-medium text-secondary-foreground">
                        {new Date(client.createdAt!).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function CreateClientDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const { mutate, isPending } = useCreateClient();
  const form = useForm<InsertClient>({
    resolver: zodResolver(insertClientSchema),
    defaultValues: { name: "", description: "", niche: "", targetAudience: "" }
  });

  const onSubmit = (data: InsertClient) => {
    mutate(data, {
      onSuccess: () => {
        onOpenChange(false);
        form.reset();
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="shadow-lg shadow-primary/20">
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Cliente
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Adicionar Novo Cliente</DialogTitle>
          <DialogDescription>Crie uma área de trabalho para um novo cliente.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Cliente</FormLabel>
                  <FormControl>
                    <Input placeholder="Acme Corp" {...field} />
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
                    <Input placeholder="SaaS, E-commerce, etc." {...field} value={field.value || ""} />
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
                    <Input placeholder="Brief description..." {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Criar Cliente
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
