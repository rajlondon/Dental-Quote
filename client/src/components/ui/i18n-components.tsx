import React, { createContext, useContext, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

// Create a context for the translation namespace
interface I18nContextType {
  namespace: string;
}

const I18nContext = createContext<I18nContextType>({ namespace: 'common' });

/**
 * I18nProvider - Sets up a translation namespace for child components
 * 
 * @example
 * <I18nProvider namespace="clinic.quotes">
 *   <QuotesTable />
 *   <QuoteDetails />
 * </I18nProvider>
 */
export function I18nProvider({ 
  namespace, 
  children 
}: { 
  namespace: string; 
  children: ReactNode 
}) {
  return (
    <I18nContext.Provider value={{ namespace }}>
      {children}
    </I18nContext.Provider>
  );
}

/**
 * useI18nNamespace - Hook to get the current translation namespace
 */
export function useI18nNamespace() {
  return useContext(I18nContext);
}

/**
 * T - Translation component for easy inline translations
 * 
 * @example
 * <T keyName="patient_name">Patient Name</T>
 * 
 * Will use the namespace from context and produce: t('clinic.quotes.patient_name', 'Patient Name')
 */
export function T({ 
  keyName, 
  children,
  values,
  namespace: explicitNamespace
}: { 
  keyName?: string;
  children: string;
  values?: Record<string, any>;
  namespace?: string;
}) {
  const { t } = useTranslation();
  const { namespace: contextNamespace } = useI18nNamespace();
  
  const namespace = explicitNamespace || contextNamespace;
  
  // If a specific key is provided, use it, otherwise generate from the content
  let fullKey: string;
  
  if (keyName) {
    fullKey = `${namespace}.${keyName}`;
  } else {
    // Generate a key from the content
    const generatedKey = children
      .toLowerCase()
      .replace(/[^a-z0-9_\s]/gi, '')
      .replace(/\s+/g, '_')
      .substring(0, 40);
    
    fullKey = `${namespace}.${generatedKey}`;
  }
  
  return <>{t(fullKey, children, values)}</>;
}

/**
 * withNamespace - HOC to wrap a component with a translation namespace
 * 
 * @example
 * const QuotesPage = withNamespace(BaseQuotesPage, 'clinic.quotes');
 */
export function withNamespace<P>(
  Component: React.ComponentType<P>,
  namespace: string
) {
  const WithNamespace = (props: P) => (
    <I18nProvider namespace={namespace}>
      <Component {...props} />
    </I18nProvider>
  );
  
  const displayName = Component.displayName || Component.name || 'Component';
  WithNamespace.displayName = `withNamespace(${displayName})`;
  
  return WithNamespace;
}

/**
 * TH - Translated Heading component
 */
export function TH({ 
  level = 1, 
  keyName,
  children,
  ...props
}: { 
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  keyName?: string;
  children: string;
  [key: string]: any;
}) {
  const Component = `h${level}` as keyof JSX.IntrinsicElements;
  
  return (
    <Component {...props}>
      <T keyName={keyName}>{children}</T>
    </Component>
  );
}

/**
 * TP - Translated Paragraph component
 */
export function TP({ 
  keyName,
  children,
  ...props
}: { 
  keyName?: string;
  children: string;
  [key: string]: any;
}) {
  return (
    <p {...props}>
      <T keyName={keyName}>{children}</T>
    </p>
  );
}

/**
 * TSpan - Translated Span component
 */
export function TSpan({ 
  keyName,
  children,
  ...props
}: { 
  keyName?: string;
  children: string;
  [key: string]: any;
}) {
  return (
    <span {...props}>
      <T keyName={keyName}>{children}</T>
    </span>
  );
}

/**
 * TLabel - Translated Label component
 */
export function TLabel({ 
  keyName,
  children,
  ...props
}: { 
  keyName?: string;
  children: string;
  [key: string]: any;
}) {
  return (
    <label {...props}>
      <T keyName={keyName}>{children}</T>
    </label>
  );
}

/**
 * TButton - Translated Button component
 */
export function TButton({ 
  keyName,
  children,
  ...props
}: { 
  keyName?: string;
  children: string;
  [key: string]: any;
}) {
  return (
    <button {...props}>
      <T keyName={keyName}>{children}</T>
    </button>
  );
}