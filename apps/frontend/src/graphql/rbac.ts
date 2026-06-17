import { gql } from '@apollo/client';

// ==================== 功能權限矩陣（HQ / customer scope 共用） ====================

export const GET_FEATURE_MATRIX = gql`
  query FeatureMatrix($scope: AccessScope!) {
    featureMatrix(scope: $scope) {
      roleId
      name
      displayName
      rank
      locked
      features {
        featureKey
        canRead
        canWrite
      }
    }
  }
`;

export const SET_ROLE_FEATURE_ACCESS = gql`
  mutation SetRoleFeatureAccess($input: SetRoleFeatureAccessInput!) {
    setRoleFeatureAccess(input: $input)
  }
`;

// ==================== Type Definitions ====================

export interface FeatureAccess {
  featureKey: string;
  canRead: boolean;
  canWrite: boolean;
}

export interface RoleFeatureRow {
  roleId: string;
  name: string;
  displayName: string;
  rank: number;
  locked: boolean;
  features: FeatureAccess[];
}

export interface SetRoleFeatureAccessInput {
  roleId: string;
  featureKey: string;
  canRead: boolean;
  canWrite: boolean;
}
