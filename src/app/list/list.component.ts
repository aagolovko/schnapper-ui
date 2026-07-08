import {Component, HostListener, OnInit, ViewChild} from '@angular/core';
import {MatTable, MatTableDataSource} from '@angular/material/table'
import {ArticlesService} from "../services/articles.service";
import {Article} from "../models/article-type";
import {SelectionModel} from '@angular/cdk/collections';
import {LatLngBounds} from "leaflet";
import {MapService} from "src/app/services/map.service";
import {MatPaginator} from "@angular/material/paginator";

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent implements OnInit {

  idSelected: string

  @ViewChild(MatPaginator) paginator: MatPaginator;
  pgIndex= 2
  firstLastButtons= true
  pnDisabled= true
  hdPageSize= true
  pageSizeOptions = "[5, 10, 20]"

  @ViewChild('matTable', {static: true}) matTable!: MatTable<any>

  displayedColumns: string[] = ['select', 'price', 'searchKeywords', 'image', 'locationStr', 'title'];

  dataSource = new MatTableDataSource<Article>([]);

  selection = new SelectionModel<Article>(true, []);

  constructor(
    public articlesService: ArticlesService,
    private mapService: MapService
  ) {
  }

  ngOnInit() {
    this.mapService.currentMapBounds.subscribe(mapBounds => {
      this.loadArticles(mapBounds)
      this.matTable.renderRows()
    })
  }

  @HostListener('mouseover', ['$event'])
  onMouseOver(event: any) {
    if (event.target.localName == "td" && event.target.getAttribute("id")) {
      const mouseIsOnId = event.target.getAttribute("id")
      if (mouseIsOnId && this.idSelected != mouseIsOnId) {
        this.idSelected = mouseIsOnId
      }
    }
  }

  loadArticles(mapBounds: LatLngBounds) {
    this.articlesService.getArticlesBounded(mapBounds).subscribe(articles => {
      console.log(`Fetched articles: ${articles.length}`);

      const visibleArticles = articles.filter((article) => !article.isFavorite);
      this.dataSource = new MatTableDataSource<Article>(visibleArticles);

      this.dataSource.paginator = this.paginator;
      this.selection.clear();
    });
  }

  doIgnore(article: any) {
    this.articlesService.deleteArticle(article.id);
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  ignoreSelected() {
    console.log("Number of articles to be ignored: " + this.selection.selected.length)
    this.selection.selected.forEach((article: Article) => {
      this.articlesService.ignoreArticle(article.id)
    })
    const deletedIds = new Set(this.selection.selected.map((article: Article) => article.id));
    this.dataSource.data = this.dataSource.data.filter((article) => !deletedIds.has(article.id));
    this.selection.clear();
  }

  favoriteSelected() {
    console.log("Number of articles to be favoritized: " + this.selection.selected.length)
    this.selection.selected.forEach((article: Article) => {
      this.articlesService.favoriteArticle(article.id);
      article.isFavorite = true;
    })
    const favoriteIds = new Set(this.selection.selected.map((article: Article) => article.id));
    this.dataSource.data = this.dataSource.data.filter((article) => !favoriteIds.has(article.id));
    this.selection.clear();
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach((row: Article) => this.selection.select(row));
  }

  revertSelection() {
    this.dataSource.data.forEach((row: Article) => {
      if (this.selection.isSelected(row)) {
        this.selection.deselect(row)
      } else {
        this.selection.select(row)
      }

    });
  }

  logSelection() {
    this.selection.selected.forEach((s: Article) => console.log(s.href));
  }
}
