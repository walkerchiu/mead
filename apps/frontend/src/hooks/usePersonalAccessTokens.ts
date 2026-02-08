'use client';

import { useQuery, useMutation } from '@apollo/client/react';
import {
  MY_PERSONAL_ACCESS_TOKENS,
  CREATE_PERSONAL_ACCESS_TOKEN,
  REVOKE_PERSONAL_ACCESS_TOKEN,
  type MyPersonalAccessTokensResponse,
  type CreatePersonalAccessTokenResponse,
  type RevokePersonalAccessTokenResponse,
  type CreatePersonalAccessTokenInput,
} from '@/graphql/personal-access-tokens';

interface UsePersonalAccessTokensOptions {
  authReady?: boolean;
}

export function usePersonalAccessTokens(
  options: UsePersonalAccessTokensOptions = {},
) {
  const { authReady = true } = options;

  const { data, loading, error, refetch } =
    useQuery<MyPersonalAccessTokensResponse>(MY_PERSONAL_ACCESS_TOKENS, {
      skip: !authReady,
      fetchPolicy: 'cache-and-network',
    });

  const [createMutation, { loading: creating }] =
    useMutation<CreatePersonalAccessTokenResponse>(
      CREATE_PERSONAL_ACCESS_TOKEN,
    );

  const [revokeMutation, { loading: revoking }] =
    useMutation<RevokePersonalAccessTokenResponse>(
      REVOKE_PERSONAL_ACCESS_TOKEN,
    );

  const createToken = async (input: CreatePersonalAccessTokenInput) => {
    const result = await createMutation({
      variables: { input },
    });
    await refetch();
    return result.data?.createPersonalAccessToken;
  };

  const revokeToken = async (tokenId: string) => {
    const result = await revokeMutation({
      variables: { tokenId },
    });
    await refetch();
    return result.data?.revokePersonalAccessToken;
  };

  return {
    tokens: data?.myPersonalAccessTokens ?? [],
    loading,
    error,
    refetch,
    createToken,
    creating,
    revokeToken,
    revoking,
  };
}
