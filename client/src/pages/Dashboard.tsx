import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useClients } from "@/hooks/use-clients";
import { Users, FileText, ArrowUpRight, Plus, ExternalLink } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { data: clients } = useClients();

  const stats = [
    { label: "Total de Clientes", value: clients?.length || 0, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Pautas Ativas", value: "12", icon: FileText, color: "text-purple-500", bg: "bg-purple-500/10" },
    { label: "Aprovações Pendentes", value: "4", icon: ArrowUpRight, color: "text-amber-500", bg: "bg-amber-500/10" },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Painel"
        description="Visão geral das suas operações de conteúdo."
      >
        <Link href="/clients">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Novo Cliente
          </Button>
        </Link>
      </PageHeader>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: "easeOut", delay: i * 0.05 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card className="card-hover border-border/50 h-full">
              <CardContent className="p-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-display font-bold mt-2">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl ${stat.bg}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Recent Clients Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-display font-bold">Clientes Recentes</h2>
          <Link href="/clients" className="text-sm text-primary hover:underline font-medium flex items-center gap-1">
            Ver Todos <ExternalLink className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clients?.slice(0, 3).map((client, i) => (
            <motion.div
              key={client.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: "easeOut", delay: i * 0.05 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link href={`/clients/${client.id}`}>
                <Card className="card-hover cursor-pointer h-full border-border/50 hover:border-primary/50 transition-colors">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="truncate">{client.name}</span>
                    </CardTitle>
                    <CardDescription className="line-clamp-2">
                      {client.niche || "No niche defined"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>{client.targetAudience || "General audience"}</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
          {(!clients || clients.length === 0) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="col-span-full py-12 text-center bg-card rounded-xl border border-dashed"
            >
              <p className="text-muted-foreground">Nenhum cliente ainda. Adicione o primeiro para começar.</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
