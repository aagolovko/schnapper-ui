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
