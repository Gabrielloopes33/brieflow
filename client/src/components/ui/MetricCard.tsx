
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

interface MetricCardProps {
    title: string;
    value: string;
    change?: string;
    trend?: "up" | "down" | "neutral";
    icon?: React.ReactNode;
}

export function MetricCard({ title, value, change, trend = "neutral", icon }: MetricCardProps) {
    return (
        <div className="bg-surface border border-border p-4 rounded-xl flex flex-col justify-between hover:border-primary/20 transition-colors">
            <div className="flex items-center justify-between mb-2">
                <span className="text-muted-foreground text-sm font-medium">{title}</span>
                {icon && <div className="text-primary/80">{icon}</div>}
            </div>

            <div className="flex items-end justify-between">
                <span className="text-2xl font-mono font-semibold tracking-tight">{value}</span>

                {change && (
                    <div className={`flex items-center text-xs font-mono font-medium ${trend === "up" ? "text-green-500" :
                            trend === "down" ? "text-red-500" : "text-muted-foreground"
                        }`}>
                        {trend === "up" && <ArrowUpRight className="w-3 h-3 mr-1" />}
                        {trend === "down" && <ArrowDownRight className="w-3 h-3 mr-1" />}
                        {trend === "neutral" && <Minus className="w-3 h-3 mr-1" />}
                        {change}
                    </div>
                )}
            </div>
        </div>
    );
}
