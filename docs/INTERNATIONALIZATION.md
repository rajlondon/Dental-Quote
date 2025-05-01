# Internationalization (i18n) Guide

This guide explains how to work with translations in the MyDentalFly application.

## Table of Contents

1. [Overview](#overview)
2. [Basic Usage](#basic-usage)
3. [Translation Components](#translation-components)
4. [I18n Providers and Context](#i18n-providers-and-context)
5. [Translation Scripts](#translation-scripts)

## Overview

MyDentalFly uses the [i18next](https://www.i18next.com/) library for internationalization. The application supports multiple languages, including English and Turkish.

Translation files are stored in:
- `public/locales/en/translation.json` for English
- `public/locales/tr/translation.json` for Turkish
- etc.

## Basic Usage

The simplest way to translate text is using the `useTranslation` hook and `t` function:

```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('my.translation.key', 'Default Text')}</h1>
      <p>{t('my.translation.description', 'This is the default description')}</p>
    </div>
  );
}
```

The first argument is the translation key, and the second is the default text (used when the key is not found).

## Translation Components

We've created several components to make translations easier and more consistent:

### Basic Components

```tsx
import { T, TH, TP, TButton, TLabel } from "@/components/ui/i18n-components";

// In your component:
<T>This will be translated</T>
<TH level={2}>Translated Heading</TH>
<TP>Translated paragraph</TP>
<TButton onClick={handleClick}>Submit</TButton>
<TLabel htmlFor="name">Name</TLabel>
```

### With Namespace Context

```tsx
import { I18nProvider, T } from "@/components/ui/i18n-components";

function MyComponent() {
  return (
    <I18nProvider namespace="clinic.quotes">
      {/* All translation keys will be prefixed with "clinic.quotes" */}
      <T>This text will be translated</T>
      <T keyName="specific_key">Custom key text</T>
    </I18nProvider>
  );
}
```

### Higher-Order Components

```tsx
import { withI18n } from "@/components/ui/i18n-wrapper";
import { Card } from "@/components/ui/card";

// Original component with text to translate
function MyCard({ title, children }) {
  return (
    <Card>
      <h2>{title}</h2>
      <div>{children}</div>
    </Card>
  );
}

// Wrapped component with automatic translation
const I18nCard = withI18n(MyCard, 'my.namespace');

// Usage
<I18nCard title="This will be translated">
  This content will also be translated
</I18nCard>
```

## I18n Providers and Context

For larger components or pages, use the namespace provider to set a common prefix:

```tsx
import { I18nProvider } from "@/components/ui/i18n-components";

function PatientPortal() {
  return (
    <I18nProvider namespace="patient.portal">
      {/* All child components will use the "patient.portal" namespace */}
      <Header />
      <Dashboard />
      <Footer />
    </I18nProvider>
  );
}
```

## Translation Scripts

We've created several scripts to help manage translations:

### 1. Extract Translations

```bash
node scripts/i18n-tools.js extract [component_path]
```

This extracts all hardcoded strings from your components and generates a translation keys file.

### 2. Find Missing Translations

```bash
node scripts/i18n-tools.js missing
```

This identifies which translation keys exist in one language but are missing in others.

### 3. Generate Translations

```bash
node scripts/i18n-tools.js generate [source_locale] [target_locale]
```

This generates translation entries for a new language based on an existing one.

### 4. Run All Tools

```bash
node scripts/i18n-tools.js help
```

Shows available commands and options.

## Best Practices

1. **Use Namespaces**: Organize translations by feature or page
2. **Consistent Keys**: Use consistent naming patterns for keys
3. **Default Text**: Always provide default text for fallback
4. **Contextual Components**: Use the specialized components (T, TH, TP) for better code readability
5. **Run Scripts Regularly**: Check for missing translations regularly

## Example: Converting a Component

### Before:

```tsx
function QuotesList() {
  return (
    <div>
      <h1>Quote Requests</h1>
      <p>Manage quote requests sent to your clinic.</p>
      
      {quotes.length === 0 ? (
        <p>No quotes found. New quotes will appear here.</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Patient</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          {/* Table content */}
        </table>
      )}
    </div>
  );
}
```

### After:

```tsx
import { I18nProvider, T, TH, TP } from "@/components/ui/i18n-components";

function QuotesList() {
  return (
    <I18nProvider namespace="clinic.quotes">
      <div>
        <TH level={1}>Quote Requests</TH>
        <TP>Manage quote requests sent to your clinic.</TP>
        
        {quotes.length === 0 ? (
          <TP keyName="no_quotes">No quotes found. New quotes will appear here.</TP>
        ) : (
          <table>
            <thead>
              <tr>
                <th><T>Patient</T></th>
                <th><T>Date</T></th>
                <th><T>Status</T></th>
              </tr>
            </thead>
            {/* Table content */}
          </table>
        )}
      </div>
    </I18nProvider>
  );
}
```

This approach makes the component fully translatable and automatically generates all the required keys.