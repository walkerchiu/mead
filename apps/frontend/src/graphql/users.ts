import { gql } from '@apollo/client';

// ==================== Fragments ====================

export const USER_BASIC_FRAGMENT = gql`
  fragment UserBasicFields on User {
    id
    name
    email
    accessScopes
    lastLoginAt
    lockedUntil
    createdAt
    updatedAt
    deletedAt
    roles {
      id
      name
      displayName
      scope
    }
  }
`;

export const USER_FULL_FRAGMENT = gql`
  fragment UserFullFields on User {
    ...UserBasicFields
    profile {
      id
      bio
      avatar
      phone
      address
      website
      language
    }
  }
  ${USER_BASIC_FRAGMENT}
`;

// ==================== Queries ====================

export const GET_USERS_PAGINATED = gql`
  query GetUsersPaginated(
    $pagination: PaginationInput!
    $filter: UserFilterInput
    $includeDeleted: Boolean
  ) {
    usersPaginated(
      pagination: $pagination
      filter: $filter
      includeDeleted: $includeDeleted
    ) {
      data {
        ...UserBasicFields
      }
      pageInfo {
        currentPage
        totalPages
        totalCount
        limit
        hasNextPage
        hasPreviousPage
      }
    }
  }
  ${USER_BASIC_FRAGMENT}
`;

// 註：Me / GetUser / GetUserByEmail 等查詢請使用 @/lib/graphql 中的 ME_QUERY 等。
// 本檔案僅保留 HQ 用戶管理介面專用的 mutations。

// ==================== Mutations ====================

export const CREATE_USER = gql`
  mutation CreateUser($input: CreateUserInput!) {
    createUser(input: $input) {
      ...UserBasicFields
    }
  }
  ${USER_BASIC_FRAGMENT}
`;

export const HQ_UPDATE_USER = gql`
  mutation HQUpdateUser($id: String!, $input: HQUpdateUserInput!) {
    hqUpdateUser(id: $id, input: $input) {
      ...UserBasicFields
    }
  }
  ${USER_BASIC_FRAGMENT}
`;

export const HQ_RESET_PASSWORD = gql`
  mutation HQResetPassword($id: String!, $input: HQResetPasswordInput!) {
    hqResetPassword(id: $id, input: $input)
  }
`;

// 註：UpdateMyProfile / UpdateMyProfileDetails 請使用 @/lib/graphql 中的 mutation 定義。

export const CHANGE_PASSWORD = gql`
  mutation ChangePassword($input: ChangePasswordInput!) {
    changePassword(input: $input)
  }
`;

export const SOFT_DELETE_USER = gql`
  mutation SoftDeleteUser($id: String!) {
    softDeleteUser(id: $id) {
      ...UserBasicFields
    }
  }
  ${USER_BASIC_FRAGMENT}
`;

export const RESTORE_USER = gql`
  mutation RestoreUser($id: String!) {
    restoreUser(id: $id) {
      ...UserBasicFields
    }
  }
  ${USER_BASIC_FRAGMENT}
`;

export const LOCK_USER = gql`
  mutation LockUser($id: String!, $input: LockUserInput!) {
    lockUser(id: $id, input: $input) {
      ...UserBasicFields
    }
  }
  ${USER_BASIC_FRAGMENT}
`;

export const UNLOCK_USER = gql`
  mutation UnlockUser($id: String!) {
    unlockUser(id: $id) {
      ...UserBasicFields
    }
  }
  ${USER_BASIC_FRAGMENT}
`;

// ==================== Role Fragments ====================

export const ROLE_FRAGMENT = gql`
  fragment RoleFields on RoleType {
    id
    name
    displayName
    scope
    description
    isSystem
  }
`;

// ==================== Role Queries ====================

export const GET_USER_ROLES = gql`
  query GetUserRoles($userId: String!) {
    userRoles(userId: $userId) {
      id
      role {
        ...RoleFields
      }
      grantedAt
      grantedBy
    }
  }
  ${ROLE_FRAGMENT}
`;

export const GET_ASSIGNABLE_ROLES = gql`
  query GetAssignableRoles {
    assignableRoles {
      ...RoleFields
    }
  }
  ${ROLE_FRAGMENT}
`;

// ==================== Role Mutations ====================

export const ASSIGN_ROLE = gql`
  mutation AssignRole($input: AssignRoleInput!) {
    assignRole(input: $input)
  }
`;

export const REVOKE_ROLE = gql`
  mutation RevokeRole($input: RevokeRoleInput!) {
    revokeRole(input: $input)
  }
`;

// ==================== Type Definitions ====================

export interface UserRole {
  id: string;
  name: string;
  displayName: string;
  scope: string;
}

export interface User {
  id: string;
  name?: string | null;
  email: string;
  accessScopes: string[];
  lastLoginAt?: string | null;
  lockedUntil?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  profile?: UserProfile | null;
  roles?: UserRole[] | null;
}

export interface UserProfile {
  id: string;
  bio?: string | null;
  avatar?: string | null;
  phone?: string | null;
  address?: string | null;
  website?: string | null;
  language?: string | null;
}

export interface PaginatedUsers {
  data: User[];
  pageInfo: {
    currentPage: number;
    totalPages: number;
    totalCount: number;
    limit: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface CreateUserInput {
  email: string;
  name: string;
  password: string;
}

export interface HQUpdateUserInput {
  name?: string;
  email?: string;
}

export interface HQResetPasswordInput {
  newPassword: string;
  revokeAllSessions?: boolean;
}

export interface UpdateUserInput {
  name?: string;
  email?: string;
}

export interface UpdateProfileInput {
  bio?: string;
  avatar?: string;
  phone?: string;
  address?: string;
  website?: string;
  language?: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
  revokeOtherSessions?: boolean;
}

export interface LockUserInput {
  lockDurationMinutes: number;
  reason?: string;
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  LOCKED = 'LOCKED',
  DELETED = 'DELETED',
}

export interface UserFilterInput {
  search?: string;
  accessScope?: string;
  status?: UserStatus;
  roleId?: string;
}

export interface Role {
  id: string;
  name: string;
  displayName: string;
  scope: string;
  description?: string | null;
  isSystem: boolean;
}
