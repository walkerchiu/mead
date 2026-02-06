'use client';

import { ApolloProvider as ApolloProviderBase } from '@apollo/client/react';
import { createApolloClient } from './apollo-client';
import { useMemo } from 'react';

export function ApolloProvider({ children }: { children: React.ReactNode }) {
  const client = useMemo(() => createApolloClient(), []);

  return <ApolloProviderBase client={client}>{children}</ApolloProviderBase>;
}
