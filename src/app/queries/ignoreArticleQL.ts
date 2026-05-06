import {Injectable} from '@angular/core';
import {Mutation} from 'apollo-angular';
import gql from 'graphql-tag';

@Injectable({
  providedIn: 'root'
})
export class IgnoreArticleQL extends Mutation {
  override document = gql`
    mutation IgnoreArticle($id: ID!) {
      ignoreArticle(id: $id){
        id
        href
      }
    }
  `;
}
