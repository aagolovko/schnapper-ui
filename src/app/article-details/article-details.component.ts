import {Component, OnInit} from '@angular/core';
import {Article} from "src/app/models/article-type";
import {ArticlesService} from "src/app/services/articles.service";

@Component({
  selector: 'app-article-details',
  templateUrl: './article-details.component.html',
  styleUrls: ['./article-details.component.css']
})
export class ArticleDetailsComponent implements OnInit {

  article: Article

  constructor(private articleService: ArticlesService) {}

  ngOnInit() {
    this.articleService.currentArticle.subscribe( a => {
      this.article = a
    })
  }

}
