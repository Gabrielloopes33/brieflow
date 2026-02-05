import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: ReactNode; // For actions
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-display font-bold text-foreground tracking-tight">
          {title}
        </h1>
        {description && (
          <p className="text-muted-foreground mt-1 text-sm md:text-base">
            {description}
          </p>
        )}
      </div>
      <div className="flex items-center gap-3">
        {children}
      </div>
    </div>
  );
}
