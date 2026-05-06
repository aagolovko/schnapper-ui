import {Injectable} from '@angular/core';
import {Mutation} from 'apollo-angular';
import gql from 'graphql-tag';

@Injectable({
  providedIn: 'root'
})
export class FavoriteArticleQL extends Mutation {
  override document = gql`
    mutation FavoriteArticle($id: ID!) {
      favoriteArticle(id: $id){
        id
        href
      }
    }
  `;
}
