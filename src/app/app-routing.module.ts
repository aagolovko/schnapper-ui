import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {MapViewComponent} from "./map-view/map-view.component";
import {SearchProfilesComponent} from "./search-profiles/search-profiles.component";

const routes: Routes = [
  { path: '', redirectTo: '/map-view', pathMatch: 'full' },
  { path: 'map-view', component: MapViewComponent },
  { path: 'searches', component: SearchProfilesComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
