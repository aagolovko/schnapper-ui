import gql from 'graphql-tag';

export const filterServiceProfilesQuery = gql`
  query searchProfilesQuery {
    searchProfiles {
      id
      name
      description
      isActive
    }
  }
`;

export const updateSearchProfileMutation = gql`
  mutation updateSearchProfileMutation($id: ID!, $name: String!, $description: String!, $isActive: Boolean!) {
    updateSearchProfile(id: $id, name: $name, description: $description, isActive: $isActive) {
      id
      name
      description
      isActive
    }
  }
`;
