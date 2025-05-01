import React, { createContext, useContext, ReactNode, ComponentType, HTMLAttributes } from 'react';
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
}): JSX.Element {
  return (
    <I18nContext.Provider value={{ namespace }}>
      {children}
    </I18nContext.Provider>
  );
}

/**
 * useI18nNamespace - Hook to get the current translation namespace
 */
export function useI18nNamespace(): I18nContextType {
  return useContext(I18nContext);
}

interface TProps {
  keyName?: string;
  children: string;
  values?: Record<string, unknown>;
  namespace?: string;
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
}: TProps): JSX.Element {
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
  
  return <>{t(fullKey, { defaultValue: children, ...values })}</>;
}

/**
 * withNamespace - HOC to wrap a component with a translation namespace
 * 
 * @example
 * const QuotesPage = withNamespace(BaseQuotesPage, 'clinic.quotes');
 */
export function withNamespace<P extends object>(
  Component: ComponentType<P>,
  namespace: string
): ComponentType<P> {
  // Create a new component that wraps the original in the I18nProvider
  const WithNamespace = (props: P): JSX.Element => (
    <I18nProvider namespace={namespace}>
      <Component {...props} />
    </I18nProvider>
  );
  
  // Set a displayName for better debugging
  const displayName = Component.displayName || Component.name || 'Component';
  WithNamespace.displayName = `withNamespace(${displayName})`;
  
  return WithNamespace;
}

interface THProps extends HTMLAttributes<HTMLHeadingElement> {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  keyName?: string;
  children: string;
}

/**
 * TH - Translated Heading component
 */
export function TH({ 
  level = 1, 
  keyName,
  children,
  ...props
}: THProps): JSX.Element {
  // Type assertion to handle the dynamic heading element creation
  const HeadingTag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  
  // Create the element based on the heading level
  const heading = React.createElement(
    HeadingTag,
    props,
    <T keyName={keyName}>{children}</T>
  );
  
  return heading;
}

interface TPProps extends HTMLAttributes<HTMLParagraphElement> {
  keyName?: string;
  children: string;
}

/**
 * TP - Translated Paragraph component
 */
export function TP({ 
  keyName,
  children,
  ...props
}: TPProps): JSX.Element {
  return (
    <p {...props}>
      <T keyName={keyName}>{children}</T>
    </p>
  );
}

interface TSpanProps extends HTMLAttributes<HTMLSpanElement> {
  keyName?: string;
  children: string;
}

/**
 * TSpan - Translated Span component
 */
export function TSpan({ 
  keyName,
  children,
  ...props
}: TSpanProps): JSX.Element {
  return (
    <span {...props}>
      <T keyName={keyName}>{children}</T>
    </span>
  );
}

interface TLabelProps extends HTMLAttributes<HTMLLabelElement> {
  keyName?: string;
  children: string;
  htmlFor?: string;
}

/**
 * TLabel - Translated Label component
 */
export function TLabel({ 
  keyName,
  children,
  ...props
}: TLabelProps): JSX.Element {
  return (
    <label {...props}>
      <T keyName={keyName}>{children}</T>
    </label>
  );
}

interface TButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  keyName?: string;
  children: string;
}

/**
 * TButton - Translated Button component
 */
export function TButton({ 
  keyName,
  children,
  ...props
}: TButtonProps): JSX.Element {
  return (
    <button {...props}>
      <T keyName={keyName}>{children}</T>
    </button>
  );
}