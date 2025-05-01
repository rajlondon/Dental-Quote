import React, { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

type I18nWrapperProps = {
  children: ReactNode;
  component: React.ElementType;
  namespace?: string;
};

/**
 * I18nWrapper - Automatically wraps a component and its children with translation capabilities
 * 
 * This component recursively processes its children and:
 * 1. Converts string children to translated strings based on a namespace and their content
 * 2. Preserves React Elements and other non-string components
 * 
 * Usage:
 * <I18nWrapper component={Card} namespace="clinic.quotes">
 *   <CardHeader>
 *     <CardTitle>Quote Requests</CardTitle>
 *     <CardDescription>Manage quote requests sent to your clinic.</CardDescription>
 *   </CardHeader>
 * </I18nWrapper>
 * 
 * It will automatically translate "Quote Requests" and "Manage quote requests sent to your clinic."
 * using the keys "clinic.quotes.quote_requests" and a generated key for the description.
 */
export function I18nWrapper({ 
  children, 
  component: Component, 
  namespace = 'common' 
}: I18nWrapperProps) {
  const { t } = useTranslation();

  // Function to recursively process children
  const processChildren = (children: ReactNode, pathPrefix = '') => {
    // If children is a string, translate it
    if (typeof children === 'string') {
      const text = children.trim();
      if (text.length === 0) return children;
      
      // Generate a key based on the text
      const key = text
        .toLowerCase()
        .replace(/[^a-z0-9_\s]/gi, '')
        .replace(/\s+/g, '_')
        .substring(0, 40);
      
      const fullKey = pathPrefix ? `${pathPrefix}.${key}` : key;
      return t(fullKey, text);
    }
    
    // If children is an array, process each child
    if (Array.isArray(children)) {
      return children.map((child, index) => processChildren(child, pathPrefix));
    }
    
    // If children is a React element, process its props and children
    if (React.isValidElement(children)) {
      // Get the display name of the component
      const displayName = children.type.displayName || 
                         (typeof children.type === 'string' ? children.type : 'unknown');
      
      // Create a new namespace path for this component
      const newPathPrefix = pathPrefix ? 
        `${pathPrefix}.${displayName.toLowerCase()}` : 
        `${namespace}.${displayName.toLowerCase()}`;
      
      // Process the children of this element
      const newChildren = processChildren(children.props.children, newPathPrefix);
      
      // Clone the element with the processed children
      return React.cloneElement(children, { ...children.props, children: newChildren });
    }
    
    // For any other type of children, return as is
    return children;
  };

  // Process all children and pass them to the component
  const processedChildren = processChildren(children, namespace);
  
  return <Component>{processedChildren}</Component>;
}

/**
 * withI18n - Higher-Order Component that adds automatic translation to a component
 * 
 * Usage:
 * const I18nCard = withI18n(Card, 'clinic.quotes');
 * 
 * Then use I18nCard as you would use Card, but with automatic translation:
 * <I18nCard>
 *   <CardHeader>
 *     <CardTitle>Quote Requests</CardTitle>
 *     <CardDescription>Manage quote requests sent to your clinic.</CardDescription>
 *   </CardHeader>
 * </I18nCard>
 */
export function withI18n<P>(
  Component: React.ComponentType<P>, 
  namespace: string = 'common'
) {
  const WithI18n = (props: P) => {
    return (
      <I18nWrapper component={Component} namespace={namespace}>
        {props.children}
      </I18nWrapper>
    );
  };
  
  WithI18n.displayName = `withI18n(${Component.displayName || Component.name || 'Component'})`;
  
  return WithI18n;
}