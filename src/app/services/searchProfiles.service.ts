import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable, of } from 'rxjs';
import { SearchProfile } from '../models/search-profile';

@Injectable({
  providedIn: 'root',
})
export class SearchProfilesService {
  constructor(private http: HttpClient) {}

  getSearchProfiles(): Observable<SearchProfile[]> {
    // TODO: Add search profiles endpoint to backend
    return of([]);
  }

  updateSearchProfile(profile: SearchProfile): Observable<SearchProfile> {
    const token = localStorage.getItem('token');
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    // TODO: Add search profiles update endpoint to backend
    return of(profile);
  }
}
