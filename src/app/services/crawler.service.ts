import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthService } from './auth.service';

export interface CrawlerStatus {
  isRunning: boolean;
  lastRunAt: string | null;
  nextRunAt: string;
  activeJobs: string[];
}

export interface CrawlerRunResult {
  jobName: string;
}

@Injectable({
  providedIn: 'root',
})
export class CrawlerService {
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

  getCrawlerStatus(): Observable<CrawlerStatus> {
    return this.http.get<CrawlerStatus>(`${environment.apiUrl}/crawling/status`);
  }

  triggerCrawlerRun(): Observable<CrawlerRunResult> {
    const headers = this.buildAuthHeaders();
    return this.http.post<CrawlerRunResult>(
      `${environment.apiUrl}/crawling/run`,
      {},
      headers ? { headers } : {}
    );
  }
}
