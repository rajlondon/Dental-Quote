import * as React from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import ROUTES from "@/lib/routes";
import { Link } from "wouter";

export interface BreadcrumbProps extends React.HTMLAttributes<HTMLDivElement> {
  separator?: React.ReactNode;
}

export interface BreadcrumbItemProps extends React.HTMLAttributes<HTMLLIElement> {
  isCurrentPage?: boolean;
  href?: string;
}

const Breadcrumb = React.forwardRef<HTMLDivElement, BreadcrumbProps>(
  ({ className, separator = <ChevronRight className="h-4 w-4" />, children, ...props }, ref) => {
    const childArray = React.Children.toArray(children);
    const childrenWithSeparators = childArray.reduce<React.ReactNode[]>((acc, child, i) => {
      if (i > 0) {
        acc.push(
          <li key={`separator-${i}`} className="mx-1 text-muted-foreground">
            {separator}
          </li>
        );
      }
      acc.push(child);
      return acc;
    }, []);

    return (
      <nav
        ref={ref}
        aria-label="breadcrumb"
        className={cn("flex items-center text-sm", className)}
        {...props}
      >
        <ol className="flex items-center gap-1">{childrenWithSeparators}</ol>
      </nav>
    );
  }
);
Breadcrumb.displayName = "Breadcrumb";

const BreadcrumbItem = React.forwardRef<HTMLLIElement, BreadcrumbItemProps>(
  ({ className, isCurrentPage = false, href, children, ...props }, ref) => {
    return (
      <li
        ref={ref}
        className={cn("inline-flex items-center truncate", className)}
        aria-current={isCurrentPage ? "page" : undefined}
        {...props}
      >
        {href && !isCurrentPage ? (
          <Link
            to={href}
            className="hover:underline hover:text-foreground transition-colors text-muted-foreground"
          >
            {children}
          </Link>
        ) : (
          <span className={isCurrentPage ? "font-semibold text-foreground" : "text-muted-foreground"}>
            {children}
          </span>
        )}
      </li>
    );
  }
);
BreadcrumbItem.displayName = "BreadcrumbItem";

type BreadcrumbLinkProps = {
  href: string;
  children: React.ReactNode;
  isCurrentPage?: boolean;
};

const BreadcrumbLink: React.FC<BreadcrumbLinkProps> = ({
  href,
  children,
  isCurrentPage = false,
}) => {
  return (
    <BreadcrumbItem isCurrentPage={isCurrentPage} href={href}>
      {children}
    </BreadcrumbItem>
  );
};
BreadcrumbLink.displayName = "BreadcrumbLink";

// Path-based breadcrumb that automatically translates the current path
const PathBreadcrumb: React.FC<{ className?: string }> = ({ className }) => {
  const [location] = React.useState(window.location.pathname);
  const segments = location.split("/").filter(Boolean);
  
  // Map special paths to more user-friendly names
  const pathNameMap: Record<string, string> = {
    'portal': 'Patient Portal',
    'clinic-portal': 'Clinic Portal',
    'admin-portal': 'Admin Portal',
    'quotes': 'Quotes',
    'treatment': 'Treatment',
    'appointments': 'Appointments',
    'patients': 'Patients',
    'documents': 'Documents',
    'settings': 'Settings',
    'profile': 'Profile',
  };
  
  // Check if we're in a recognizable portal
  const portalIndex = segments.findIndex(segment => 
    ['portal', 'clinic-portal', 'admin-portal'].includes(segment)
  );
  
  if (segments.length === 0) {
    return null; // Don't show breadcrumb on homepage
  }
  
  // Build breadcrumb paths and names
  const breadcrumbItems = [];
  
  // Always start with Home
  breadcrumbItems.push({ 
    path: ROUTES.HOME, 
    name: 'Home',
    current: segments.length === 0
  });
  
  // Add portal if we're in one
  if (portalIndex >= 0) {
    const portalSegment = segments[portalIndex];
    const portalPath = `/${portalSegment}`;
    breadcrumbItems.push({
      path: portalPath,
      name: pathNameMap[portalSegment] || portalSegment,
      current: segments.length === 1
    });
    
    // If we have more segments beyond the portal, add them
    if (segments.length > portalIndex + 1) {
      let currentPath = portalPath;
      
      for (let i = portalIndex + 1; i < segments.length; i++) {
        const segment = segments[i];
        currentPath += `/${segment}`;
        
        // For the last segment (an ID), we'll customize the name
        if (i === segments.length - 1 && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment)) {
          // This is an ID, use the parent path name + " Detail"
          const parentSegment = segments[i - 1];
          const parentName = pathNameMap[parentSegment] || parentSegment;
          breadcrumbItems.push({
            path: currentPath,
            name: `${parentName.replace(/s$/, '')} Detail`, // Make singular
            current: true
          });
        } else {
          breadcrumbItems.push({
            path: currentPath,
            name: pathNameMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1),
            current: i === segments.length - 1
          });
        }
      }
    }
  } else {
    // Non-portal pages
    let currentPath = '';
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i];
      currentPath += `/${segment}`;
      
      breadcrumbItems.push({
        path: currentPath,
        name: pathNameMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1),
        current: i === segments.length - 1
      });
    }
  }

  return (
    <Breadcrumb className={cn("mb-4", className)}>
      {breadcrumbItems.map((item, index) => (
        <BreadcrumbLink 
          key={index} 
          href={item.path}
          isCurrentPage={item.current}
        >
          {item.name}
        </BreadcrumbLink>
      ))}
    </Breadcrumb>
  );
};

export { 
  Breadcrumb, 
  BreadcrumbItem, 
  BreadcrumbLink,
  PathBreadcrumb
};