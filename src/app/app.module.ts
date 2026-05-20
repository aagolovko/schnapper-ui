import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {GraphQLModule} from './graphql.module';
import {HttpClientModule} from '@angular/common/http';
import {ListComponent} from './list/list.component';
import {MapViewComponent} from './map-view/map-view.component';
import {SearchProfilesComponent} from './search-profiles/search-profiles.component';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {ArticleDetailsComponent} from './article-details/article-details.component';
import {MatCheckboxModule} from '@angular/material/checkbox';
import {FormsModule} from "@angular/forms";
import {MatPaginatorModule} from "@angular/material/paginator";
import {MatTableModule} from "@angular/material/table";
import {MatButtonModule} from "@angular/material/button";
import {MatIconModule} from "@angular/material/icon";
import {KeywordsOverviewComponent} from './keywords-overview/keywords-overview.component';
import {SearchProfileEditorComponent} from './search-profile-editor/search-profile-editor.component';

@NgModule({
    declarations: [
        AppComponent,
        ListComponent,
        MapViewComponent,
        ArticleDetailsComponent,
        KeywordsOverviewComponent,
        SearchProfilesComponent,
        SearchProfileEditorComponent
    ],
    imports: [
        MatTableModule,
        MatCheckboxModule,
        MatButtonModule,
        MatPaginatorModule,
        MatIconModule,
        FormsModule,
        MatPaginatorModule,
        BrowserModule,
        AppRoutingModule,
        GraphQLModule,
        HttpClientModule,
        NgbModule
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule {
}
