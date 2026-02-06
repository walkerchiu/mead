/**
 * GraphQL Context Type
 *
 * Represents the context object passed to GraphQL resolvers.
 * Contains HTTP request information, user data, and other request-scoped data.
 */

import { Request, Response } from 'express';
import { AccessScope } from '../enums/access-scope.enum';

export interface GraphQLContext {
  req: {
    user?: {
      userId: string;
      sub?: string;
      email?: string;
      accessScopes?: AccessScope[];
      roles?: string[];
    };
    cookies?: Record<string, string>;
    ip?: string;
    headers?: Record<string, string | string[] | undefined>;
  };
  res?: {
    cookie: (name: string, value: string, options?: unknown) => void;
  };
}

/**
 * Extended GraphQL Context with full Express Request and Response
 * Use this for resolvers that need access to Express-specific features
 */
export interface GraphQLContextWithExpress {
  req: Request & {
    user?: {
      userId: string;
      sub?: string;
      email?: string;
      accessScopes?: AccessScope[];
      roles?: string[];
    };
  };
  res: Response;
}
