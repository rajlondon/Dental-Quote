import React from 'react';
import { Link } from 'wouter';
import { ChevronRight, HomeIcon } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href: string;
  current?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export default function Breadcrumbs({ items, className = '' }: BreadcrumbsProps) {
  return (
    <nav className={`flex mb-6 text-sm ${className}`} aria-label="Breadcrumb">
      <ol className="flex items-center flex-wrap space-x-1">
        {items.map((item, index) => (
          <li key={item.href + index} className="flex items-center">
            {/* Add separator between items */}
            {index > 0 && (
              <ChevronRight className="h-4 w-4 text-muted-foreground mx-1 flex-shrink-0" />
            )}
            
            {/* Render home icon for first item if it's the home page */}
            {index === 0 && item.label.toLowerCase() === 'home' && (
              <HomeIcon className="h-4 w-4 mr-1" />
            )}

            {/* Make current page non-clickable and styled differently */}
            {item.current ? (
              <span className="font-medium text-foreground" aria-current="page">
                {item.label}
              </span>
            ) : (
              <Link 
                href={item.href} 
                className="text-muted-foreground hover:text-foreground transition-colors duration-200"
              >
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}