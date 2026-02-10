import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useClients } from "@/hooks/use-clients";
import { Users, FileText, ArrowUpRight, Plus, ExternalLink, TrendingUp } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export default function Dashboard() {
  const { data: clients } = useClients();

  const stats = [
    { 
      label: "Total de Clientes", 
      value: clients?.length || 0, 
      icon: Users, 
      color: "text-blue-500", 
      bg: "bg-blue-500",
      trend: "+2 novos este mes"
    },
    { 
      label: "Pautas Ativas", 
      value: "12", 
      icon: FileText, 
      color: "text-purple-500", 
      bg: "bg-purple-500",
      trend: "+8% vs mes passado"
    },
    { 
      label: "Aprovacoes Pendentes", 
      value: "4", 
      icon: ArrowUpRight, 
      color: "text-amber-500", 
      bg: "bg-amber-500",
      trend: "3 precisam atencao"
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Painel"
        description="Visao geral das suas operacoes de conteudo."
      >
        <Link href="/clients">
          <Button className="md:hidden">
            <Plus className="w-4 h-4 mr-2" />
            Novo Cliente
          </Button>
        </Link>
      </PageHeader>

      {/* Stats Grid - Mobile First */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: "easeOut", delay: i * 0.05 }}
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
          >
            <Card className={cn(
              "card-hover border-border/50 h-full overflow-hidden relative",
              "bg-gradient-to-br from-card to-card/50"
            )}>
              {/* Top accent bar */}
              <div className={cn("absolute top-0 left-0 right-0 h-1", stat.bg)} />
              
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground mb-1">{stat.label}</p>
                    <motion.p 
                      className="text-3xl md:text-4xl font-display font-bold text-foreground tracking-tight"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: i * 0.1 + 0.2 }}
                    >
                      {stat.value}
                    </motion.p>
                    <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground">
                      <TrendingUp className={cn("w-3 h-3", stat.color)} />
                      <span>{stat.trend}</span>
                    </div>
                  </div>
                  <div className={cn(
                    "p-3 rounded-xl shadow-sm",
                    stat.bg.replace('bg-', 'bg-') + "/10"
                  )}>
                    <motion.div
                      animate={{
                        rotate: [0, -10, 10, -10, 0],
                      }}
                      transition={{
                        duration: 0.5,
                        delay: i * 0.1,
                        ease: "easeInOut"
                      }}
                    >
                      <stat.icon className={cn("w-6 h-6", stat.color)} />
                    </motion.div>
                  </div>
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

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {clients?.slice(0, 3).map((client, i) => (
            <motion.div
              key={client.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: "easeOut", delay: i * 0.05 + 0.15 }}
              whileHover={{ scale: 1.02, y: -4 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link href={`/clients/${client.id}`}>
                <Card className={cn(
                  "card-hover cursor-pointer h-full border-border/50 hover:border-primary/50 transition-colors",
                  "bg-gradient-to-br from-card to-card/50"
                )}>
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center justify-between">
                      <span className="truncate text-lg">{client.name}</span>
                      <motion.div
                        whileHover={{ rotate: 45, scale: 1.1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ExternalLink className="w-4 h-4 text-muted-foreground" />
                      </motion.div>
                    </CardTitle>
                    <CardDescription className="line-clamp-2 text-sm">
                      {client.niche || "No niche defined"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className={cn(
                      "flex items-center gap-2 text-sm text-muted-foreground p-2 rounded-lg",
                      "bg-muted/30"
                    )}>
                      <Users className="w-4 h-4" />
                      <span className="truncate">{client.targetAudience || "General audience"}</span>
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
              <motion.div
                animate={{
                  y: [0, -10, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              </motion.div>
              <p className="text-muted-foreground">Nenhum cliente ainda. Adicione o primeiro para comecar.</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
