import React from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

/**
 * Consistent page header component used across the application
 */
export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  actions,
  className = ''
}) => {
  return (
    <div className={`mb-8 ${className}`}>
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      {description && (
        <p className="mt-2 text-muted-foreground">
          {description}
        </p>
      )}
    </div>
  );
};

export default PageHeader;