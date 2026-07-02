import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface GoogleAuthUser {
  sub: string;
  email?: string;
  name?: string;
  picture?: string;
}

export interface GoogleAuthResponse {
  token: string;
  user: GoogleAuthUser;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly tokenStorageKey = 'token';
  private readonly userStorageKey = 'google-user';

  constructor(private http: HttpClient) {}

  loginWithGoogleCredential(credential: string): Observable<GoogleAuthResponse> {
    return this.http
      .post<GoogleAuthResponse>(`${environment.apiUrl}/auth/google`, {
        credential,
      })
      .pipe(
        tap((response) => {
          this.setToken(response.token);
          this.setUser(response.user);
        })
      );
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenStorageKey);
  }

  setToken(token: string): void {
    localStorage.setItem(this.tokenStorageKey, token);
  }

  clearToken(): void {
    localStorage.removeItem(this.tokenStorageKey);
    localStorage.removeItem(this.userStorageKey);
  }

  getUser(): GoogleAuthUser | null {
    const raw = localStorage.getItem(this.userStorageKey);
    if (!raw) {
      return null;
    }

    try {
      return JSON.parse(raw) as GoogleAuthUser;
    } catch {
      return null;
    }
  }

  setUser(user: GoogleAuthUser): void {
    localStorage.setItem(this.userStorageKey, JSON.stringify(user));
  }

  isLoggedIn(): boolean {
    const token = this.getToken();
    return Boolean(token && token.split('.').length === 3);
  }
}
