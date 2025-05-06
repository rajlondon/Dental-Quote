import * as React from 'react';
import { cn } from '@/lib/utils';
import { ChevronRight } from 'lucide-react';
import { Link } from 'wouter';

export interface BreadcrumbProps extends React.HTMLAttributes<HTMLDivElement> {
  separator?: React.ReactNode;
}

export interface BreadcrumbItemProps extends React.HTMLAttributes<HTMLLIElement> {
  isCurrentPage?: boolean;
  href?: string;
}

type BreadcrumbLinkProps = {
  href: string;
  children: React.ReactNode;
  isCurrentPage?: boolean;
};

const BreadcrumbLink = ({ href, children, isCurrentPage }: BreadcrumbLinkProps) => {
  if (isCurrentPage) {
    return (
      <span className="text-foreground font-medium">{children}</span>
    );
  }
  
  return (
    <Link 
      to={href}
      className="text-muted-foreground hover:text-foreground transition-colors"
    >
      {children}
    </Link>
  );
};

const Breadcrumb = React.forwardRef<HTMLDivElement, BreadcrumbProps>(
  ({ className, separator = <ChevronRight className="h-4 w-4" />, children, ...props }, ref) => {
    const childCount = React.Children.count(children);
    
    return (
      <nav 
        ref={ref} 
        className={cn('flex items-center text-sm', className)} 
        aria-label="Breadcrumb"
        {...props}
      >
        <ol className="flex items-center gap-1.5">
          {React.Children.map(children, (child, index) => {
            if (!React.isValidElement(child)) return null;
            
            return React.cloneElement(child as React.ReactElement<BreadcrumbItemProps>, {
              'aria-current': child.props.isCurrentPage ? 'page' : undefined,
              separator,
              isLastItem: index === childCount - 1,
            });
          })}
        </ol>
      </nav>
    );
  }
);

Breadcrumb.displayName = 'Breadcrumb';

const BreadcrumbItem = React.forwardRef<HTMLLIElement, BreadcrumbItemProps & { separator?: React.ReactNode; isLastItem?: boolean }>(
  ({ className, isLastItem, separator, isCurrentPage, children, href, ...props }, ref) => {
    return (
      <li 
        ref={ref} 
        className={cn('inline-flex items-center', className)} 
        {...props}
      >
        {href ? (
          <BreadcrumbLink href={href} isCurrentPage={isCurrentPage}>
            {children}
          </BreadcrumbLink>
        ) : (
          <span className={cn(isCurrentPage ? 'text-foreground font-medium' : 'text-muted-foreground')}>
            {children}
          </span>
        )}
        {!isLastItem && <span className="mx-1.5 text-muted-foreground">{separator}</span>}
      </li>
    );
  }
);

BreadcrumbItem.displayName = 'BreadcrumbItem';

const BreadcrumbSeparator = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => {
    return (
      <span 
        ref={ref} 
        className={cn('mx-1.5 text-muted-foreground', className)} 
        {...props} 
      />
    );
  }
);

BreadcrumbSeparator.displayName = 'BreadcrumbSeparator';

export { Breadcrumb, BreadcrumbItem, BreadcrumbSeparator };