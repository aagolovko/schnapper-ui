// src/app/services/search-profiles.service.ts
import { Injectable } from '@angular/core';
import { Apollo } from 'apollo-angular';
import { filterServiceProfilesQuery, updateSearchProfileMutation } from '../queries/searchProfilesQL';
import { Observable, map } from 'rxjs';
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

    updateSearchProfile(profile: SearchProfile): Observable<SearchProfile> {
        return this.apollo.mutate<{ updateSearchProfile: SearchProfile }>({
            mutation: updateSearchProfileMutation,
            variables: {
                id: profile.id,
                name: profile.name ?? profile.title ?? '',
                description: profile.description ?? profile.notes ?? '',
                isActive: profile.isActive
            }
        }).pipe(
            map(result => {
                if (!result.data?.updateSearchProfile) {
                    throw new Error('Failed to update search profile');
                }

                return result.data.updateSearchProfile;
            })
        );
    }
}
