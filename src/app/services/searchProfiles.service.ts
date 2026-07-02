import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { SearchProfile } from '../models/search-profile';
import { HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class SearchProfilesService {
  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  private buildAuthHeaders() {
    const token = this.authService.getToken();
    if (!token || token === 'null' || token === 'undefined') {
      return undefined;
    }

    const trimmedToken = token.trim();
    if (trimmedToken.split('.').length !== 3) {
      return undefined;
    }

    return new HttpHeaders({
      Authorization: `Bearer ${trimmedToken}`,
    });
  }

  getSearchProfiles(): Observable<SearchProfile[]> {
    return this.http.get<SearchProfile[]>(`${environment.apiUrl}/search-profiles`);
  }

  createSearchProfile(profile: Partial<SearchProfile>): Observable<SearchProfile> {
    const headers = this.buildAuthHeaders();
    return this.http.post<SearchProfile>(
      `${environment.apiUrl}/search-profiles`,
      profile,
      headers ? { headers } : {}
    );
  }

  updateSearchProfile(profileId: string, profile: Partial<SearchProfile>): Observable<SearchProfile> {
    const headers = this.buildAuthHeaders();
    return this.http.put<SearchProfile>(
      `${environment.apiUrl}/search-profiles/${profileId}`,
      profile,
      headers ? { headers } : {}
    );
  }

  deleteSearchProfile(profileId: string): Observable<any> {
    const headers = this.buildAuthHeaders();
    return this.http.delete(
      `${environment.apiUrl}/search-profiles/${profileId}`,
      headers ? { headers } : {}
    );
  }
}
