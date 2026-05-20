import gql from 'graphql-tag';
import {articleFields} from "src/app/queries/articlesQL";

export const filterArticlesBoundedQuery = gql`
  query articlesBoundedQuery($bounds: Bounds!) {
    articlesBounded(bounds: $bounds) {
      ...articleFields
    }
  } ${articleFields}`;
