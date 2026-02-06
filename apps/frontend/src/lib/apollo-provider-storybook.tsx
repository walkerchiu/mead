import { ApolloProvider as ApolloProviderBase } from '@apollo/client/react';
import { createApolloClient } from './apollo-client';
import { useMemo } from 'react';

/**
 * Storybook-specific Apollo Provider without 'use client' directive
 */
export function StorybookApolloProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const client = useMemo(() => createApolloClient(), []);

  return <ApolloProviderBase client={client}>{children}</ApolloProviderBase>;
}
