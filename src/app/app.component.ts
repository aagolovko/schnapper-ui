import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { environment } from 'src/environments/environment';
import { AuthService, GoogleAuthUser } from './services/auth.service';
import { CrawlerService, CrawlerStatus } from './services/crawler.service';

interface GoogleCredentialResponse {
  credential?: string;
}

interface GoogleButtonConfig {
  theme?: 'outline' | 'filled_blue' | 'filled_black';
  size?: 'large' | 'medium' | 'small';
  text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
  shape?: 'rectangular' | 'pill' | 'circle' | 'square';
  width?: number;
}

interface GoogleIdApi {
  initialize(options: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
  }): void;
  renderButton(element: HTMLElement, options: GoogleButtonConfig): void;
  disableAutoSelect(): void;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: GoogleIdApi;
      };
    };
  }
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, AfterViewInit, OnDestroy {
  title = 'my-angular';
  readonly googleClientId = environment.googleClientId;
  user: GoogleAuthUser | null = null;
  crawlerStatus: CrawlerStatus | null = null;
  crawlerStatusError = '';
  crawlerActionMessage = '';
  crawlerActionError = '';
  crawlerBusy = false;
  signInMessage = '';
  signInError = '';
  googleReady = false;
  private googleInitAttempts = 0;
  private crawlerStatusTimer?: number;

  @ViewChild('googleButton', { static: false })
  googleButton?: ElementRef<HTMLDivElement>;

  constructor(
    private authService: AuthService,
    private crawlerService: CrawlerService
  ) {
    this.user = this.authService.getUser();
  }

  ngOnInit(): void {
    this.canonicalizeDevOrigin();
    this.refreshCrawlerStatus();
    this.crawlerStatusTimer = window.setInterval(() => this.refreshCrawlerStatus(), 60000);
  }

  ngAfterViewInit(): void {
    this.renderGoogleButton();
  }

  ngOnDestroy(): void {
    if (this.crawlerStatusTimer) {
      window.clearInterval(this.crawlerStatusTimer);
    }
  }

  signOut(): void {
    this.authService.clearToken();
    this.user = null;
    this.signInMessage = 'Signed out';
    this.signInError = '';
    window.google?.accounts.id.disableAutoSelect();
  }

  triggerCrawler(): void {
    this.crawlerBusy = true;
    this.crawlerActionError = '';
    this.crawlerActionMessage = 'Starting crawler...';

    this.crawlerService.triggerCrawlerRun().subscribe({
      next: ({ jobName }) => {
        this.crawlerActionMessage = `Triggered ${jobName}`;
        this.crawlerBusy = false;
        this.refreshCrawlerStatus();
      },
      error: (err) => {
        console.error('Crawler trigger failed:', err);
        this.crawlerActionError = 'Crawler trigger failed';
        this.crawlerActionMessage = '';
        this.crawlerBusy = false;
        this.refreshCrawlerStatus();
      },
    });
  }

  private renderGoogleButton(): void {
    const google = window.google?.accounts?.id;
    const button = this.googleButton?.nativeElement;

    if (!google || !button) {
      if (this.googleInitAttempts < 10) {
        this.googleInitAttempts += 1;
        window.setTimeout(() => this.renderGoogleButton(), 250);
        return;
      }

      this.signInError = 'Google sign-in script is not loaded';
      return;
    }

    google.initialize({
      client_id: this.googleClientId,
      callback: (response) => this.handleGoogleCredential(response),
    });

    button.innerHTML = '';
    google.renderButton(button, {
      theme: 'outline',
      size: 'large',
      text: 'signin_with',
      shape: 'pill',
      width: 220,
    });
    this.googleReady = true;
  }

  private canonicalizeDevOrigin(): void {
    const hostname = window.location.hostname;
    if (hostname !== '127.0.0.1' && hostname !== '::1') {
      return;
    }

    const nextUrl = new URL(window.location.href);
    nextUrl.hostname = 'localhost';
    window.location.replace(nextUrl.toString());
  }

  private refreshCrawlerStatus(): void {
    this.crawlerService.getCrawlerStatus().subscribe({
      next: (status) => {
        this.crawlerStatus = status;
        this.crawlerStatusError = '';
      },
      error: (err) => {
        console.error('Crawler status failed:', err);
        this.crawlerStatusError = 'Crawler status unavailable';
      },
    });
  }

  formatTimestamp(value: string | null | undefined): string {
    if (!value) {
      return '-';
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return '-';
    }

    return parsed.toLocaleString();
  }

  private handleGoogleCredential(response: GoogleCredentialResponse): void {
    if (!response.credential) {
      this.signInError = 'Google sign-in did not return a credential';
      return;
    }

    this.signInError = '';
    this.signInMessage = 'Signing in...';

    this.authService.loginWithGoogleCredential(response.credential).subscribe({
      next: ({ user }) => {
        this.user = user;
        this.signInMessage = `Signed in as ${user.name || user.email || 'Google user'}`;
      },
      error: (err) => {
        console.error('Google sign-in failed:', err);
        this.signInError = 'Google sign-in failed';
        this.signInMessage = '';
      },
    });
  }
}
