import {AfterViewInit, Component, HostListener, Injectable} from '@angular/core';
import * as Leaflet from 'leaflet';
import {ArticlesService} from "../services/articles.service";
import {Article} from "../models/article-type";
import {MapService} from "src/app/services/map.service";
import {LatLngBounds} from "leaflet";

@Component({
  selector: 'app-map-view',
  templateUrl: './map-view.component.html',
  styleUrls: ['./map-view.component.css']
})
export class MapViewComponent implements AfterViewInit {

  private map: Leaflet.Map

  private mapGeoToCounter: Map<string, number> = new Map<string, number>()

  boundsAsJson: string

  /// HOME
  latHome = 48.113104787224046
  lngHome = 11.493555422691466


  @HostListener('document:click', ['$event']) click(event: any) {
    const articleId = event.target.getAttribute("data-article-id")
    if (articleId && event.target.classList.contains("ignore-link")) {
      console.log(`Ignoring article ...`);
      this.doIgnoreById(articleId)
      event.target.parentElement.hidden = true
    } else if (articleId && event.target.classList.contains("favorite-link")) {
      console.log(`Favorite article ...`);
      this.doFavoriteById(articleId)
      event.target.parentElement.hidden = true

    }
  }

  constructor(
    private articlesService: ArticlesService,
    private mapService: MapService

  ) {}

  private initMap(): void {
    // let latCenter = 48.12038289569592;
    // let lngCenter = 11.493555422691466;

    const latCenter = 48.0492263395389;
    const lngCenter = 10.871405214467298;


    this.map = Leaflet.map('map', {
      center: [this.latHome, this.lngHome],
      zoom: 13
    });

    const tiles = Leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      minZoom: 3,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    });

    tiles.addTo(this.map);

    let markerHome = new Leaflet.Marker(new Leaflet.LatLng(this.latHome, this.lngHome), {
      icon: new Leaflet.Icon({
        iconSize: [10, 10],
        iconAnchor: [0, 0],
        iconUrl: 'assets/green-marker.png',
      }),
      title: 'Home'
    } as Leaflet.MarkerOptions)
    markerHome.addTo(this.map)


    this.map.on('moveend', (event) => {
      const bounds = this.map.getBounds();
      this.boundsAsJson = JSON.stringify(bounds)

      this.articlesService.getArticlesBounded(bounds).subscribe(articles => {
        console.log(`Fetched articles: ${articles.length}`);
        this.putArticlesOntoMap(articles);
      });
      this.mapService.mapBoundsSource.next(bounds)
    });

    const bounds = this.map.getBounds();
    this.boundsAsJson = JSON.stringify(bounds);
    this.articlesService.getArticlesBounded(bounds).subscribe(articles => {
      console.log(`Fetched articles: ${articles.length}`);
      this.putArticlesOntoMap(articles);
    });
    this.mapService.mapBoundsSource.next(bounds);
  }

  private putArticlesOntoMap(articles: Array<Article>) {

    this.mapGeoToCounter.clear()
    this.removeAllMarkers()

    articles.forEach(it => {

      let lat: number = it.locationGeocoded.latitude
      let lon: number = it.locationGeocoded.longitude

      const key = `${lat},${lon}`;
      if (!this.mapGeoToCounter.has(key)) {
        this.mapGeoToCounter.set(`${lat},${lon}`, 1)
      } else {
        const counter = this.mapGeoToCounter.get(key)!
        lat = Number(lat) + 0.0001 * counter * 5
        lon = Number(lon) + 0.0001 * counter * 5
        this.mapGeoToCounter.set(key, counter + 1)
      }

      let marker = new Leaflet.Marker(new Leaflet.LatLng(lat, lon), {
        icon: new Leaflet.Icon({
          iconSize: [10, 10],
          iconAnchor: [0, 0],
          iconUrl: it.isFavorite ? 'assets/red-marker.png' : 'assets/blue-marker.png',
        }),
        title: `${it.title}`
      } as Leaflet.MarkerOptions)

      marker.on('mouseover', e => {
        console.debug(`Article: ${it.title}`)
        this.articlesService.changeArticle(it)
        this.articlesService.changeMarker(marker)
      });

      marker.addTo(this.map)
    })
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  doIgnore(article: any) {
    this.articlesService.ignoreArticle(article.id);
  }

  doIgnoreById(articleId: string) {
    this.articlesService.ignoreArticle(articleId);
  }

  doFavoriteById(articleId: string) {
    this.articlesService.favoriteArticle(articleId);
  }

  removeAllMarkers(): void {
    this.map.eachLayer((layer) => {
      if (layer instanceof Leaflet.Marker) {
        this.map.removeLayer(layer as Leaflet.Marker);
      }
    });
  }

}
