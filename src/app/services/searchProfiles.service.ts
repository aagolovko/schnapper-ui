// src/app/services/search-profiles.service.ts
import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { filterServiceProfilesQuery } from '../queries/searchProfilesQL';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SearchProfile } from '../models/search-profile';

@Injectable({
    providedIn: 'root'
})
export class SearchProfilesService {
    constructor(private apollo: Apollo) {}

    getSearchProfiles(): Observable<SearchProfile[]> {
        return this.apollo.query<{ searchProfiles: SearchProfile[] }>({
            query: filterServiceProfilesQuery
        }).pipe(
            map(result => result.data.searchProfiles)
        );
    }
}
