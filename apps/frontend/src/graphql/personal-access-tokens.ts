import { gql } from '@apollo/client';

// ==================== Fragments ====================

export const PERSONAL_ACCESS_TOKEN_FIELDS = gql`
  fragment PersonalAccessTokenFields on PersonalAccessToken {
    id
    name
    tokenPrefix
    scopes
    lastUsedAt
    lastUsedIp
    expiresAt
    createdAt
    revokedAt
  }
`;

// ==================== Queries ====================

export const MY_PERSONAL_ACCESS_TOKENS = gql`
  query MyPersonalAccessTokens {
    myPersonalAccessTokens {
      ...PersonalAccessTokenFields
    }
  }
  ${PERSONAL_ACCESS_TOKEN_FIELDS}
`;

// ==================== Mutations ====================

export const CREATE_PERSONAL_ACCESS_TOKEN = gql`
  mutation CreatePersonalAccessToken($input: CreatePersonalAccessTokenInput!) {
    createPersonalAccessToken(input: $input) {
      token
      personalAccessToken {
        ...PersonalAccessTokenFields
      }
    }
  }
  ${PERSONAL_ACCESS_TOKEN_FIELDS}
`;

export const REVOKE_PERSONAL_ACCESS_TOKEN = gql`
  mutation RevokePersonalAccessToken($tokenId: ID!) {
    revokePersonalAccessToken(tokenId: $tokenId)
  }
`;

// ==================== Types ====================

export interface PersonalAccessToken {
  id: string;
  name: string;
  tokenPrefix: string;
  scopes: string[];
  lastUsedAt: string | null;
  lastUsedIp: string | null;
  expiresAt: string;
  createdAt: string;
  revokedAt: string | null;
}

export interface CreatePersonalAccessTokenInput {
  name: string;
  scopes: string[];
  expiresInDays: number;
}

export interface CreatePersonalAccessTokenResult {
  token: string;
  personalAccessToken: PersonalAccessToken;
}

export interface MyPersonalAccessTokensResponse {
  myPersonalAccessTokens: PersonalAccessToken[];
}

export interface CreatePersonalAccessTokenResponse {
  createPersonalAccessToken: CreatePersonalAccessTokenResult;
}

export interface RevokePersonalAccessTokenResponse {
  revokePersonalAccessToken: boolean;
}
