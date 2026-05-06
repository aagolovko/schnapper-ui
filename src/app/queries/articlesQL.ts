import gql from 'graphql-tag';

export const articleFields = gql`
  fragment articleFields on Article {
    id
    title
    href
    hrefImage
    price
    priceEur
    isFavorite
    location
    createdOn
    searchKeywords
    locationGeocoded {
      latitude
      longitude
    }
  }`;

export const filterArticlesQuery = gql`
  query articlesQuery {
    articles {
      ...articleFields
    }
  } ${articleFields}`;
