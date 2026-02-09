import { useSources } from '@/hooks/use-sources';
import { useBriefs } from '@/hooks/use-briefs';
import { useContents } from '@/hooks/use-contents';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Globe, FileText, Sparkles, ArrowRight, Calendar, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'wouter';

interface OverviewTabProps {
  clientId: string;
}

export function OverviewTab({ clientId }: OverviewTabProps) {
  const { data: sources, isLoading: loadingSources } = useSources(clientId);
  const { data: briefs, isLoading: loadingBriefs } = useBriefs(clientId);
  const { data: contents, isLoading: loadingContents } = useContents(clientId);

  const isLoading = loadingSources || loadingBriefs || loadingContents;

  const metrics = [
    {
      label: 'Fontes',
      value: sources?.length || 0,
      icon: Globe,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      href: `?tab=sources`,
    },
    {
      label: 'Conteúdos',
      value: contents?.length || 0,
      icon: FileText,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      href: `?tab=contents`,
    },
    {
      label: 'Pautas',
      value: briefs?.length || 0,
      icon: Sparkles,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      href: `?tab=briefs`,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Link
              key={metric.label}
              to={metric.href}
              className="group"
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
                whileHover={{ y: -4, scale: 1.02 }}
                className="card-hover cursor-pointer"
              >
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className={cn("p-3 rounded-lg", metric.bgColor)}>
                        <Icon className={cn("w-5 h-5", metric.color)} />
                      </div>
                      <motion.div
                        animate={{ rotate: [0, 5, -5, 0] }}
                        transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
                      >
                        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                      </motion.div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold mb-1">
                      {isLoading ? '...' : metric.value}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {metric.label}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>
            Execute tarefas comuns para este cliente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Link href={`?tab=sources`}>
            <Button
              variant="outline"
              className="w-full justify-start gap-2 group"
            >
              <Globe className="w-4 h-4" />
              <span>Gerenciar Fontes</span>
              <ArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </Button>
          </Link>
          <Link href={`?tab=briefs`}>
            <Button
              variant="outline"
              className="w-full justify-start gap-2 group"
            >
              <Sparkles className="w-4 h-4" />
              <span>Criar Nova Pauta</span>
              <ArrowRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-muted-foreground" />
            Atividade Recente
          </CardTitle>
          <CardDescription>
            Últimas atualizações e criações
          </CardDescription>
        </CardHeader>
        <CardContent>
          {briefs && briefs.length > 0 ? (
            <div className="space-y-3">
              {briefs.slice(0, 5).map((brief) => (
                <div
                  key={brief.id}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="h-8 w-8 rounded bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">
                      {brief.title}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(brief.createdAt!).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                </div>
              ))}
              {briefs.length > 5 && (
                <Link href={`?tab=briefs`}>
                  <Button variant="ghost" className="w-full text-sm">
                    Ver todas as pautas
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p className="text-sm">Nenhuma atividade ainda</p>
              <p className="text-xs mt-1">
                Comece adicionando fontes ou criando pautas
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
