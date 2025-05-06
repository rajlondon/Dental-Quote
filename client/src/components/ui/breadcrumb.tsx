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

interface BreadcrumbLinkProps extends React.HTMLAttributes<HTMLAnchorElement | HTMLSpanElement> {
  href: string;
  children: React.ReactNode;
  isCurrentPage?: boolean;
};

const BreadcrumbLink = React.forwardRef<HTMLAnchorElement | HTMLSpanElement, BreadcrumbLinkProps>(
  ({ href, children, isCurrentPage, className, ...props }, ref) => {
    if (isCurrentPage) {
      return (
        <span 
          ref={ref as React.ForwardedRef<HTMLSpanElement>}
          className={cn("text-foreground font-medium", className)} 
          {...props}
        >
          {children}
        </span>
      );
    }
    
    return (
      <Link 
        to={href}
        className={cn("text-muted-foreground hover:text-foreground transition-colors", className)}
        {...props}
      >
        {children}
      </Link>
    );
  }
);

interface ExtendedBreadcrumbItemProps extends BreadcrumbItemProps {
  separator?: React.ReactNode;
  isLastItem?: boolean;
}

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
            
            const childProps = {
              'aria-current': child.props.isCurrentPage ? 'page' : undefined,
              separator,
              isLastItem: index === childCount - 1,
            } as Partial<ExtendedBreadcrumbItemProps>;
            
            return React.cloneElement(child as React.ReactElement<ExtendedBreadcrumbItemProps>, childProps);
          })}
        </ol>
      </nav>
    );
  }
);

Breadcrumb.displayName = 'Breadcrumb';

const BreadcrumbItem = React.forwardRef<HTMLLIElement, BreadcrumbItemProps & { separator?: React.ReactNode; isLastItem?: boolean }>(
  ({ className, isLastItem, separator, isCurrentPage, children, href, ...props }, ref) => {
    // Split props between li element and potential BreadcrumbLink
    const { className: _, isCurrentPage: __, ...linkProps } = props;
    
    return (
      <li 
        ref={ref} 
        className={cn('inline-flex items-center', className)} 
        {...props}
      >
        {href ? (
          <BreadcrumbLink href={href} isCurrentPage={isCurrentPage} {...linkProps}>
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

// Create a BreadcrumbList component for better semantics
const BreadcrumbList = React.forwardRef<HTMLOListElement, React.HTMLAttributes<HTMLOListElement>>(
  ({ className, ...props }, ref) => {
    return (
      <ol 
        ref={ref}
        className={cn('flex items-center gap-1.5', className)}
        {...props}
      />
    );
  }
);

BreadcrumbList.displayName = 'BreadcrumbList';

// Export the BreadcrumbLink component for direct usage
export { Breadcrumb, BreadcrumbItem, BreadcrumbSeparator, BreadcrumbList, BreadcrumbLink };