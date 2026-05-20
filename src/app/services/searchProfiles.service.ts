import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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

  updateSearchProfile(profileId: string, profile: Partial<SearchProfile>): Observable<SearchProfile> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    return this.http.put<SearchProfile>(
      `${environment.apiUrl}/search-profiles/${profileId}`,
      profile,
      { headers }
    );
  }
}
