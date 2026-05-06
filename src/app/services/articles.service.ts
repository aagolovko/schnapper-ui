import {Injectable, OnDestroy, Renderer2, RendererFactory2} from '@angular/core';
import {Apollo} from 'apollo-angular';
import {filterArticlesQuery} from '../queries/articlesQL';
import {filterArticlesBoundedQuery} from '../queries/articlesBoundedQL';
import {IgnoreArticleQL} from "../queries/ignoreArticleQL";
import {FavoriteArticleQL} from "../queries/favoriteArticleQL";
import {ReplaySubject, Subject} from "rxjs";
import {Article} from "src/app/models/article-type";
import * as Leaflet from 'leaflet';

@Injectable({
  providedIn: 'root'
})
export class ArticlesService implements OnDestroy {

  private renderer: Renderer2;

  readonly unlistener: () => void;

  private articleSource: Subject<Article> = new ReplaySubject<Article>(1)

  currentArticle = this.articleSource.asObservable()

  private currentArticleAsSelection: Article

  // we skip subscriber mechanism for the markers, it is enough
  // that the article change is notified. We assume article/marker
  // are always in sync
  private currentMarkerAsSelection: Leaflet.Marker

  constructor(private apollo: Apollo,
              private rendererFactory: RendererFactory2,
              private ignoreArticleQL: IgnoreArticleQL,
              private favoriteArticleQL: FavoriteArticleQL) {

    this.renderer = this.rendererFactory.createRenderer(null, null);

    this.unlistener = this.renderer.listen('document', 'keydown', (event: KeyboardEvent) => {
      if (event.key === 's') {
        this.ignoreArticle(this.currentArticleAsSelection.id);
        this.currentMarkerAsSelection.remove()
      } else if (event.key === 'f') {
        this.favoriteArticle(this.currentArticleAsSelection.id);
        this.currentMarkerAsSelection.setIcon(
          new Leaflet.Icon({
            iconSize: [10, 10],
            iconAnchor: [0, 0],
            iconUrl: 'assets/red-marker.png'
          })
        )
      } else if (event.key === 'g') {
        window.open(this.currentArticleAsSelection.href, "_blank");
      }
    });
  }

  changeArticle(article: Article) {
    this.currentArticleAsSelection = article
    this.articleSource.next(article)
  }

  changeMarker(marker: Leaflet.Marker) {
    this.currentMarkerAsSelection = marker
  }

  getArticles() {
    return this.apollo.query({
      query: filterArticlesQuery
    });
  }

  getArticlesBounded(bounds: any) {
    return this.apollo.query({
      query: filterArticlesBoundedQuery,
      variables: {
        bounds
      }
    });
  }

  ngOnDestroy() {
    this.unlistener()
  }

  ignoreArticle(pId: string) {
    console.log(`Set ignorance flag for item with id: ${pId}`)
    this.ignoreArticleQL.mutate({
        id: pId
      }
    ).subscribe();
  }

  favoriteArticle(pId: string) {
    console.log(`Set favorite flag for item with id: ${pId}`)
    this.favoriteArticleQL.mutate({
        id: pId
      }
    ).subscribe();
  }
}

