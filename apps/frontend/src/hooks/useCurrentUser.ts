import { useQuery } from '@apollo/client/react';
import { ME_QUERY } from '@/lib/graphql';

interface Profile {
  id: string;
  userId: string;
  bio?: string;
  avatar?: string;
  phone?: string;
  address?: string;
  website?: string;
  language?: string;
  createdAt: string;
  updatedAt: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
  profile?: Profile;
}

interface MeQueryData {
  me: User;
}

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

/**
 * 取得當前登入使用者資訊
 */
export function useCurrentUser(options?: { skip?: boolean }) {
  const { data, loading, error, refetch } = useQuery<MeQueryData>(ME_QUERY, {
    skip: options?.skip,
    fetchPolicy: 'cache-first',
  });

  const user: CurrentUser | null = data?.me
    ? {
        id: data.me.id,
        name: data.me.name,
        email: data.me.email,
        avatar: data.me.profile?.avatar,
      }
    : null;

  return {
    user,
    loading,
    error,
    refetch,
  };
}
