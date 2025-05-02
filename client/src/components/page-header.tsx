import React from "react";

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  breadcrumbs?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  actions,
  breadcrumbs,
}: PageHeaderProps) {
  return (
    <div className="space-y-2.5">
      {breadcrumbs && <div className="mb-2">{breadcrumbs}</div>}
      
      <div className="flex flex-col gap-4 sm:flex-row justify-between sm:items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        
        {actions && <div className="flex-shrink-0">{actions}</div>}
      </div>
    </div>
  );
}