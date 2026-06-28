import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { SearchProfile } from '../models/search-profile';

@Injectable({
  providedIn: 'root',
})
export class SearchProfilesService {
  constructor(private http: HttpClient) {}

  getSearchProfiles(): Observable<SearchProfile[]> {
    return this.http.get<SearchProfile[]>(`${environment.apiUrl}/search-profiles`);
  }

  createSearchProfile(profile: Partial<SearchProfile>): Observable<SearchProfile> {
    return this.http.post<SearchProfile>(
      `${environment.apiUrl}/search-profiles`,
      profile
    );
  }

  updateSearchProfile(profileId: string, profile: Partial<SearchProfile>): Observable<SearchProfile> {
    return this.http.put<SearchProfile>(
      `${environment.apiUrl}/search-profiles/${profileId}`,
      profile
    );
  }

  deleteSearchProfile(profileId: string): Observable<any> {
    return this.http.delete(
      `${environment.apiUrl}/search-profiles/${profileId}`
    );
  }
}
