/**
 * GraphQL Context Type
 *
 * Represents the context object passed to GraphQL resolvers.
 * Contains HTTP request information, user data, DataLoaders, and other request-scoped data.
 */

import { Request, Response } from 'express';
import DataLoader from 'dataloader';
import { User } from '@prisma/client';
import { AccessScope } from '../enums/access-scope.enum';

export interface GraphQLContext {
  req: {
    user?: {
      userId: string;
      sub?: string;
      email?: string;
      accessScopes?: AccessScope[];
      roles?: string[];
      permissions?: string[];
    };
    cookies?: Record<string, string>;
    ip?: string;
    headers?: Record<string, string | string[] | undefined>;
  };
  res?: {
    cookie: (name: string, value: string, options?: unknown) => void;
  };
  /**
   * DataLoader instances for batching and caching database queries
   * Each request creates fresh loader instances to prevent cross-request cache issues
   */
  loaders?: {
    /**
     * User DataLoader (with profile)
     * Usage: const user = await context.loaders.user.load(userId);
     */
    user: DataLoader<string, User | null>;
    /**
     * User DataLoader (basic info only, faster)
     * Usage: const user = await context.loaders.userBasic.load(userId);
     */
    userBasic: DataLoader<string, User | null>;
    /**
     * User DataLoader (by email)
     * Usage: const user = await context.loaders.userByEmail.load(email);
     */
    userByEmail: DataLoader<string, User | null>;
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
      permissions?: string[];
    };
  };
  res: Response;
}
