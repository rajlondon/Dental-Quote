import React from 'react';
import { Redirect } from 'wouter';

// This is a simple index file that redirects to the appropriate starting page
export default function Index() {
  return <Redirect to="/test-pdf" />;
}