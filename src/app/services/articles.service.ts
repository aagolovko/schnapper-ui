import { Injectable, OnDestroy, Renderer2, RendererFactory2 } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { ReplaySubject, Subject } from 'rxjs';
import { Article } from 'src/app/models/article-type';
import * as Leaflet from 'leaflet';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class ArticlesService implements OnDestroy {
  private renderer: Renderer2;
  readonly unlistener: () => void;

  private articleSource: Subject<Article> = new ReplaySubject<Article>(1);
  currentArticle = this.articleSource.asObservable();

  private currentArticleAsSelection: Article;
  private currentMarkerAsSelection: Leaflet.Marker;

  constructor(
    private http: HttpClient,
    private rendererFactory: RendererFactory2,
    private authService: AuthService
  ) {
    this.renderer = this.rendererFactory.createRenderer(null, null);

    this.unlistener = this.renderer.listen(
      'document',
      'keydown',
        (event: KeyboardEvent) => {
        if (event.key === 's') {
          this.deleteArticle(this.currentArticleAsSelection.id);
          this.currentMarkerAsSelection.remove();
        } else if (event.key === 'f') {
          this.favoriteArticle(this.currentArticleAsSelection.id);
          this.currentMarkerAsSelection.setIcon(
            new Leaflet.Icon({
              iconSize: [10, 10],
              iconAnchor: [0, 0],
              iconUrl: 'assets/red-marker.png',
            })
          );
        } else if (event.key === 'g') {
          window.open(this.currentArticleAsSelection.href, '_blank');
        }
      }
    );
  }

  changeArticle(article: Article) {
    this.currentArticleAsSelection = article;
    this.articleSource.next(article);
  }

  changeMarker(marker: Leaflet.Marker) {
    this.currentMarkerAsSelection = marker;
  }

  private buildAuthHeaders() {
    const token = this.authService.getToken();
    if (!token || token === 'null' || token === 'undefined') {
      return undefined;
    }

    const trimmedToken = token.trim();
    if (trimmedToken.split('.').length !== 3) {
      return undefined;
    }

    return new HttpHeaders({
      Authorization: `Bearer ${trimmedToken}`,
    });
  }

  getArticles() {
    return this.http.get<Article[]>(`${environment.apiUrl}/articles`);
  }

  getArticlesBounded(bounds: any) {
    return this.http.get<Article[]>(`${environment.apiUrl}/articles/bounded`, {
      params: { bounds: JSON.stringify(bounds) },
    });
  }

  ngOnDestroy() {
    this.unlistener();
  }

  deleteArticle(pId: string) {
    console.log(`Delete item with id: ${pId}`);
    const headers = this.buildAuthHeaders();
    this.http.delete<any>(`${environment.apiUrl}/articles/${pId}`, headers ? { headers } : {}).subscribe();
  }

  ignoreArticle(pId: string) {
    this.deleteArticle(pId);
  }

  favoriteArticle(pId: string) {
    console.log(`Set favorite flag for item with id: ${pId}`);
    const headers = this.buildAuthHeaders();
    this.http
      .post<any>(`${environment.apiUrl}/articles/${pId}/favorite`, {}, headers ? { headers } : {})
      .subscribe();
  }
}
